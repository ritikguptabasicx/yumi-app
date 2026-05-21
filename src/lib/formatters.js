import { format } from "date-fns";

export const formatTimestamp = (timestamp) => {
  if (!timestamp || timestamp.length !== 14) return "N/A";
  const year = timestamp.slice(0, 4);
  const month = timestamp.slice(4, 6);
  const day = timestamp.slice(6, 8);
  const hour = timestamp.slice(8, 10);
  const minute = timestamp.slice(10, 12);
  const second = timestamp.slice(12, 14);

  return format(
    new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`),
    "MMM dd, yyyy HH:mm:ss"
  );
};
