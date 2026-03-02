import { format, isSameYear, parseISO } from "date-fns";

export const getTimeFormat = (time: string) => {
  const parsedTime = parseISO(time);
  const currentTime = new Date();

  if (isSameYear(parsedTime, currentTime)) {
    return format(parsedTime, "HH:mm MMM dd");
  }

  return format(parsedTime, "HH:mm MMM dd, yyyy");
};

export const shortenId = (value: string) => {
  if (value.length <= 14) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-4)}`;
};

export const formats = {
  getTimeFormat,
  shortenId,
};

export type ThemeFormats = typeof formats;
