import * as cheerio from 'cheerio';
import axios from 'axios';
import { NotFoundException } from '@nestjs/common';

export const parseTournamentGotquestions = async (link: string) => {
  const html = await axios
    .get(link)
    .then((res) => res.data)
    .catch(() => {
      throw new NotFoundException('Неверная ссылка');
    });

  const $ = cheerio.load(html);

  const scriptString = $('#__NEXT_DATA__').text();

  const data = JSON.parse(scriptString);

  return data.props.pageProps.pack;
};
