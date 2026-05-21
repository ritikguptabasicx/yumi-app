import { clsx } from "clsx";
import { format, isValid } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const stripHtml = (html) => {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
};

export const formatDate = (dateString) => {
  if (!dateString) return "No date available";

  const date = new Date(dateString);
  if (!isValid(date)) return "Invalid date";

  try {
    return format(date, "MMM d, yyyy");
  } catch (error) {
    return "Invalid date";
  }
};
