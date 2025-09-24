const getTourNumber = (questionsQuantity: number, tours: number, qNumber: number) => {
	const remainder = questionsQuantity % tours;
	const tourLength = (questionsQuantity - remainder) / tours;

	if (qNumber <= questionsQuantity - remainder) {
		return Math.ceil(qNumber / tourLength);
	} else {
		return tours;
	}
};
export default getTourNumber;
