import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const saveToLocalStorage = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

export const loadFromLocalStorage = (key: string) => {
  if (typeof window !== 'undefined') {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : null;
  }
  return null;
};
