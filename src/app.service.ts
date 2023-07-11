import { Injectable } from '@nestjs/common';
import { get } from 'https';
import * as cheerio from 'cheerio';

@Injectable()
export class AppService {
  getHello(): string[] {
    return ['hello world'];
  }

  async test(link: string) {
    const httpGet = (l: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        get(l, (res) => {
          res.setEncoding('utf8');
          const body = [];
          res.on('data', (chunk) => body.push(chunk));
          res.on('end', () => resolve(body.join('')));
        }).on('error', reject);
      });
    };

    const res = await httpGet(link);

    const $ = cheerio.load(res);

    //название турнира
    const title = $('h1').text();

    return title;
  }
}
