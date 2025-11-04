export const isLatinOnly = (value?: string): boolean => {
  if (!value) return true;
  return /^[A-Za-z0-9,.%:?&!$;*() -]+$/.test(value);
};

export const startsWithCapital = (value?: string): boolean => {
  if (!value) return true;
  return /^[A-Z]/.test(value);
};
