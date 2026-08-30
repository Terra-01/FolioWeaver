// src/lib/utils.ts
import { DateValue } from '@/components/PortfolioLayout';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Formats a DateValue object into a string like "Jan 2022" or just "2022".
const formatDate = (date: DateValue | 'Present'): string => {
  if (date === 'Present') return 'Present';
  if (!date.year) return ''; // Should not happen with valid data, but a good safeguard.
  if (date.month) {
    return `${MONTHS[date.month - 1]} ${date.year}`;
  }
  return date.year.toString();
};

type Period = { start: DateValue; end: DateValue | 'Present' } | string;

//Formats a period object into a final string like "Jan 2022 - Present".
export function formatPeriod(period: Period): string {
    if (typeof period === 'string') {
      return period;
    }
  
    if (period && period.start && period.end) {
        const startStr = formatDate(period.start);
        const endStr = formatDate(period.end);
        if (startStr && endStr) return `${startStr} - ${endStr}`;
        return startStr || endStr;
      }
  return '';
}

export function sortPeriodsDescending(
    periodA: { start: DateValue; end: DateValue | 'Present' },
    periodB: { start: DateValue; end: DateValue | 'Present' }
  ): number {
    const currentYear = new Date().getFullYear();
  
    // This helper converts a date into a single comparable number (e.g., March 2023 -> 202303)
    const getDateValue = (date: DateValue | 'Present', isEndDate: boolean): number => {
      if (date === 'Present') return (currentYear + 1) * 100; // "Present" is always the newest
      if (!date || typeof date !== 'object' || !date.year) return 0; // Handles invalid data
  
      // If a month isn't specified for an end date, treat it as the end of the year (December) for sorting.
      // If it isn't specified for a start date, treat it as the beginning (January).
      const month = date.month || (isEndDate ? 12 : 1);
      return date.year * 100 + month;
    };
  
    // 1. Compare by end date
    const endValueA = getDateValue(periodA.end, true);
    const endValueB = getDateValue(periodB.end, true);
    if (endValueA !== endValueB) {
      return endValueB - endValueA; // Sort descending
    }
  
    // 2. If end dates are identical, compare by start date as a tie-breaker
    const startValueA = getDateValue(periodA.start, false);
    const startValueB = getDateValue(periodB.start, false);
    return startValueB - startValueA; // Sort descending
}