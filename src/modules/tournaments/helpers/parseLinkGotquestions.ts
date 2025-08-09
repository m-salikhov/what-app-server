import puppeteer from 'puppeteer';
import getTourNumber from './getTourNumber';
import { convertGQdateToMs } from './convertGQdateToMs';
import { Question } from '../entities/question.entity';
import { Tournament } from '../entities/tournament.entity';

function removeTrailingDot(str: string): string {
  if (str.endsWith('.')) {
    return str.slice(0, -1);
  }
  return str;
}

export const parseTournamentGotquestions = async (link: string) => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  // Переходим на нужный сайт
  await page.goto(link, { waitUntil: 'networkidle0', timeout: 50000 });

  // Нажимаем на кнопку, чтобы открылись блоки ответов
  await page.click('button[title="Показать/скрыть все ответы"]');

  // если нужен лог внутри evaluate
  page.on('console', (msg) => {
    console.log('Browser console:', msg.text());
  });

  // Извлекаем название
  const title = await page.evaluate(() => {
    return document.querySelector('h1').textContent;
  });

  // проверяем есть ли Сложность и извлекаем
  const isExist =
    (await page.$('div.p-4 div.justify-between:has(span.font-light)')) !== null;
  let difficulty: string | number = 0;

  if (isExist) {
    const element = await page.$(
      'div.p-4 div.justify-between:has(span.font-light)',
    );
    const text = await element?.evaluate((el) => el.textContent);
    const match = text?.match(/DL(\d+(?:\.\d+)?)/);
    difficulty = match ? match[1] : 0;
  }

  if (difficulty !== 0) {
    difficulty = Number(difficulty);
  }

  // Извлекаем данные для редакторов
  const editors = await page.evaluate(() => {
    const editors = [];
    const a = document.querySelectorAll('.pb-1 a');

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
    const elements = document.querySelectorAll('[number]');

    elements.forEach((element, i) => {
      let q: Question = {
        id: i + 1,
        qNumber: 0,
        tourNumber: 0,
        author: '',
        text: '',
        answer: '',
        comment: 'не указан',
        type: 'regular',
        source: [{ id: 1, link: 'не указан' }],
      };

      // имя автора лежит последней ссылкой в блоке вопроса
      const authorElement = element.querySelector('[href*="/person/"]');
      const author = authorElement
        ? authorElement.textContent.trim()
        : 'не указан';

      // номер вопроса
      const qNumber = +element
        .querySelector('[href*="/question/"]')
        .textContent.replace('Вопрос ', '');

      // если номер вопроса не определен или ноль, то вопрос считаем вне турнира
      if (!qNumber) {
        q.type = 'outside';
      }

      // раздатка
      const addBlockFull = element.querySelector(
        '.flex.items-end.justify-between.pt-1.pb-2 + div',
      );
      const addElement = addBlockFull.querySelector(
        '.relative.border.border-dotted.border-ntr.p-2.my-1',
      );
      if (addElement) {
        const textAdd = addElement.querySelector('span');
        const imgAdd = addElement.querySelector('img');
        if (imgAdd) {
          q.add = imgAdd.src;
        } else if (textAdd) {
          q.add = textAdd.textContent;
        }
      }

      // блоки с текстом (вопрос, ответ, зачёт, комментарий, источники)
      const textBlocks = element.querySelectorAll('div.whitespace-pre-wrap');

      const text = textBlocks[0].textContent;
      textBlocks.forEach((block, i) => {
        if (block.textContent.startsWith('Ответ:')) {
          q.answer = block.textContent.replace('Ответ:', '').trim();
        }

        if (block.textContent.startsWith('Зачёт:')) {
          q.alterAnswer = block.textContent.replace('Зачёт:', '').trim();
        }

        if (block.textContent.startsWith('Комментарий:')) {
          q.comment = block.textContent.replace('Комментарий:', '').trim();
        }

        if (block.textContent.startsWith('Источники:')) {
          const sources = block.textContent
            .replace('Источники:', '')
            .trim()
            .split('\n')
            .map((s) => s.trim())
            .map((s, i) => ({ link: s, id: i + 1 }));

          if (sources.length === 1) {
            q.source = sources;
          } else if (sources.length > 1) {
            q.source = sources.map((s, i) => ({
              ...s,
              link: /^\d/.test(s.link) ? s.link.slice(2).trim() : s.link,
            }));
          } else {
            q.source = [
              {
                id: 1,
                link: 'Источник не указан',
              },
            ];
          }
        }
      });

      questions.push({
        ...q,
        qNumber,
        text,
        author,
      });
    });

    return questions;
  });

  const tours = await page.evaluate(() => {
    let tours = 0;
    const elements = document.querySelectorAll('h3');

    elements.forEach((element) => {
      if (element.textContent.startsWith('Тур')) {
        tours++;
      }
    });

    return tours;
  });

  let questionsQuantity = 0;
  questions.forEach((v) => {
    if (v.type !== 'outside') questionsQuantity++;
  });

  questions.forEach((v) => {
    v.tourNumber = getTourNumber(questionsQuantity, tours, v.qNumber);
  });

  const date = await page.evaluate(() => {
    const divs = document.querySelectorAll('.p-4 .flex.justify-between');

    return divs[1].textContent.slice(6).trim();
  });

  // Закрываем браузер
  await browser.close();

  //сборка турнира
  const t: Tournament = {
    id: 0,
    title: removeTrailingDot(title),
    tours,
    questionsQuantity,
    date: convertGQdateToMs(date),
    link,
    uploader: '',
    uploaderUuid: '',
    dateUpload: 0,
    difficulty,
    editors,
    questions,
  };

  return t;
};
