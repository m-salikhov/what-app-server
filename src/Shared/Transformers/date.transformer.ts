import { ValueTransformer } from "typeorm";

export const dateTransformer: ValueTransformer = {
	// Преобразование при сохранении (Date → строка YYYY-MM-DD)
	to: (value: Date | string | null | undefined): string | null => {
		if (!value) return null;

		// 1. Если уже строка вида YYYY-MM-DD — возвращаем как есть
		if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
			return value;
		}

		let dateObj: Date | null = null;

		// 2. Если строка — пытаемся создать Date (ISO или другие форматы)
		if (typeof value === "string") {
			const parsed = new Date(value);
			if (!Number.isNaN(parsed.getTime())) {
				dateObj = parsed;
			}
		}

		// 3. Если уже объект Date
		if (value instanceof Date && !Number.isNaN(value.getTime())) {
			dateObj = value;
		}

		if (!dateObj) return null;

		// 4. Форматируем в YYYY-MM-DD
		const year = dateObj.getFullYear();
		const month = String(dateObj.getMonth() + 1).padStart(2, "0");
		const day = String(dateObj.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	},
	// Преобразование при чтении (строка YYYY-MM-DD → Date)
	from: (value: string | null): string | null => {
		return value;
	},
};
