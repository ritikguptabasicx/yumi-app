const dayMap = {
  Mon: "monday",
  Tue: "tuesday",
  Wed: "wednesday",
  Thu: "thursday",
  Fri: "friday",
  Sat: "saturday",
  Sun: "sunday",
};

export const getWeekdayKey = (day) => {
  return dayMap[day] || day.toLowerCase();
};
