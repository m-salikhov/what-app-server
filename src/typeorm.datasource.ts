import { DataSource, type DataSourceOptions } from "typeorm";

export const dataSourceOptions: DataSourceOptions = {
	type: "mysql",
	port: Number(process.env.MYSQL_PORT ?? 3306),
	host: process.env.MYSQL_HOST ?? "127.0.0.1",
	username: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASSWORD,
	database: process.env.MYSQL_DATABASE,
	entities: ["dist/../**/*.entity.js"],
	logging: ["error", "warn"],
	extra: {
		connectionLimit: 10,
		waitForConnections: true,
		queueLimit: 150,
	},
	connectTimeout: 60000,
	synchronize: false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
