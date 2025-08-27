/**
 * Splits a data array into two periods: current and previous.
 * @param {array} rows - The full data series, ordered chronologically.
 * @param {string} window - The time window ('24h', '7d', or '30d').
 * @returns {object} An object containing 'current' and 'previous' data arrays.
 */
export function periodSplit(rows, window = "7d") {
  const n = rows.length;
  if (!n) return { current: [], previous: [] };

  let size;
  if (window === "24h") {
    // For daily data, 24h is the last day
    size = Math.min(1, n);
  } else if (window === "30d") {
    size = Math.min(30, n);
  } else {
    // 7d
    size = Math.min(7, n);
  }

  return {
    current: rows.slice(-size),
    previous: rows.slice(-(2 * size), -size),
  };
}

/**
 * Calculates the percentage change between two numbers.
 * @param {number} curr - The current value.
 * @param {number} prev - The previous value.
 * @returns {number} The percentage change.
 */
export function pctChange(curr, prev) {
  if (!prev || prev === 0) return curr > 0 ? 100 : 0;
  return ((curr - prev) / prev) * 100;
}
