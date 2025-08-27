export const generateMockData = (count, base, variance) => {
  const data = [];
  let currentValue = base;
  for (let i = 0; i < count; i++) {
    currentValue += (Math.random() - 0.5) * variance; // Add random fluctuation
    data.push(Math.max(0, Math.round(currentValue))); // Ensure non-negative values
  }
  return data;
};
export const generateDataForTotal = (count, totalValue) => {
  if (count <= 0) return [];
  const data = Array(count).fill(totalValue / count);
  // Add some random variance while maintaining the total sum
  const variance = (totalValue * 0.1) / count;
  return data.map((value) => {
    let newValue = value + (Math.random() - 0.5) * variance;
    return Math.max(0, newValue);
  });
};
