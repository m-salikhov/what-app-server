import axios from 'axios';
import * as cheerio from 'cheerio';
import { QuestionDto } from '../dto/question.dto';
import getTourNumber from './getTourNumber';
import { TournamentDto } from '../dto/tournament.dto';

enum AnsClasses {
  Answer = 'Answer',
  Comment = 'Comments',
  AlterAnswer = 'PassCriteria',
  Author = 'Authors',
  Source = 'Sources',
}

const parseLink = async (link: string) => {
  const questions: Omit<QuestionDto, 'id'>[] = [];

  const html = await axios.get(link).then((res) => res.data);
  const $ = cheerio.load(html);

  //название турнира
  const title = $('h1').text();

  //обработка текста обычного вопроса без радаток(также учитывает случай когда раздатка картинокй лежит просто в первом р)
  const $qsText = $('.question p:first-child');
  $qsText.each((i, elem) => {
    questions[i] = {
      text: $(elem)
        .text()
        .replace(/(\r\n|\n|\r|&nbsp|\.\.\.|Вопрос \d+:\s)/gm, '')
        .replace(/\s\s+/g, ' ')
        .trim(),
      answer: '',
      comment: '',
      qNumber: 0,
      tourNumber: 0,
      source: [],
      author: '',
      type: 'regular',
    };
  });
  //добавление картинки, когда картинка лежит в первом p без класса razdatka
  $qsText.each((i, elem) => {
    if ($(elem).find('img').attr('src')) {
      questions[i].add = $(elem).find('img').attr('src');
    }
  });

  //Добавление номера вопроса. Нельзя использовать просто индекс так как бывает вопросы 0, 00 и т.п.
  const $Question = $('.Question');
  $Question.each((i, elem) => {
    const n = +$(elem).text().slice(7, -1);
    questions[i].qNumber = n;
    if (n < 1) questions[i].type = 'outside';
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
      questionChildNodes.forEach((v, k) => {
        if (v.type === 'text' && $(v).text().trim()) {
          questions[i].text = $(v).text().trim();
        }
      });
    }
  });

  //обрабатывает блок ответа: ответ, комментарий, зачёт, автор, источники
  const $t = $('.question .collapsible');
  $t.each((i, elem) => {
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

  //количество зачетных вопросов в турнире
  let questionsQuantity = 0;
  questions.forEach((v) => {
    if (v.type !== 'outside') questionsQuantity++;
  });

  //кол-во туров в турнире. h2 используется только для разбиения по турам
  let tours = 0;
  const $tours = $('h2');
  $tours.each((i, v) => {
    const tourText = $(v).text();
    if (tourText.match(/тур|блок/gi)) tours++;
  });

  //Добавляет сквозную нумерацию вопросов при необходимости
  if (questionsQuantity - questions.at(-1).qNumber) {
    let currentNumber = 0;
    questions.forEach((v, i) => {
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
  const editorsText = $editors
    .text()
    .replace(/редактор:|редакторы:/gi, '%')
    .split('% ')
    .slice(1);
  const editors = [...new Set(editorsText)];

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

  const t: Omit<TournamentDto, 'uploaderUuid' | 'uploader'> = {
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

export default parseLink;
