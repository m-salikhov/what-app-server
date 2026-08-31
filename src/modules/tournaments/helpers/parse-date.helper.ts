const months = {
	"янв.": 0,
	"фев.": 1,
	"мар.": 2,
	"апр.": 3,
	мая: 4,
	"июн.": 5,
	"июл.": 6,
	"авг.": 7,
	"сент.": 8,
	"окт.": 9,
	"нояб.": 10,
	"дек.": 11,
} as const;

// dateStr - строка вида "12 авг. 2025 г."
export function parseDate(dateStr: string): Date {
	if (!dateStr) return new Date();

	const [day, month, year] = dateStr.split(" ");

	const monthIndex = months[month?.toLowerCase()];

	const date = new Date(Date.UTC(+year, monthIndex, +day));

	return Number.isNaN(date.getTime()) ? new Date() : date;
}
