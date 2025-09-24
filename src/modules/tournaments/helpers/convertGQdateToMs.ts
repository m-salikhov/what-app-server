export function convertGQdateToMs(dateStr: string) {
	// Определяем массив месяцев
	const months = [
		"января",
		"февраля",
		"марта",
		"апреля",
		"мая",
		"июня",
		"июля",
		"августа",
		"сентября",
		"октября",
		"ноября",
		"декабря",
	];

	// Проверяем, что формат даты соответствует заданному
	const regex = /(\d+)\s+[а-яёА-ЯЁ]+\s+(\d+)/;
	const match = dateStr.match(regex);

	if (match) {
		const [day, monthStr, year] = dateStr.split(" ");

		// Находим номер месяца по его названию
		const monthIndex = months.indexOf(monthStr.toLowerCase()) + 1;

		if (monthIndex !== -1) {
			const date = new Date(`${year}-${monthIndex}-${day}`);

			return date.getTime();
		}
	}

	// Если формат не распознан, возвращаем null или сообщение об ошибке
	return Date.now();
}
