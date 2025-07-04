
/**
 * Utility functions for working with strings
 */

/**
 * Capitalizes the first letter of a string
 * @param str The string to capitalize
 * @returns The capitalized string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function safedParseInt(searchTerm: string): number {
  const parsed = parseInt(searchTerm, 10)
  return Number.isNaN(parsed) ? -1 : parsed
}

/**
 * Extends the String prototype to add a capitalize method
 * This is only for use with string literals, not for dynamically created strings or user input
 */
declare global {
  interface String {
    capitalize(): string;
  }
}

// Only add the method if it doesn't already exist
if (!String.prototype.capitalize) {
  String.prototype.capitalize = function(): string {
    return capitalize(this.toString());
  };
}
