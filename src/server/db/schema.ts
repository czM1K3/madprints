import { relations, sql } from "drizzle-orm";
import {
  integer,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
  serial,
  pgEnum,
} from "drizzle-orm/pg-core";
import { type AdapterAccountType } from "next-auth/adapters";

export const createTable = pgTableCreator((name) => `${name}`);

export const models = createTable("models", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  categoryId: integer("category_id").references(() => categories.id),
  images: text("images").array().notNull(),
});

export const modelIterations = createTable("model_iterations", {
  id: serial("id").primaryKey(),
  number: integer("number").notNull(),
  code: text("code").notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  timeToGenerate: integer("time_to_generate"),
  modelId: text("model_id")
    .notNull()
    .references(() => models.id, { onDelete: "cascade" }),
});

export const parameterTypeEnum = pgEnum("parameterType", ["Number", "Boolean", "String"]);

export const modelIterationParameters = createTable("model_iteration_parameters", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  datatype: parameterTypeEnum().notNull(),
  defaultValue: varchar("default_value").notNull(),
  description: text("description"),
  modelIterationId: integer("model_iteration_id")
    .notNull()
    .references(() => modelIterations.id, { onDelete: "cascade" }),
});

export const categories = createTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

// Auth.js stuff

export const users = createTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
})

export const accounts = createTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
)

export const sessions = createTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = createTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ]
)

export const usersRelations = relations(users, ({ many }) => ({
  models: many(models),
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const modelsRelations = relations(models, ({ one, many }) => ({
  user: one(users, {
    fields: [models.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [models.categoryId],
    references: [categories.id],
  }),
  iterations: many(modelIterations),
}));

export const modelIterationsRelations = relations(
  modelIterations,
  ({ one, many }) => ({
    model: one(models, {
      fields: [modelIterations.modelId],
      references: [models.id],
    }),
    parameters: many(modelIterationParameters),
  })
);

export const modelIterationParametersRelations = relations(
  modelIterationParameters,
  ({ one }) => ({
    modelIteration: one(modelIterations, {
      fields: [modelIterationParameters.modelIterationId],
      references: [modelIterations.id],
    }),
  })
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  models: many(models),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));
