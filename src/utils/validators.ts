export const isValidEmail = (value: string | null | undefined): boolean => {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  const pattern = /^[\w.!#$%&'*+/=?^`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/;
  return pattern.test(trimmed);
};

export const isNonEmpty = (value: string | null | undefined): boolean => {
  return typeof value === 'string' && value.trim().length > 0;
};

export const isValidUsername = (value: string | null | undefined): boolean => {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  return /^[a-z0-9_]{3,}$/i.test(trimmed);
};
