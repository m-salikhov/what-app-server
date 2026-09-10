import type { Browser, Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import type { Question } from "../entities/question.entity";
import type { Tournament } from "../entities/tournament.entity";
import { imageDimensionsFromStream } from "image-dimensions";
import stealthPlugin from "puppeteer-extra-plugin-stealth";
import { Pack } from "../Types/GotQuestionsTypes";
import { NotFoundException } from "@nestjs/common";

function removeTrailingDot(str: string): string {
	if (str.endsWith(".")) {
		return str.slice(0, -1);
	}
	return str;
}

const gotQuestionLink = "https://gotquestions.online";

puppeteer.use(stealthPlugin());

export const parseTournamentGotquestions = async (link: string) => {
	let browser: Browser | undefined;
	let page: Page | undefined;

	try {
		browser = await puppeteer.launch({
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
			headless: true,
		});
		page = await browser.newPage();
		// Переходим на нужный сайт
		const response = await page.goto(link, { waitUntil: "networkidle2", timeout: 50000 });

		if (!response || response.status() !== 200) {
			throw new Error(`Response status: ${response?.status()}`);
		}
		// если нужен лог внутри evaluate
		page.on("console", (msg) => {
			console.log("Browser console:", msg.text());
		});

		const packData: Pack | null = await page.evaluate(() => {
			const scripts = document.querySelectorAll("script");
			for (const script of scripts) {
				const content = script.textContent;
				if (!content.includes("self.__next_f.push")) continue;

				// Ищем "pack" (независимо от кавычек)
				let idx = content.indexOf("pack");

				while (idx !== -1) {
					// Двигаемся от позиции после "pack" до двоеточия
					let pos = idx + 4; // длина "pack"
					while (
						pos < content.length &&
						(content[pos] === " " || content[pos] === '"' || content[pos] === "\\")
					) {
						pos++;
					}
					if (pos < content.length && content[pos] === ":") {
						// Нашли двоеточие, теперь ищем первую '{' после него
						let start = pos + 1;
						while (start < content.length && content[start] !== "{") start++;
						if (start < content.length) {
							// Извлекаем объект с учётом вложенности
							let depth = 0;
							let i = start;
							for (; i < content.length; i++) {
								const ch = content[i];
								if (ch === "{") depth++;
								else if (ch === "}") {
									depth--;
									if (depth === 0) break;
								}
							}
							if (i < content.length) {
								let jsonStr = content.substring(start, i + 1);
								if (jsonStr.length > 1000) {
									// Удаляем экранирующие / перед кавычками
									jsonStr = jsonStr.replace(/(?<!\\)\\"/g, '"');

									try {
										const result = JSON.parse(jsonStr);
										return result;
									} catch (e) {
										if (e instanceof SyntaxError) {
											console.error("SyntaxError:", e.message);
											// Извлекаем позицию ошибки
											const match = e.message.match(/position (\d+)/);
											if (match) {
												const pos = Number(match[1]);
												const start = Math.max(0, pos - 100);
												const end = Math.min(jsonStr.length, pos + 100);
												const snippet = jsonStr.substring(start, end);
												console.error("Фрагмент вокруг ошибки (позиция", pos, "):", snippet);
												console.error("Длина строки:", jsonStr.length);
											}
										}
									}
								}
							}
						}
					}
					// Ищем следующее вхождение "pack"
					idx = content.indexOf("pack", idx + 1);
				}
			}
			return null;
		});

		if (!packData) throw new Error("Failed to extract pack data");

		const questionsQuantity = packData.tours.reduce(
			(acc, tour) =>
				acc + tour.questions.reduce((acc, question) => (question.number > 0 ? acc + 1 : acc), 0),
			0,
		);

		let difficulty = 0;
		if (packData.truedls && packData.truedls.length > 0) {
			difficulty = Math.round(packData.truedls[0] * 10) / 10;
		}

		const editors = packData.editors.map((ed) => {
			return {
				id: ed.personId,
				name: ed.person.name,
			};
		});

		const questions: Tournament["questions"] = [];

		for (let tourNumber = 0; tourNumber < packData.tours.length; tourNumber++) {
			const tour = packData.tours[tourNumber];

			for (const question of tour.questions) {
				let author = "";
				if (question.authors && question.authors.length > 0) {
					const authorsNames = question.authors.map((author) => author.person.name);
					author = authorsNames.join(", ");
				}

				let answerRatio = "";
				if (packData.teams.length > 0 && question.correctAnswers.length > 0) {
					answerRatio = `${question.correctAnswers[0]}/${packData.teams[0]} · ${Math.round((question.correctAnswers[0] / packData.teams[0]) * 100)}%`;
				}

				let source = [{ id: 1, link: "не указан" }];
				if (question.source) {
					const regex = /(?:^|\\n|\r?\n)\s*\d+[.)]\s*/g;
					const links = question.source
						.split(regex)
						// Убираем лишние пробелы и точки в начале и конце
						.map((item) => item.replace(/^[. ]+|[. ]+$/g, ""))
						.filter((item) => item.length > 0);

					source = links.map((link, i) => ({ id: i, link: link }));
				}

				let add = "";
				if (question.razdatkaPic) {
					add = gotQuestionLink + question.razdatkaPic;
				} else if (question.razdatkaText) {
					add = question.razdatkaText;
				}

				const q: Question = {
					id: question.id,
					qNumber: question.number,
					tourNumber: tourNumber + 1,
					author,
					add,
					addMetadata: null,
					text: question.text,
					answer: removeTrailingDot(question.answer),
					alterAnswer: removeTrailingDot(question.zachet),
					comment: question.comment,
					type: question.number > 0 ? "regular" : "outside",
					answerRatio,
					source,
				};

				questions.push(q);
			}
		}

		// Закрываем браузер
		await browser.close();

		// определение размеров картинок в вопросах
		await Promise.allSettled(
			questions.map(async (question) => {
				if (!question.add.startsWith("http")) return;

				try {
					const { body } = await fetch(question.add);
					if (!body) throw new Error(`No response body: ${question.id} ${question.add}`);

					const dimensions = await imageDimensionsFromStream(body);
					if (!dimensions)
						throw new Error(`Cant determine image dimensions: ${question.id} ${question.add}`);

					question.addMetadata = {
						id: 1,
						type: dimensions.type,
						width: dimensions.width,
						height: dimensions.height,
					};
				} catch (err) {
					console.error(`Ошибка для вопроса ${question.id}:`, err);
				}
			}),
		);

		// сборка турнира
		const tournament: Tournament = {
			id: 0,
			uploader: "",
			uploaderUuid: "",
			title: removeTrailingDot(packData.longTitle || packData.title),
			link,
			date: new Date(packData.startDate),
			tours: packData.tours.length,
			difficulty,
			questionsQuantity,
			dateUpload: new Date(),
			status: "draft",
			editors,
			questions,
		};

		return tournament;
	} catch (err) {
		console.error(err);
		// throw new NotFoundException("Турнир не найден");
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
