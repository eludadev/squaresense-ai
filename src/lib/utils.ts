import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { customAlphabet } from 'nanoid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function removeItemFromArray<T>(array: T[], itemToRemove: T) {
  const index = array.indexOf(itemToRemove);
  if (index !== -1) {
    array.splice(index, 1);
  }
  return array;
}

export const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  7,
); // 7-character random string

export function isNumeric(value: string): boolean {
  return /^-?\d+$/.test(value);
}

export function calculateMostCommonAgeGroup(birthdays: Date[]): string {
  // Create an object to count the occurrences of each age group
  const ageGroupCounts: Record<string, number> = {};

  // Define age group buckets
  const ageGroups = ['<18', '18-24', '25-34', '35-44', '45-54', '55+'];

  // Initialize age group counts to zero
  ageGroups.forEach((group) => {
    ageGroupCounts[group] = 0;
  });

  // Calculate the age for each birthday and increment the corresponding age group count
  const today = new Date();
  birthdays.forEach((birthday) => {
    const age = today.getFullYear() - birthday.getFullYear();
    if (age < 18) {
      ageGroupCounts['<18']++;
    } else if (age >= 18 && age <= 24) {
      ageGroupCounts['18-24']++;
    } else if (age >= 25 && age <= 34) {
      ageGroupCounts['25-34']++;
    } else if (age >= 35 && age <= 44) {
      ageGroupCounts['35-44']++;
    } else if (age >= 45 && age <= 54) {
      ageGroupCounts['45-54']++;
    } else {
      ageGroupCounts['55+']++;
    }
  });

  // Find the most common age group
  let mostCommonAgeGroup = '-';
  let maxCount = 0;
  ageGroups.forEach((group) => {
    if (ageGroupCounts[group] > maxCount) {
      mostCommonAgeGroup = group;
      maxCount = ageGroupCounts[group];
    }
  });

  return mostCommonAgeGroup;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomColor(): string {
  const h = randomInt(0, 360);
  const s = randomInt(42, 98);
  const l = randomInt(40, 90);

  return `hsl(${h},${s}%,${l}%)`;
}

export function createBins(
  data: number[],
  numBins: number,
): {
  range: number[];
  count: number;
}[] {
  // Find the minimum and maximum values in the data
  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);

  // Calculate the bin width
  const binWidth = (maxValue - minValue) / numBins;

  // Initialize an array to store the bins
  const bins = Array.from({ length: numBins + 1 }, (_, index) => {
    const binStart = minValue + index * binWidth;
    const binEnd = binStart + binWidth;
    return { range: [binStart, binEnd], count: 0 };
  });

  // Populate the bins with data counts
  data.forEach((value) => {
    const binIndex = Math.floor((value - minValue) / binWidth);
    if (binIndex >= 0 && binIndex < numBins) {
      bins[binIndex].count++;
    } else if (binIndex === numBins) {
      // Handle values that are exactly equal to the maxValue
      bins[numBins].count++;
    }
  });

  return bins;
}

export function parseHSLColor(hslColor: string): {
  h: number;
  s: number;
  l: number;
} {
  const regex = /^hsl\((\d+),(\d+)%,(\d+)%\)$/;

  const match = hslColor.match(regex);

  if (match) {
    const h = parseInt(match[1]);
    const s = parseInt(match[2]);
    const l = parseInt(match[3]);

    return { h, s, l };
  }

  throw new Error(); // throw error if the input doesn't match the expected format
}

export function hslToHex(hsl: string) {
  let { h, s, l } = parseHSLColor(hsl);

  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0'); // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
