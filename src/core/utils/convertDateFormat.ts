export const convertDateFormat = (dateString: string): string => {
  // Regular expression to match the "YYYY-MM-DD" format
  const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;

  // Check if the dateString matches the "YYYY-MM-DD" format
  if (!dateFormatRegex.test(dateString)) {
    return dateString; // Return the original string if format is incorrect
  }

  const [year, month, day] = dateString.split("-");

  // Return the date in "DD/MM/YYYY" format
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
};
