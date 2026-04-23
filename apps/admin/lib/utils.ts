import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelative(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const diff = date.getTime() - Date.now();
  const abs = Math.abs(diff);
  const minutes = Math.round(abs / (1000 * 60));
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  if (minutes < 60) return rtf.format(Math.sign(diff) * minutes, "minute");
  if (hours < 24) return rtf.format(Math.sign(diff) * hours, "hour");
  return rtf.format(Math.sign(diff) * days, "day");
}
