import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AppService {
  getHello(): string[] {
    return ['hello world'];
  }

  async test(link: string) {
    const downloadImage = async (url: string, path: string) => {
      const response = await fetch(url);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await fs.writeFile(path, buffer);
    };

    if (link.includes('imgur')) {
      link = link + '.png';
    }

    const fileName = 'andvarif-' + uuidv4().slice(1, 13) + '.png';

    await downloadImage(link, `./public/${fileName}`);

    return [`${process.env.HOST}:${process.env.PORT}/public/${fileName}`];
  }
}
