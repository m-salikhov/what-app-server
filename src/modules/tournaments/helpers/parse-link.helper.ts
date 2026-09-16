import type { Browser, Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import type { Question } from "../entities/question.entity";
import type { Tournament } from "../entities/tournament.entity";
import { imageDimensionsFromStream } from "image-dimensions";
import stealthPlugin from "puppeteer-extra-plugin-stealth";
import { Pack } from "../Types/GotQuestionsTypes";

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
			function unescapeDeep<T>(value: T): T {
				if (typeof value === "string") {
					// Разэкранируем оставшиеся последовательности из вложенного JSON
					const unescaped = value
						.replace(/\\n/g, "\n")
						.replace(/\\r/g, "\r")
						.replace(/\\t/g, "\t")
						.replace(/\\"/g, '"');
					return unescaped as T;
				}
				if (Array.isArray(value)) {
					return value.map((v) => unescapeDeep(v)) as T;
				}
				if (value !== null && typeof value === "object") {
					const obj = value as Record<string, unknown>;
					for (const key of Object.keys(obj)) {
						obj[key] = unescapeDeep(obj[key]);
					}
					return value;
				}
				return value;
			}
			const scripts = document.querySelectorAll("script");
			for (const script of scripts) {
				const content = script.textContent;
				if (!content) continue;
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
							// Извлекаем объект с учётом вложенности И строковых литералов
							let depth = 0;
							let inString = false;
							let pendingEscape = false; // true, когда в JSON-тексте предыдущий символ был \
							let i = start;
							while (i < content.length) {
								const ch = content[i];

								// Разбираем JS-escape последовательность в исходнике
								if (ch === "\\" && i + 1 < content.length) {
									const next = content[i + 1];
									let valueChar: string;
									if (next === "n") valueChar = "\n";
									else if (next === "t") valueChar = "\t";
									else if (next === "r") valueChar = "\r";
									else if (next === '"') valueChar = '"';
									else if (next === "\\") valueChar = "\\";
									else valueChar = next;
									i += 2;

									if (pendingEscape) {
										// этот символ экранирован в JSON-тексте — не влияет на состояние строки
										pendingEscape = false;
										continue;
									}
									if (valueChar === "\\") {
										// в JSON-тексте это начало escape-последовательности
										pendingEscape = true;
										continue;
									}
									if (valueChar === '"') {
										inString = !inString;
									}
									continue;
								}

								i++;
								if (pendingEscape) {
									pendingEscape = false;
									continue;
								}
								if (inString) continue;
								if (ch === "{") depth++;
								else if (ch === "}") {
									depth--;
									if (depth === 0) break;
								}
							}

							if (depth === 0 && i > start) {
								let jsonStr = content.substring(start, i);

								if (jsonStr.length > 1000) {
									// Удаляем экранирующий \ перед кавычками
									jsonStr = jsonStr.replace(/(?<!\\)\\"/g, '"');

									try {
										const result = JSON.parse(jsonStr);
										return unescapeDeep(result);
									} catch (e) {
										console.log(e);
										if (e instanceof SyntaxError) {
											console.log("SyntaxError:", e.message);
											const match = e.message.match(/position (\d+)/);
											if (match) {
												const posErr = Number(match[1]);
												const startS = Math.max(0, posErr - 100);
												const endS = Math.min(jsonStr.length, posErr + 100);
												const snippet = jsonStr.substring(startS, endS);
												console.error("Фрагмент вокруг ошибки (позиция", posErr, "):", snippet);
												console.error("Длина строки:", jsonStr.length);
											}
											throw e;
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

		const { questionsQuantity, toursQuantity } = packData.tours.reduce(
			(acc, tour) => {
				if (tour.number > 0) {
					acc.questionsQuantity += tour.questions.length;
					acc.toursQuantity += 1;
				}
				return acc;
			},

			{ questionsQuantity: 0, toursQuantity: 0 },
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

		for (const tour of packData.tours) {
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
					add = question.razdatkaText.replace(/\\n/g, "\n");
				}

				const q: Question = {
					id: question.id,
					qNumber: question.number,
					tourNumber: tour.number,
					author,
					add,
					addMetadata: null,
					text: question.text.replace(/\\n/g, "\n"),
					answer: removeTrailingDot(question.answer).replace(/\\n/g, "\n"),
					alterAnswer: removeTrailingDot(question.zachet),
					comment: question.comment.replace(/\\n/g, "\n"),
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
			tours: toursQuantity,
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
		throw err;
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
