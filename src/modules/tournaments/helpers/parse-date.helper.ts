// dateStr - строка вида "12 ноября 2025 г."
export function convertGQdateToMs(dateStr: string) {
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

	const [day, month, year] = dateStr.split(" ");

	// Если дата не соответствует формату, возвращаем текущую дату
	if (!+day || !months.includes(month.toLowerCase()) || !+year) {
		return Date.now();
	}

	const monthIndex = months.indexOf(month.toLowerCase()) + 1;

	const date = new Date(`${year}-${monthIndex}-${day}`);

	return date.getTime();
}
