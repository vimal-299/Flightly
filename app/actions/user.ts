'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db/db';
import { user, bookings, flights } from '@/db/schema';
import { eq, sql, desc } from 'drizzle-orm';

export async function getUserData() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return null;
    }

    const [dbUser] = await db
        .select()
        .from(user)
        .where(eq(user.id, session.user.id));

    return dbUser;
}

export async function getUserStats() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user?.email) {
        return null;
    }

    // 1. Get total flights
    const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(bookings)
        .where(eq(bookings.passengerEmail, session.user.email));

    // 2. Get favorite destination
    const favoriteDestResult = await db
        .select({
            city: flights.arrivalCity,
            count: sql<number>`count(*)`,
        })
        .from(bookings)
        .innerJoin(flights, eq(bookings.flightId, flights.id))
        .where(eq(bookings.passengerEmail, session.user.email))
        .groupBy(flights.arrivalCity)
        .orderBy(desc(sql`count(*)`))
        .limit(1);

    return {
        totalFlights: Number(count),
        favoriteDestination: favoriteDestResult[0]?.city || 'Not flown yet',
    };
}

export async function topUpWallet(amount: number) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    if (amount <= 0) {
        throw new Error("Invalid amount");
    }

    const [updatedUser] = await db
        .update(user)
        .set({
            balance: sql`${user.balance} + ${amount}`,
        })
        .where(eq(user.id, session.user.id))
        .returning();

    return updatedUser;
}
