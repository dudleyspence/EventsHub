import { GetEventsSchema } from "@/schemas/events";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const db = new PrismaClient();

export async function getEvents({
  orderBy,
  sort,
  category,
  startDate,
  endDate,
  page,
  limit,
}: z.infer<typeof GetEventsSchema>) {
  const whereFilter: any = {};

  if (category) {
    whereFilter.category = category;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // if no date specified, finds all furture events
  if (!startDate && !endDate) {
    whereFilter.date = { gte: today };
  } else if (startDate && !endDate) {
    // start date given means find only that day
    const startDateBegining = new Date(startDate).setHours(0, 0, 0, 0);
    const startDateEnding = new Date(startDate).setHours(23, 59, 59, 999);

    whereFilter.date = {
      gte: startDateBegining,
      lte: startDateEnding,
    };
  } else if (startDate && endDate) {
    // both dates given means find events between them
    const startDateBegining = new Date(startDate).setHours(0, 0, 0, 0);
    const endDateEnding = new Date(endDate).setHours(23, 59, 59, 999);

    whereFilter.date = {
      gte: startDateBegining,
      lte: endDateEnding,
    };
  }

  const orderByClause = { [orderBy]: sort };

  const skip = (page - 1) * limit;

  const events = await db.event.findMany({
    where: whereFilter,
    orderBy: orderByClause,
    take: limit,
    skip,
  });

  return events;
}

export async function getUpcomingEvents() {
  const events = await db.event.findMany({
    take: 10,
    orderBy: { date: "asc" },
  });

  return events;
}

// desired behaviour:

// gets all events
// filtered by category
// ordered by date or maxCapacity
// sorted asc or desc
// results per page (default 10)
// defaults to page 1
// if start date and end date are not specified - default all days after today
// if start date and no end date then filter to that signle day
// if start and end date are specified (user selects "this week" or "this month") then filter

// later will include a search term
// PostgreSQL/Prisma provides _relevance field for seach
// https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting#sorting
