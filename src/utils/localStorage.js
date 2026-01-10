/**
 * LocalStorage utility functions
 */

import { safeJsonParse } from "./common";

/**
 * Get array from localStorage
 */
export function getLocalArray(key) {
  if (typeof window === "undefined") return [];
  const v = window.localStorage.getItem(key);
  const arr = safeJsonParse(v, []);
  return Array.isArray(arr) ? arr : [];
}

/**
 * Set array to localStorage
 */
export function setLocalArray(key, arr) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(arr));
}

/**
 * Add value to array in localStorage
 */
export function addToLocalArray(key, value, limit = 8) {
  const current = getLocalArray(key);
  const next = [value, ...current.filter((x) => x !== value)].slice(0, limit);
  setLocalArray(key, next);
  return next;
}