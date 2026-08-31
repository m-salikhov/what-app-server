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
		await page.goto(link, { waitUntil: "networkidle2", timeout: 50000 });

		// если нужен лог внутри evaluate
		page.on("console", (msg) => {
			console.log("Browser console:", msg.text());
		});

		// нажимаем кнопку, чтобы открыть ответы
		const button = await page.$('button[aria-label="Развернуть все"]');
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

		// извлекаем сложность и дату отыгрыша из боковой панели
		const { difficulty, dateStr } = await page.evaluate(() => {
			const asideInfoStrings = Array.from(
				document.querySelectorAll("aside div.flex.justify-between.py-0\\.5"),
				(div) => {
					return div.textContent;
				},
			);

			let difficulty = 0;
			const difficultyStr = asideInfoStrings.find((str) => str.includes("TrueDL"));
			if (difficultyStr) {
				const difficultyString = difficultyStr.replace("TrueDL", "").trim().split(" · ")[0];
				difficulty = /^\d+(\.\d+)?$/.test(difficultyString) ? Number(difficultyString) : 0;
			}

			let dateStr = asideInfoStrings.find((str) => str.includes("Начало")) ?? "";
			if (dateStr) {
				dateStr = dateStr.replace("Начало", "").trim();
			}

			return { difficulty, dateStr };
		});
		const date = parseDate(dateStr);

		// Извлекаем данные для редакторов
		const editors = await page.evaluate(() => {
			const editors: Editor[] = [];
			const a = document.querySelectorAll("aside span.font-medium a");

			a.forEach((e, i) => {
				const name = e.textContent.trim();
				editors.push({ name, id: i + 1 });
			});

			return editors;
		});

		// Извлекаем данные для вопросов
		const questions = await page.evaluate(() => {
			const questions: Question[] = [];
			// Находим все блоки вопросов
			const questionsNodeList = Array.from(
				document.querySelectorAll(
					"div.bg-surface-container-low.rounded-2xl:has(a[href*='/question/'])",
				),
			);

			questionsNodeList.forEach((element, i) => {
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
					} else if (textContent.startsWith("Зачет:")) {
						q.alterAnswer = textContent
							.replace("Зачет:", "")
							.trim()
							.replace(/[.\s]+$/, "");
					} else if (textContent.startsWith("Комментарий:")) {
						q.comment = textContent.replace("Комментарий:", "").trim();
					} else if (textContent.startsWith("Источник:")) {
						const sources = textContent
							.replace("Источник:", "")
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
				const elementAnswerRatio = element.querySelector('div[aria-label="Процент взятия"] span');
				let answerRatio = "";
				if (elementAnswerRatio) {
					const nums = elementAnswerRatio.textContent.match(/[0-9]+/g) || [];
					if (nums.length === 2) {
						answerRatio = `${+nums[0]}/${+nums[1]} · ${Math.round((+nums[0] / +nums[1]) * 100)}%`;
					}
				}

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
			const elements = document.querySelectorAll("h2");

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

		// Закрываем браузер
		await browser.close();

		// определение размеров картинок в вопросах
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
					id: 1,
					type: dimensions.type,
					width: dimensions.width,
					height: dimensions.height,
				};
			} catch (err) {
				console.error(err);
			}
		}

		// сборка турнира
		const t: Tournament = {
			id: 0,
			title: removeTrailingDot(title),
			link,
			date,
			tours,
			questionsQuantity,
			difficulty,
			uploader: "",
			uploaderUuid: "",
			dateUpload: new Date(),
			status: "draft",
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
