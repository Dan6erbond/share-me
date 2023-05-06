export const getRelativeTime = (date1: Date, date2: Date) => {
  const dayDiff = Math.ceil(
    (date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (dayDiff === 0) {
    return "Today";
  }

  if (dayDiff > 7) {
    return date2.toLocaleDateString();
  }

  const rtf = new Intl.RelativeTimeFormat("en", {
    style: "short",
  });

  return rtf.format(dayDiff, "day");
};
