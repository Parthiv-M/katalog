import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const COLORS = {
  background: '#18181b',
  surface: '#27272a',
  surfaceLight: '#3f3f46',
  text: '#fafafa',
  textMuted: '#a1a1aa',
  success: '#10b981',
};

export function formatToKatalogDate(dateString: string | null): string | null {
  if (!dateString) return null;

  try {
    const d = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { timeZone: 'UTC' };

    const weekday = d.toLocaleDateString('en-GB', { ...options, weekday: 'long' });
    const datePart = d.toLocaleDateString('en-GB', { ...options, day: 'numeric', month: 'long', year: 'numeric' });
    const timePart = d.toLocaleTimeString('en-GB', { ...options, hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return `${weekday}, ${datePart} at ${timePart} UTC`;
  } catch (e) {
    return null;
  }
}