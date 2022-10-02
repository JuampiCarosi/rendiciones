export const getNextWednesday = (date: Date) => {
  const dayTillWednesday = 3 - date.getDay();
  const clearDate = new Date(
    date.setDate(date.getDate() + dayTillWednesday + (dayTillWednesday < 0 ? 7 : 0))
  ).setHours(0 - date.getTimezoneOffset() / 60, 0, 0, 0);
  return new Date(clearDate);
};

export const parsePettyCashDate = (pettyCashDate: Date) => {
  const date = new Date(pettyCashDate)
    .toLocaleDateString("es-AR", { year: "numeric", month: "short", day: "numeric" })
    .split(" ");
  const parsedDate = `${date[2]?.toLocaleUpperCase()} ${date[0]}`;
  return { date: pettyCashDate, label: parsedDate };
};
