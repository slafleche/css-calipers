export const normalizeToArray = <T>(
  value: T | T[] | null | undefined,
): T[] => {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
};
