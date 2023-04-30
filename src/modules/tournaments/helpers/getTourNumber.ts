const getTourNumber = (
  questionsQuantity: number,
  tours: number,
  qNumber: number,
) => {
  const remainder = questionsQuantity % tours;
  if (!remainder) {
    const num = questionsQuantity / tours;
    return Math.ceil(qNumber / num);
  }
};
export default getTourNumber;
