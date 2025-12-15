import { pgTable, serial, varchar, integer, real, timestamp, text, index, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const flights = pgTable("flight", {
  id: serial("id").primaryKey(),
  airline: varchar("airline", { length: 255 }).notNull(),
  departureCity: varchar("departure_city", { length: 255 }).notNull(),
  arrivalCity: varchar("arrival_city", { length: 255 }).notNull(),
  basePrice: real("base_price").notNull(),
  departureTime: timestamp("departure_time", { withTimezone: true }).notNull(),
});

export const bookings = pgTable("booking", {
  id: serial("id").primaryKey(),
  flightId: integer("flight_id")
    .notNull()
    .references(() => flights.id, { onDelete: "cascade" }),

  passengerName: varchar("passenger_name", { length: 255 }).notNull(),
  passengerEmail: varchar("passenger_email", { length: 255 }).notNull(),
  pricePaid: real("price_paid").notNull(),
  bookingDate: timestamp("booking_date").defaultNow().notNull(),
  pnr: varchar("pnr", { length: 50 }).notNull().unique(),
});

export const surgeLogs = pgTable("surge_log", {
  id: serial("id").primaryKey(),
  flightId: integer("flight_id")
    .notNull()
    .references(() => flights.id, { onDelete: "cascade" }),

  attemptAt: timestamp("attempt_at").defaultNow().notNull(),
});

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  balance: real("balance").default(50000).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const flightRelations = relations(flights, ({ many }) => ({
  bookings: many(bookings),
  surgeLogs: many(surgeLogs),
}));

export const bookingRelations = relations(bookings, ({ one }) => ({
  flight: one(flights, {
    fields: [bookings.flightId],
    references: [flights.id],
  }),
}));

export const surgeLogRelations = relations(surgeLogs, ({ one }) => ({
  flight: one(flights, {
    fields: [surgeLogs.flightId],
    references: [flights.id],
  }),
}));

export const schema = {
  flights,
  bookings,
  surgeLogs,
};
