import * as cheerio from 'cheerio';
import { QuestionDto } from '../dto/question.dto';
import getTourNumber from './getTourNumber';
import { TournamentDto } from '../dto/tournament.dto';
import { NotFoundException } from '@nestjs/common';

enum AnsClasses {
  Answer = 'Answer',
  Comment = 'Comments',
  AlterAnswer = 'PassCriteria',
  Author = 'Authors',
  Source = 'Sources',
}

const parseTournamentHTML = async (html: string) => {
  const questions: QuestionDto[] = [];

  const $ = cheerio.load(html);

  //проверка открылась ли нужная страница на самом сайте базы чгк
  const test = $('#site-slogan').text();
  if (test) {
    throw new NotFoundException('Неверно указана ссылка на страницу турнира');
  }

  //название турнира
  const title = $('h1').text();

  //обработка текста обычного вопроса без радаток или раздатка картинокй лежит в первом р и иницилизация вопроса
  const $qsText = $('.question p:first-child');
  $qsText.each((i, elem) => {
    const questionText = $(elem)
      .text()
      .replace(/(\r\n|\n|\r|&nbsp|\.\.\.|Вопрос \d+:\s)/gm, '')
      .replace(/\s\s+/g, ' ')
      .trim();

    questions[i] = {
      text: questionText || '',
      answer: '',
      comment: '',
      qNumber: 0,
      tourNumber: 0,
      source: [],
      author: '',
      type: 'regular',
    };
  });

  //Добавление номера вопроса. Нельзя использовать просто индекс так как бывает вопросы 0, 00 и т.п.
  const $Question = $('.Question');
  $Question.each((i, elem) => {
    const n = +$(elem).text().slice(7, -1);
    questions[i].qNumber = n;
  });

  //помечает нулевые вопросы нужным типом
  questions.forEach((v) => {
    if (v.qNumber < 1) v.type = 'outside';
  });

  //добавление картинки, когда картинка лежит в первом p без класса razdatka
  $qsText.each((i, elem) => {
    if ($(elem).find('img').attr('src')) {
      questions[i].add = $(elem).find('img').attr('src');
    }
  });

  //обработка вопроса с раздаткой, если есть класс razdatka
  const $qs = $('.question');
  $qs.each((i, elem) => {
    const razdatka = $(elem).find('.razdatka');

    //Добавление картинки
    const razdatkaImg = $(elem).find('.razdatka img').attr('src');
    if (razdatkaImg) {
      questions[i].add = razdatkaImg;
    } else if (!razdatkaImg && razdatka.length) {
      questions[i].add = $(razdatka)
        .text()
        .replace(/(\r\n|\n|\r|&nbsp|\.\.\.|Раздаточный материал)/gm, '')
        .replace(/\s\s+/g, ' ')
        .trim();
    }

    //Добавляет текст (и картинка и без)
    if (razdatka.length) {
      const questionChildNodes = elem.childNodes;
      questionChildNodes.forEach((v) => {
        if (v.type === 'text' && $(v).text().trim()) {
          questions[i].text = $(v).text().trim();
        }
      });
    }
  });

  //обрабатывает блок ответа: ответ, комментарий, зачёт, автор, источники
  const $answerBlock = $('.question .collapsible');
  $answerBlock.each((i, elem) => {
    const ansParagraphs = $(elem).children('p');

    ansParagraphs.each((k, v) => {
      const ansClass = $(v).find('strong').attr('class');

      switch (ansClass) {
        case AnsClasses.Answer:
          questions[i].answer = $(v)
            .text()
            .replace(/(\r\n|\n|\r|&nbsp|\.\.\.|Ответ:\s)/gm, '')
            .replace(/\s\s+/g, ' ')
            .trim();
          break;

        case AnsClasses.AlterAnswer:
          questions[i].alterAnswer = $(v)
            .text()
            .replace(/(\r\n|\n|\r|&nbsp|\.\.\.|Зачёт:\s)/gm, '')
            .replace(/\s\s+/g, ' ')
            .trim();
          break;

        case AnsClasses.Author:
          questions[i].author = $(v)
            .text()
            .replace(/(\r\n|\n|\r|&nbsp|\.\.\.|Автор(:|ы:)\s)/gm, '')
            .replace(/\s\s+/g, ' ')
            .trim();
          break;

        case AnsClasses.Source:
          const sourceStr = $(v)
            .text()
            .replace(/(\r\n|\n|\r|&nbsp|\.\.\.|Источник\(и\):)/gm, '')
            .replace(/\s\s+/g, ' ')
            .trim();

          //если источников больше одного
          const flag = /^1.\s/.test(sourceStr);
          if (!flag) {
            questions[i].source = [sourceStr];
          } else {
            const sourceArr = sourceStr.split(/(^|\s)\d.\s/);
            const sourceArrNorm = sourceArr.filter((v) => {
              const s = v.trim();
              if (s) return s;
            });

            questions[i].source = sourceArrNorm;
          }
          break;

        case AnsClasses.Comment:
          questions[i].comment = $(v)
            .text()
            .replace(/(\r\n|\n|\r|&nbsp|\.\.\.|Комментарий:\s)/gm, '')
            .replace(/\s\s+/g, ' ')
            .trim();
          break;
        default:
          break;
      }
    });
  });

  //Чистка текста вопроса от фразы "Раздаточный материал" при нестандартной вёрстке
  questions.forEach((q, i) => {
    const startString = q.text.indexOf('Раздаточный материал: ');
    if (startString === -1) return;

    const textWithAddBlock: string = q.text.slice(
      startString + 'Раздаточный материал: '.length,
    );

    const haveAdd = !textWithAddBlock.includes('[ ]');

    if (!haveAdd) {
      questions[i].text = textWithAddBlock.slice(3).trim();
      return;
    }

    const endAddBlock = textWithAddBlock.indexOf(']');
    const qAdd = textWithAddBlock.slice(1, endAddBlock).trim();
    questions[i].add = qAdd;
  });

  //Чистка ответа и зачёта от точек в конце
  questions.forEach((q, i) => {
    if (q.answer.at(-1) === '.') {
      questions[i].answer = q.answer.slice(0, -1);
    }
    if (q.alterAnswer && q.alterAnswer.at(-1) === '.') {
      questions[i].alterAnswer = q.alterAnswer.slice(0, -1);
    }
  });

  //количество вопросов в турнире, не считая нулевые
  let questionsQuantity = 0;
  questions.forEach((v) => {
    if (v.type !== 'outside') questionsQuantity++;
  });

  //кол-во туров в турнире. h2 используется только для разбивки по турам
  let tours = 0;
  const $tours = $('h2');
  $tours.each((i, elem) => {
    const tourText = $(elem).text();
    if (tourText.match(/тур|блок/gi)) tours++;
  });

  //Добавляет сквозную нумерацию вопросов при необходимости
  if (questionsQuantity - questions.at(-1).qNumber) {
    let currentNumber = 0;
    questions.forEach((v) => {
      if (v.qNumber > 0) {
        v.qNumber = ++currentNumber;
      }
    });
  }

  //добавляет номер тура к каждому вопросу
  questions.forEach((v) => {
    v.tourNumber = getTourNumber(questionsQuantity, tours, v.qNumber);
  });

  //список редакторов
  const $editors = $('.editor');
  const editorsText: string[] = $editors
    .text()
    .replace(/редактор:|редакторы:/gi, '%')
    .split('% ')
    .slice(1);
  const editors =
    editorsText.length > 0 ? [...new Set(editorsText)] : ['Редактор не указан'];

  //дата отыгрыша
  let date = 0;
  const dateTextSplited = $('p')
    .first()
    .text()
    .trim()
    .slice(6, 17)
    .split(/\D/g);
  if (dateTextSplited[0].length === 4) {
    date = Date.parse(dateTextSplited.join('.'));
  } else {
    date = Date.parse(dateTextSplited.reverse().join('.'));
  }
  if (!date) {
    date = Date.now();
  }

  //сборка турнира
  const t: Omit<TournamentDto, 'uploaderUuid' | 'uploader' | 'link'> = {
    title,
    date,
    questionsQuantity,
    tours,
    editors,
    dateUpload: Date.now(),
    questions,
  };

  return t;
};

export default parseTournamentHTML;
