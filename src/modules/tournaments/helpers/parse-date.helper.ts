// dateStr - строка вида "12 ноября 2025 г."
export function parseDate(dateStr: string): Date {
	const monthIndex = {
		января: "01",
		февраля: "02",
		марта: "03",
		апреля: "04",
		мая: "05",
		июня: "06",
		июля: "07",
		августа: "08",
		сентября: "09",
		октября: "10",
		ноября: "11",
		декабря: "12",
	} as const;

	const [day, month, year] = dateStr.split(" ");

	const isValidDay = day && +day >= 1 && +day <= 31;
	const isValidMonth = month && Object.hasOwn(monthIndex, month.toLowerCase());
	const isValidYear = year && +year >= 1990 && +year <= new Date().getFullYear();

	const dayStr = +day < 10 ? `0${day}` : day;

	if (!isValidDay || !isValidMonth || !isValidYear) {
		return new Date();
	}

	const dateString = `${year}-${monthIndex[month.toLowerCase()]}-${dayStr}T00:00:00.000Z`;

	return new Date(dateString);
}
