import { isSameDay, isWeekend, getYear } from 'date-fns';

export interface SwedishHoliday {
  date: Date;
  name: string;
  nameEn: string;
}

// Get Easter Sunday for a given year (Meeus/Jones/Butcher algorithm)
const getEasterSunday = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
};

// Get Midsummer Day (Saturday between June 20-26)
const getMidsummerDay = (year: number): Date => {
  const date = new Date(year, 5, 20); // June 20
  while (date.getDay() !== 6) { // Find Saturday
    date.setDate(date.getDate() + 1);
  }
  return date;
};

// Get All Saints' Day (Saturday between Oct 31 - Nov 6)
const getAllSaintsDay = (year: number): Date => {
  const date = new Date(year, 9, 31); // Oct 31
  while (date.getDay() !== 6) { // Find Saturday
    date.setDate(date.getDate() + 1);
  }
  return date;
};

export const getSwedishHolidays = (year: number): SwedishHoliday[] => {
  const easter = getEasterSunday(year);
  const easterTime = easter.getTime();
  
  const holidays: SwedishHoliday[] = [
    // Fixed holidays
    { date: new Date(year, 0, 1), name: 'Nyårsdagen', nameEn: "New Year's Day" },
    { date: new Date(year, 0, 6), name: 'Trettondedag jul', nameEn: 'Epiphany' },
    { date: new Date(year, 4, 1), name: 'Första maj', nameEn: 'May Day' },
    { date: new Date(year, 5, 6), name: 'Sveriges nationaldag', nameEn: 'National Day of Sweden' },
    { date: new Date(year, 11, 24), name: 'Julafton', nameEn: 'Christmas Eve' },
    { date: new Date(year, 11, 25), name: 'Juldagen', nameEn: 'Christmas Day' },
    { date: new Date(year, 11, 26), name: 'Annandag jul', nameEn: 'Boxing Day' },
    { date: new Date(year, 11, 31), name: 'Nyårsafton', nameEn: "New Year's Eve" },
    
    // Easter-based holidays
    { date: new Date(easterTime - 2 * 24 * 60 * 60 * 1000), name: 'Långfredagen', nameEn: 'Good Friday' },
    { date: new Date(easterTime - 1 * 24 * 60 * 60 * 1000), name: 'Påskafton', nameEn: 'Easter Eve' },
    { date: easter, name: 'Påskdagen', nameEn: 'Easter Sunday' },
    { date: new Date(easterTime + 1 * 24 * 60 * 60 * 1000), name: 'Annandag påsk', nameEn: 'Easter Monday' },
    { date: new Date(easterTime + 39 * 24 * 60 * 60 * 1000), name: 'Kristi himmelsfärdsdag', nameEn: 'Ascension Day' },
    { date: new Date(easterTime + 49 * 24 * 60 * 60 * 1000), name: 'Pingstdagen', nameEn: 'Whit Sunday' },
    
    // Variable holidays
    { date: new Date(getMidsummerDay(year).getTime() - 24 * 60 * 60 * 1000), name: 'Midsommarafton', nameEn: 'Midsummer Eve' },
    { date: getMidsummerDay(year), name: 'Midsommardagen', nameEn: 'Midsummer Day' },
    { date: getAllSaintsDay(year), name: 'Alla helgons dag', nameEn: "All Saints' Day" },
  ];
  
  return holidays;
};

// Cache holidays by year for performance
const holidayCache = new Map<number, SwedishHoliday[]>();

export const getHolidaysForYear = (year: number): SwedishHoliday[] => {
  if (!holidayCache.has(year)) {
    holidayCache.set(year, getSwedishHolidays(year));
  }
  return holidayCache.get(year)!;
};

export const getHolidayForDate = (date: Date): SwedishHoliday | undefined => {
  const year = getYear(date);
  const holidays = getHolidaysForYear(year);
  return holidays.find(h => isSameDay(h.date, date));
};

export const isHoliday = (date: Date): boolean => {
  return getHolidayForDate(date) !== undefined;
};

export const isNonWorkingDay = (date: Date): boolean => {
  return isWeekend(date) || isHoliday(date);
};
