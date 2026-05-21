import { create } from "zustand";

export const useCheckoutStore = create((set) => ({
  checkoutData: null,
  setCheckoutData: (data) => set({ checkoutData: data }),
  clearCheckoutData: () => set({ checkoutData: null }),
}));
