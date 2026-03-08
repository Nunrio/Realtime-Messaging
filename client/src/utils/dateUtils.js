/**
 * Calculate age from birthday date
 * @param {string} birthday - ISO date string (YYYY-MM-DD)
 * @returns {number | null} - Age in years or null if invalid
 */
export const calculateAge = (birthday) => {
  if (!birthday) return null;

  const birthDate = new Date(birthday);
  const today = new Date();

  if (isNaN(birthDate.getTime())) return null;
  if (birthDate > today) return null;

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // Adjust if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age >= 0 ? age : null;
};

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Convert Date object to ISO date string (YYYY-MM-DD)
 * @param {Date} date - Date object
 * @returns {string} - ISO date string
 */
export const toISODateString = (date) => {
  if (!date || !(date instanceof Date)) return '';
  return date.toISOString().split('T')[0];
};

