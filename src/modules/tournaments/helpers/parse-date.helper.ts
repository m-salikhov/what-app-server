const months = {
	января: 0,
	февраля: 1,
	марта: 2,
	апреля: 3,
	мая: 4,
	июня: 5,
	июля: 6,
	августа: 7,
	сентября: 8,
	октября: 9,
	ноября: 10,
	декабря: 11,
} as const;

// dateStr - строка вида "12 ноября 2025 г."
export function parseDate(dateStr: string): Date {
	const [day, month, year] = dateStr.split(" ");

	const monthIndex = months[month?.toLowerCase()];

	const date = new Date(Date.UTC(+year, monthIndex, +day));

	return Number.isNaN(date.getTime()) ? new Date() : date;
}
