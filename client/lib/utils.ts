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