import { parse } from "date-fns";

export const parseWeekDate = (weekDate) =>
  parse(weekDate, "dd-MM-yyyy", new Date());

export const sortWeekDetails = (weekDetails = []) =>
  [...weekDetails].sort(
    (a, b) => parseWeekDate(a.weekDate).getTime() - parseWeekDate(b.weekDate).getTime()
  );

export const normalizeMenuItems = (items = []) =>
  items.map((item) => {
    const weekDetails = item?.mealPlanner?.weekDetails;
    if (!weekDetails?.length) return item;

    return {
      ...item,
      mealPlanner: {
        ...item.mealPlanner,
        weekDetails: sortWeekDetails(weekDetails),
      },
    };
  });
