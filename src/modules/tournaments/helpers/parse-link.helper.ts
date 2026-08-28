import puppeteer, { Browser, Page } from "puppeteer";
import type { Question } from "../entities/question.entity";
import type { Tournament } from "../entities/tournament.entity";
import { parseDate } from "./parse-date.helper";
import { Editor } from "../entities/editors.entity";
import { imageDimensionsFromStream } from "image-dimensions";

function removeTrailingDot(str: string): string {
	if (str.endsWith(".")) {
		return str.slice(0, -1);
	}
	return str;
}

const getTourNumber = (questionsQuantity: number, tours: number, qNumber: number) => {
	const remainder = questionsQuantity % tours;
	const tourLength = (questionsQuantity - remainder) / tours;

	if (qNumber <= questionsQuantity - remainder) {
		return Math.ceil(qNumber / tourLength);
	} else {
		return tours;
	}
};

export const parseTournamentGotquestions = async (link: string) => {
	let browser: Browser | undefined;
	let page: Page | undefined;

	try {
		browser = await puppeteer.launch({
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
		});
		page = await browser.newPage();

		// Переходим на нужный сайт
		await page.goto(link, { waitUntil: "networkidle0", timeout: 50000 });

		// если нужен лог внутри evaluate
		page.on("console", (msg) => {
			console.log("Browser console:", msg.text());
		});

		// нажимаем кнопку, чтобы открыть ответы
		const button = await page.$('button[title="Показать/скрыть все ответы"]');
		await page.evaluate((button) => {
			if (!button) return;
			const rect = button.getBoundingClientRect();
			const event = new MouseEvent("click", {
				view: window,
				bubbles: true,
				cancelable: true,
				clientX: rect.left + rect.width / 2,
				clientY: rect.top + rect.height / 2,
			});

			button.dispatchEvent(event);
		}, button);

		// Извлекаем название
		const title = await page.evaluate(() => {
			return document.querySelector("h1")?.textContent || "";
		});

		// проверяем есть ли Сложность и извлекаем
		const isExist = (await page.$("div.p-4 div.justify-between:has(span.font-light)")) !== null;
		let difficulty: string | number = 0;

		if (isExist) {
			const element = await page.$("div.p-4 div.justify-between:has(span.font-light)");
			const text = await element?.evaluate((el) => el.textContent);
			const match = text?.match(/DL(\d+(?:\.\d+)?)/);
			difficulty = match ? match[1] : 0;
		}

		if (difficulty !== 0) {
			difficulty = Number(difficulty);
		}

		// Извлекаем данные для редакторов
		const editors = await page.evaluate(() => {
			const editors: Editor[] = [];
			const a = document.querySelectorAll(".pb-1 a");

			a.forEach((e, i) => {
				const name = e.textContent;
				editors.push({ name, id: i + 1 });
			});

			return editors;
		});

		// Извлекаем данные для вопросов
		const questions = await page.evaluate(() => {
			const questions: Question[] = [];
			// Находим все блоки вопросов
			const elements = document.querySelectorAll("[number]");

			elements.forEach((element, i) => {
				const q: Question = {
					id: i + 1,
					qNumber: 0,
					tourNumber: 0,
					author: "",
					add: "",
					addMetadata: null,
					text: "",
					answer: "",
					alterAnswer: "",
					comment: "не указан",
					type: "regular",
					answerRatio: "",
					source: [{ id: 1, link: "не указан" }],
				};

				// имя автора лежит последней ссылкой в блоке вопроса
				const authorElement = element.querySelector('[href*="/person/"]');
				const author = authorElement ? authorElement.textContent.trim() : "не указан";

				// номер вопроса
				let qNumber = 0;
				const qNumberElement = element.querySelector('[href*="/question/"]');
				if (qNumberElement) {
					qNumber = +qNumberElement.textContent.replace("Вопрос ", "");
				}

				// если номер вопроса не определен или ноль, то вопрос считаем вне турнира
				if (!qNumber) {
					q.type = "outside";
				}

				// Раздатка. Если есть раздатка, то в первом спане будет текст "раздаточный"
				const addElement = element.querySelector("span");
				const isAddExist = addElement
					? addElement.textContent.toLowerCase().includes("раздаточный")
					: false;

				if (isAddExist) {
					const span = element.querySelector("span");
					if (!span) return;
					// тело раздатки лежит в следующем диве
					const addContainer = span.nextElementSibling;

					if (!addContainer) return;

					// раздатка может быть либо картинкой, либо текстом
					// пробуем вытянуть картинку
					const image = addContainer.querySelector("img");

					if (image) {
						q.add = image.src;
					} else {
						q.add = addContainer.querySelector("span")?.textContent ?? "";
					}
				}

				// блоки с текстом (вопрос, ответ, зачёт, комментарий, источники)
				const textBlocks = element.querySelectorAll("div.whitespace-pre-wrap");

				const text = textBlocks[0].textContent;

				textBlocks.forEach(({ textContent }) => {
					if (textContent.startsWith("Ответ:")) {
						q.answer = textContent
							.replace("Ответ:", "")
							.trim()
							.replace(/[.\s]+$/, "");
					} else if (textContent.startsWith("Зачёт:")) {
						q.alterAnswer = textContent
							.replace("Зачёт:", "")
							.trim()
							.replace(/[.\s]+$/, "");
					} else if (textContent.startsWith("Комментарий:")) {
						q.comment = textContent.replace("Комментарий:", "").trim();
					} else if (textContent.startsWith("Источники:")) {
						const sources = textContent
							.replace("Источники:", "")
							.trim()
							.split("\n")
							.map((s, i) => ({ link: s.trim(), id: i + 1 }));

						if (sources.length === 1) {
							q.source = sources;
						} else if (sources.length > 1) {
							q.source = sources.map((s) => ({
								...s,
								link: /^\d/.test(s.link) ? s.link.slice(2).trim() : s.link,
							}));
						} else {
							q.source = [
								{
									id: 1,
									link: "Источник не указан",
								},
							];
						}
					}
				});

				// процент правильных ответов
				const elementAnswerRatio = element.querySelector("div.mb-2");
				const answerRatio = elementAnswerRatio
					? elementAnswerRatio.textContent.replace(" ", "")
					: "";

				questions.push({
					...q,
					qNumber,
					text,
					author,
					answerRatio,
				});
			});

			return questions;
		});

		// Подсчёт количества вопросов. Только входящие в основную дисциплину
		let questionsQuantity = 0;
		questions.forEach((v) => {
			if (v.type !== "outside") questionsQuantity++;
		});

		// Подсчёт количества туров
		let tours = await page.evaluate(() => {
			let tours = 0;
			const elements = document.querySelectorAll("h3");

			elements.forEach((element) => {
				const text = element.textContent.toLowerCase();
				if (text.includes("тур") || text.includes("блок")) {
					tours++;
				}
			});

			return tours;
		});
		if (tours === 0) {
			// Если разбивка на туры не определена, то считаем по 12 вопросов
			tours = Math.ceil(questionsQuantity / 12);
		}

		// Подсчёт номера тура для каждого вопроса
		questions.forEach((v) => {
			v.tourNumber = getTourNumber(questionsQuantity, tours, v.qNumber);
		});

		const date = await page.evaluate(() => {
			const divs = document.querySelectorAll(".p-4 .flex.justify-between");

			return divs[1].textContent.slice(6).trim();
		});

		// Закрываем браузер
		await browser.close();

		for (const question of questions) {
			if (!question.add.startsWith("http")) continue;

			try {
				const { body } = await fetch(question.add);

				if (!body) {
					throw new Error(`No response body: ${question.id} ${question.add}`);
				}

				const dimensions = await imageDimensionsFromStream(body);

				if (!dimensions) {
					throw new Error(`Cant determine image dimensions: ${question.id} ${question.add}`);
				}

				question.addMetadata = {
					type: dimensions.type,
					width: dimensions.width,
					height: dimensions.height,
				};
			} catch (err) {
				console.error(err);
			}
		}

		console.log(questions);

		//сборка турнира
		const t: Tournament = {
			id: 0,
			title: removeTrailingDot(title),
			date: parseDate(date),
			uploader: "",
			uploaderUuid: "",
			dateUpload: new Date(),
			status: "draft",
			link,
			tours,
			questionsQuantity,
			difficulty,
			editors,
			questions,
		};
		return t;
	} finally {
		if (browser) {
			try {
				await browser.close();
			} catch (err) {
				console.error("Ошибка при закрытии браузера:", err);
			}
		}
	}
};
