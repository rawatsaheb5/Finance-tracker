export function convertToUTC(dateInput) {
  const date = new Date(dateInput);

  if (isNaN(date.getTime())) {
    throw new Error("Invalid date provided");
  }

  return date.toISOString(); // Returns UTC time in ISO 8601 format
}
