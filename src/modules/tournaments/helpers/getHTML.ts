import { get } from 'https';
import axios from 'axios';

async function getHTML(link: string) {
  const httpsGet = (https: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      get(https, (res) => {
        res.setEncoding('utf8');
        const body = [];
        res.on('data', (chunk) => body.push(chunk));
        res.on('end', () => resolve(body.join('')));
      }).on('error', reject);
    });
  };

  const httpGet = async (http: string): Promise<string> =>
    await axios
      .get(http)
      .then((res) => res.data)
      .catch((e) => console.log(e));

  const protocol = link.includes('https');

  const res = protocol ? await httpsGet(link) : await httpGet(link);

  return res;
}

export default getHTML;
