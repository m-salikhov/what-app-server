import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AppService {
  getHello(): string[] {
    return ['hello world'];
  }
}
