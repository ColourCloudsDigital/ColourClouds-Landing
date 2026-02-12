/**
 * Timezone Utilities
 * 
 * Handles timezone conversions and formatting for West Africa Time (WAT, UTC+1)
 */

/**
 * Get current date/time in WAT (West Africa Time, UTC+1)
 * Returns ISO 8601 string with WAT timezone offset
 * 
 * @returns ISO 8601 timestamp string in WAT timezone
 * @example "2026-02-10T16:30:45.123+01:00"
 */
export function getWATTimestamp(): string {
  const now = new Date();
  
  // Convert to WAT (UTC+1)
  // Get UTC time and add 1 hour (3600000 milliseconds)
  const watTime = new Date(now.getTime() + (1 * 60 * 60 * 1000));
  
  // Format as ISO 8601 with +01:00 timezone offset
  const year = watTime.getUTCFullYear();
  const month = String(watTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(watTime.getUTCDate()).padStart(2, '0');
  const hours = String(watTime.getUTCHours()).padStart(2, '0');
  const minutes = String(watTime.getUTCMinutes()).padStart(2, '0');
  const seconds = String(watTime.getUTCSeconds()).padStart(2, '0');
  const milliseconds = String(watTime.getUTCMilliseconds()).padStart(3, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+01:00`;
}

/**
 * Format a date to WAT timezone in 24-hour format
 * 
 * @param date - Date to format (defaults to current date)
 * @returns Formatted date string in 24-hour format
 * @example "10 Feb 2026, 16:30"
 */
export function formatWATDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Lagos', // WAT timezone
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // 24-hour format
  }).format(date);
}

/**
 * Format a date to WAT timezone with full details in 24-hour format
 * 
 * @param date - Date to format (defaults to current date)
 * @returns Formatted date string with day, date, time
 * @example "Monday, 10 February 2026, 16:30:45"
 */
export function formatWATDateFull(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Lagos', // WAT timezone
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false, // 24-hour format
  }).format(date);
}

/**
 * Format a date to WAT timezone - time only in 24-hour format
 * 
 * @param date - Date to format (defaults to current date)
 * @returns Formatted time string
 * @example "16:30:45"
 */
export function formatWATTime(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Lagos', // WAT timezone
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false, // 24-hour format
  }).format(date);
}

/**
 * Convert ISO 8601 timestamp to WAT timezone
 * 
 * @param isoString - ISO 8601 timestamp string
 * @returns ISO 8601 timestamp string in WAT timezone
 */
export function convertToWAT(isoString: string): string {
  const date = new Date(isoString);
  
  // Convert to WAT (UTC+1)
  const watTime = new Date(date.getTime() + (1 * 60 * 60 * 1000));
  
  // Format as ISO 8601 with +01:00 timezone offset
  const year = watTime.getUTCFullYear();
  const month = String(watTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(watTime.getUTCDate()).padStart(2, '0');
  const hours = String(watTime.getUTCHours()).padStart(2, '0');
  const minutes = String(watTime.getUTCMinutes()).padStart(2, '0');
  const seconds = String(watTime.getUTCSeconds()).padStart(2, '0');
  const milliseconds = String(watTime.getUTCMilliseconds()).padStart(3, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+01:00`;
}

/**
 * Get timezone information for WAT
 */
export const WAT_TIMEZONE = {
  name: 'West Africa Time',
  abbreviation: 'WAT',
  offset: '+01:00',
  offsetMinutes: 60,
  iana: 'Africa/Lagos',
} as const;
