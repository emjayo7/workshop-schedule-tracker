export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function sortClassesBySchedule(classes) {
  return [...classes].sort((first, second) => {
    const dayDifference = DAYS_OF_WEEK.indexOf(first.dayOfWeek)
      - DAYS_OF_WEEK.indexOf(second.dayOfWeek);
    return dayDifference || first.startTime.localeCompare(second.startTime);
  });
}

export function getTodayName(date = new Date()) {
  const mondayFirstIndex = (date.getDay() + 6) % 7;
  return DAYS_OF_WEEK[mondayFirstIndex];
}

export function getTodayClasses(classes, date = new Date()) {
  return sortClassesBySchedule(
    classes.filter((classItem) => classItem.dayOfWeek === getTodayName(date)),
  );
}

export function getUpcomingClasses(classes, date = new Date()) {
  const todayIndex = (date.getDay() + 6) % 7;
  const currentTime = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

  return classes
    .map((classItem) => ({
      classItem,
      daysAway: (DAYS_OF_WEEK.indexOf(classItem.dayOfWeek) - todayIndex + 7) % 7,
    }))
    .filter(({ classItem, daysAway }) =>
      daysAway > 0 || classItem.startTime > currentTime,
    )
    .sort((first, second) =>
      first.daysAway - second.daysAway
      || first.classItem.startTime.localeCompare(second.classItem.startTime),
    )
    .slice(0, 3)
    .map(({ classItem }) => classItem);
}

export function getOverlappingClassIds(classes) {
  const overlappingIds = new Set();

  for (const day of DAYS_OF_WEEK) {
    const dayClasses = sortClassesBySchedule(
      classes.filter((classItem) => classItem.dayOfWeek === day),
    );

    for (let firstIndex = 0; firstIndex < dayClasses.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < dayClasses.length; secondIndex += 1) {
        const first = dayClasses[firstIndex];
        const second = dayClasses[secondIndex];
        if (first.startTime < second.endTime && second.startTime < first.endTime) {
          overlappingIds.add(first._id);
          overlappingIds.add(second._id);
        }
      }
    }
  }

  return overlappingIds;
}

export function validateClassInput(classData) {
  if (!classData.subjectName.trim()) {
    return "Subject name is required.";
  }
  if (!DAYS_OF_WEEK.includes(classData.dayOfWeek)) {
    return "Choose a day of the week.";
  }
  if (!classData.startTime) {
    return "Start time is required.";
  }
  if (!classData.endTime) {
    return "End time is required.";
  }
  if (classData.endTime <= classData.startTime) {
    return "End time must be after start time.";
  }

  return "";
}

export function formatClassTime(time) {
  const [hour, minute] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}