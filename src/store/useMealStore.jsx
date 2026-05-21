import { create } from "zustand";
import { sortWeekDetails } from "@/lib/mealPlanner";

const initialState = {
  selectedDay: 1,
  skippedDays: [],
  menuItems: [],
  selectedMeals: {},
  isLoading: false,
};

export const useMealPlannerStore = create((set, get) => ({
  ...initialState,

  setSelectedDay: (day) => set({ selectedDay: day }),
  setSkippedDays: (days) => set({ skippedDays: days }),
  addSkippedDay: (day) =>
    set((state) => ({ skippedDays: [...state.skippedDays, day] })),
  setMenuItems: (items) => set({ menuItems: items }),
  setSelectedMeals: (meals) => set({ selectedMeals: meals }),
  setIsLoading: (loading) => set({ isLoading: loading }),

  handleMealSelect: (day, mealType, meal) => {
    set((state) => {
      const updatedMeals = { ...state.selectedMeals };
      if (!updatedMeals[day]) updatedMeals[day] = {};
      if (!updatedMeals[day][mealType]) updatedMeals[day][mealType] = [];

      if (meal === null) {
        updatedMeals[day][mealType] = [];
      } else {
        const mealWithQty = {
          ...meal,
          quantity: meal.quantity || 1,
        };

        const existingIndex = updatedMeals[day][mealType].findIndex(
          (m) => m.itemId === meal.itemId
        );

        if (existingIndex > -1)
          updatedMeals[day][mealType][existingIndex] = mealWithQty;
        else updatedMeals[day][mealType].push(mealWithQty);
      }

      return { selectedMeals: updatedMeals };
    });
  },

  updateMealQuantity: (
    day,
    mealType,
    itemId,
    newQuantity,
    orderLineItemId,
    isAdded
  ) => {
    set((state) => {
      const updatedMeals = { ...state.selectedMeals };

      // Initialize day and mealType if needed
      if (!updatedMeals[day]) updatedMeals[day] = {};
      if (!updatedMeals[day][mealType]) updatedMeals[day][mealType] = [];

      const existingIndex = updatedMeals[day][mealType].findIndex(
        (m) => m.itemId === itemId
      );

      if (newQuantity === 0) {
        if (existingIndex > -1) {
          updatedMeals[day][mealType].splice(existingIndex, 1);
        }
      } else {
        if (existingIndex > -1) {
          updatedMeals[day][mealType][existingIndex] = {
            ...updatedMeals[day][mealType][existingIndex],
            quantity: newQuantity,
            orderLineItemId:
              orderLineItemId ??
              updatedMeals[day][mealType][existingIndex].orderLineItemId,
            isAdded:
              isAdded ?? updatedMeals[day][mealType][existingIndex].isAdded,
          };
        } else {
          const availableMeals = get().getAvailableMealsForDay(day);
          const mealData = availableMeals[0]?.itemTypes
            ?.flatMap(
              (type) => type.categories?.flatMap((cat) => cat.items || []) || []
            )
            .find((item) => item.itemId === itemId);

          if (mealData) {
            updatedMeals[day][mealType].push({
              ...mealData,
              quantity: newQuantity,
              orderLineItemId: orderLineItemId ?? -1,
              isAdded: isAdded ?? 1,
            });
          }
        }
      }

      return { selectedMeals: updatedMeals };
    });
  },

  handleQuantityChange: (day, mealType, itemId, newQuantity) => {
    set((state) => {
      const updatedMeals = { ...state.selectedMeals };
      if (updatedMeals[day]?.[mealType]) {
        const idx = updatedMeals[day][mealType].findIndex(
          (m) => m.itemId === itemId
        );
        if (idx !== -1) updatedMeals[day][mealType][idx].quantity = newQuantity;
      }
      return { selectedMeals: updatedMeals };
    });
  },

  clearDayMeals: (day) =>
    set((state) => ({
      selectedMeals: { ...state.selectedMeals, [day]: {} },
    })),

  isDaySelected: (dayIndex) => {
    const meals = get().selectedMeals[dayIndex];
    if (!meals) return false;
    return Object.values(meals).some((list) => list.length > 0);
  },

  isDaySkipped: (dayIndex) => get().skippedDays.includes(dayIndex),

  hasAtLeastOneMealSelected: () => {
    const all = get().selectedMeals;
    return Object.values(all).some((day) =>
      Object.values(day).some((arr) => arr.length > 0)
    );
  },

  getAvailableWeekdays: () => {
    const menuItems = get().menuItems;
    const weekDetails = menuItems[0]?.mealPlanner?.weekDetails || [];
    return weekDetails.length;
  },

  getAvailableMealsForDay: (dayIndex) => {
    const state = get();
    const orderId = state.menuItems[0]?.orderId;
    const mealPlanner = state.menuItems[0]?.mealPlanner;
    if (!mealPlanner?.weekDetails?.length) return [];

    const sortedWeeks = sortWeekDetails(mealPlanner.weekDetails);

    if (dayIndex > sortedWeeks.length) return [];

    const weekDetailWithOrderId = {
      ...sortedWeeks[dayIndex - 1],
      orderId: orderId || 0,
    };

    return [weekDetailWithOrderId];
  },

  updateWeekStatus: (weekDate, mealsForWeek = []) => {
    set((state) => {
      const updatedMenuItems = state.menuItems.map((menu) => {
        const mealPlanner = menu?.mealPlanner;
        if (!mealPlanner?.weekDetails) return menu;

        const updatedWeeks = mealPlanner.weekDetails.map((week) => {
          if (week.weekDate === weekDate) {
            const newStatus = mealsForWeek.length > 0 ? "Ordered" : "NA";
            return { ...week, status: newStatus };
          }
          return week;
        });

        return {
          ...menu,
          mealPlanner: { ...mealPlanner, weekDetails: updatedWeeks },
        };
      });

      return { menuItems: updatedMenuItems };
    });
  },

  updateWeekStatusByDay: (dayIndex) => {
    const state = get();
    const dayMeals = state.selectedMeals[dayIndex] || {};
    const allMeals = Object.values(dayMeals).flat();
    const mealsWithQty = allMeals.filter((m) => m.quantity > 0);

    const availableMeals = state.getAvailableMealsForDay(dayIndex);
    if (availableMeals.length > 0) {
      const weekDate = availableMeals[0].weekDate;
      get().updateWeekStatus(weekDate, mealsWithQty);
    }
  },

  isAllDaysHandled: () => {
    const days = get().getAvailableWeekdays();
    return Array.from({ length: days }, (_, i) => i + 1).every(
      (d) => get().isDaySelected(d) || get().isDaySkipped(d)
    );
  },

  resetStore: () => set(initialState),

  totalPrice: () => {
    const allMeals = Object.values(get().selectedMeals).flatMap((day) =>
      Object.values(day).flat()
    );
    return allMeals.reduce(
      (total, meal) => total + meal.itemPrice * meal.quantity,
      0
    );
  }
}));
