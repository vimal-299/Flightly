'use server';

import { db } from '@/db/db';
import { flights, bookings, surgeLogs, user } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import {
  and,
  ilike,
  gte,
  lt,
  desc,
  eq,
  sql,
} from 'drizzle-orm';

const SURGE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const ATTEMPT_THRESHOLD = 3;

export async function getFlights(searchParams: {
  from?: string;
  to?: string;
  date?: string;
}) {
  const conditions = [];

  if (searchParams.from) {
    conditions.push(
      ilike(flights.departureCity, `%${searchParams.from}%`)
    );
  }

  if (searchParams.to) {
    conditions.push(
      ilike(flights.arrivalCity, `%${searchParams.to}%`)
    );
  }

  if (searchParams.date) {
    const searchDate = new Date(searchParams.date);
    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 1);

    conditions.push(
      gte(flights.departureTime, searchDate),
      lt(flights.departureTime, nextDay)
    );

  }

  const flightRows = await db
    .select()
    .from(flights)
    .where(conditions.length ? and(...conditions) : undefined)
    .limit(10);

  return flightRows;
}


export async function checkSurge(flightId: number) {
  // Record attempt
  const now = new Date();
  const windowStart = new Date(now.getTime() - SURGE_WINDOW_MS);

  await db.insert(surgeLogs).values({
    flightId,
    attemptAt: now,
  });

  await db.delete(surgeLogs)
    .where(
      lt(surgeLogs.attemptAt, windowStart)
    )

  const [{ count }] = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(surgeLogs)
    .where(
      and(
        eq(surgeLogs.flightId, flightId),
        gte(surgeLogs.attemptAt, windowStart)
      )
    );

  const attemptCount = Number(count);
  const isSurged = attemptCount >= ATTEMPT_THRESHOLD;

  let priceMultiplier = 1;
  if (isSurged) {
    priceMultiplier = 1.1;
  }

  revalidatePath('/home');
  return { isSurged, recentCount: attemptCount, priceMultiplier };
}

export async function createBooking(data: {
  flightId: number;
  passengerName: string;
  passengerEmail: string;
  pricePaid: number;
  pnr: string;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: 'User not authenticated' };
    }

    const result = await db.transaction(async (tx) => {
      // 1. Get current user balance
      const [currentUser] = await tx
        .select()
        .from(user)
        .where(eq(user.id, session.user.id));

      if (!currentUser) {
        throw new Error('User not found');
      }

      if (currentUser.balance < data.pricePaid) {
        throw new Error('Insufficient funds');
      }

      // 2. Deduct balance
      await tx
        .update(user)
        .set({ balance: currentUser.balance - data.pricePaid })
        .where(eq(user.id, session.user.id));

      // 3. Create booking
      const [created] = await tx
        .insert(bookings)
        .values({
          flightId: data.flightId,
          passengerName: data.passengerName,
          passengerEmail: data.passengerEmail,
          pricePaid: data.pricePaid,
          pnr: data.pnr,
        })
        .returning();

      return created;
    });

    revalidatePath('/bookings');
    return { success: true, booking: result };
  } catch (error: any) {
    console.error('Booking error:', error);
    return { success: false, error: error.message || 'Booking failed' };
  }
}

export async function getBookings() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.email) {
    return [];
  }

  const rows = await db
    .select({
      booking: bookings,
      flight: flights,
    })
    .from(bookings)
    .innerJoin(flights, eq(bookings.flightId, flights.id))
    .where(eq(bookings.passengerEmail, session.user.email))
    .orderBy(desc(bookings.bookingDate))
    .limit(10);

  return rows.map(({ booking, flight }) => ({
    ...booking,
    bookingDate: booking.bookingDate.toISOString(),
    flight:
    {
      ...flight,
      departureTime: flight.departureTime.toISOString(),
    }

  }));
}
