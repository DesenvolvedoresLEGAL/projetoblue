
/**
 * Utility functions for formatting different types of data consistently
 */

/**
 * Formats a phone number to Brazilian format: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
 */
export const formatPhoneNumber = (phone: string | number | undefined): string => {
  if (!phone) return 'N/A';
  const phoneStr = String(phone).replace(/\D/g, '');
  if (phoneStr.length === 11) {
    return `(${phoneStr.substring(0, 2)}) ${phoneStr.substring(2, 7)}-${phoneStr.substring(7)}`;
  } else if (phoneStr.length === 10) {
    return `(${phoneStr.substring(0, 2)}) ${phoneStr.substring(2, 6)}-${phoneStr.substring(6)}`;
  }
  return phoneStr;
};

/**
 * Formats a date consistently based on options
 */
export const formatDate = (date: string | Date | undefined, short = false): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (short) {
      // Short format: DD/MM/YYYY
      const day = dateObj.getDate().toString().padStart(2, '0');
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const year = dateObj.getFullYear();
      return `${day}/${month}/${year}`;
    } else {
      // Full format: DD/MM/YYYY HH:MM
      const day = dateObj.getDate().toString().padStart(2, '0');
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const year = dateObj.getFullYear();
      const hours = dateObj.getHours().toString().padStart(2, '0');
      const minutes = dateObj.getMinutes().toString().padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid date';
  }
};

/**
 * Capitalizes the first letter of a string
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
