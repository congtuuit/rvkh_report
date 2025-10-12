import dayjs from "dayjs";

export function generateDateRange(mode = "week", toDateStr) {
  const toDate = dayjs(toDateStr).endOf(mode);
  const fromDate = dayjs(toDateStr).startOf(mode);
  const range = [];
  let current = fromDate;

  while (current.isBefore(toDate) || current.isSame(toDate, 'day')) {
    range.push(current.format("YYYY-MM-DD")); // Hoặc dùng định dạng khác nếu bạn cần
    current = current.add(1, "day");
  }

  return range;
}

export function fillMissingDates(dailyStats, mode) {
  const fullDates = generateDateRange(mode, dailyStats[0].date);
  const statMap = new Map(
    dailyStats.map((item) => [dayjs(item.date).format("YYYY-MM-DD"), item.totalViews])
  );

  return fullDates.map((date) => ({
    date,
    views: statMap.get(date) || 0,
  }));
}
