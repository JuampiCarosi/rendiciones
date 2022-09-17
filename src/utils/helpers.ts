export const getNextWednesday = (date: Date) => {
  const dayTillWednesday = 3 - date.getDay();
  const clearDate = new Date(
    date.setDate(date.getDate() + dayTillWednesday + (dayTillWednesday < 0 ? 7 : 0))
  ).setHours(0, 0, 0, 0);
  return new Date(clearDate);
};
