export function getRange(window = "7d") {
  const end = new Date();
  const start = new Date(end);
  if (window === "24h") {
    start.setHours(end.getHours() - 24);
  } else if (window === "30d") {
    start.setDate(end.getDate() - 30);
  } else {
    // Defaults to 7d
    start.setDate(end.getDate() - 7);
  }
  return { start: start.toISOString(), end: end.toISOString() };
}
