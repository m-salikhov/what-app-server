import { DataSource, DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  port: 3306,
  host: process.env.HOST,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['dist/../**/*.entity.js'],
  connectTimeout: 60000,

  // migrations: ['dist/src/migration/*.js'],
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
