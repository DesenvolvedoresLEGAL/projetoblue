// Type compatibility utilities to fix build errors

export const safeString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'toString' in value) {
    return String(value);
  }
  return String(value || '');
};

export const safeAccess = (obj: any, path: string): any => {
  try {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  } catch {
    return undefined;
  }
};

export const withDefaults = <T>(obj: any, defaults: Partial<T>): T => {
  return { ...defaults, ...obj };
};

export const assertType = <T>(value: unknown): T => {
  return value as T;
};