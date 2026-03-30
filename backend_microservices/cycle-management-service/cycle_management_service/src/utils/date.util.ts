export const formatBillingCycle = (date: string): string => {
  const parsedDate = new Date(date);
  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

export const parseDate = (dateString: string): Date => {
  const date = new Date(dateString);
  if (!isValidDate(dateString)) {
    throw new Error(`Invalid date: ${dateString}`);
  }
  return date;
};
