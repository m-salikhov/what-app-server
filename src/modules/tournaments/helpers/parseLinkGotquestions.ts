import { NotFoundException } from '@nestjs/common';
import { QuestionDto } from '../dto/question.dto';
import puppeteer from 'puppeteer';
import getTourNumber from './getTourNumber';
import { convertGQdateToMs } from './convertGQdateToMs';
import { TournamentDto } from '../dto/tournament.dto';

function replaceSpacesWithDots(inputText: string) {
  // Заменяем пробелы на точки и добавляем точку в начале
  const modifiedText = '.' + inputText.replace(/ /g, '.');
  return modifiedText;
}

export const parseTournamentGotquestions = async (link: string) => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  // Переходим на нужный сайт
  await page.goto(link, { waitUntil: 'networkidle0' });

  // Нажимаем на кнопку, чтобы открылись блоки ответов
  await page.click(
    replaceSpacesWithDots(
      'cursor-pointer text-2xl flex items-center justify-center min-w-10 h-10 rounded-full text-primary font-icons notranslate',
    ),
  );

  const title = await page.evaluate(() => {
    return document.querySelector('h1').textContent;
  });

  const editors = await page.evaluate(() => {
    const editors = [];
    const a = document.querySelectorAll('.p-4 .pb-1 a');

    a.forEach((e, i) => {
      const name = e.textContent;
      editors.push({ name, id: i + 1 });
    });

    return editors;
  });

  // Извлекаем данные для вопросов
  const questions = await page.evaluate(() => {
    const questions: QuestionDto[] = [];

    // Находим все блоки вопросов
    const elements = document.querySelectorAll(
      '.break-words.block.w-full.qScroll',
    );

    elements.forEach((element, i) => {
      let q: QuestionDto = {
        id: i + 1,
        qNumber: 0,
        tourNumber: 0,
        author: '',
        text: '',
        answer: '',
        comment: '',
        type: 'regular',
        source: [],
      };

      // имя автора лежит последней ссылкой в блоке вопроса
      const a = element.querySelectorAll('a');
      q.author = a[a.length - 1].textContent;

      // номер вопроса
      const qNumber = +a[0].textContent.replace('Вопрос ', '');
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
          q.add = imgAdd.getAttribute('src');
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

          if (sources.length > 1) {
            q.source = sources.map((s, i) => ({
              ...s,
              link: s.link.slice(2).trim(),
            }));
          } else {
            q.source = sources;
          }
        }
      });

      questions.push({
        ...q,
        qNumber,
        text,
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
  const t: TournamentDto & { id: number } = {
    id: 0,
    title,
    tours,
    questionsQuantity,
    date: convertGQdateToMs(date),
    link,
    uploader: '',
    uploaderUuid: '',
    dateUpload: 0,
    editors,
    questions,
  };

  return t;
};
