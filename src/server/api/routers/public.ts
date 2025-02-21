import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { env } from "~/env";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { categories, users, models, modelIterations } from "~/server/db/schema";

export const publicRouter = createTRPCRouter({
  modelsPage: publicProcedure
    .input(
      z.object({
        page: z.number().min(1),
        search: z.string().nullable().default(null),
        category: z.number().min(0).nullable().default(null),
        user: z.string().uuid().nullable().default(null),
      }),
    )
    .query(async ({ ctx, input }) => {
      const perPage = env.NEXT_PUBLIC_PER_PAGE;
      const offset = (input.page - 1) * perPage;

      const filters = [
        sql`1 = 1`,
        input.search
          ? or(
              ilike(models.title, `%${input.search}%`),
              ilike(models.description, `%${input.search}%`),
            )
          : undefined,
        input.category ? eq(models.categoryId, input.category) : undefined,
        input.user ? eq(models.userId, input.user) : undefined,
      ].filter(Boolean);

      const resModels = await ctx.db.query.models.findMany({
        where: and(...filters),
        limit: perPage,
        offset,
        columns: {
          id: true,
          title: true,
          description: true,
          images: true,
        },
        with: {
          category: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      });
      const resCount = await ctx.db
        .select({
          count: sql`count(*)`.mapWith(Number),
        })
        .from(models)
        .where(and(...filters));
      const resCountNum = resCount[0]?.count ?? 0;
      const resPages = Math.ceil(resCountNum / perPage);
      return {
        models: resModels.map((model) => ({
          ...model,
          images: model.images.map((image) => `${env.IMAGE_PREFIX}${image}`),
        })),
        pages: resPages,
      };
    }),

  modelPage: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const res = await ctx.db.query.models.findFirst({
        where: eq(models.id, input.id),
        columns: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          images: true,
        },
        with: {
          iterations: {
            columns: {
              id: true,
              number: true,
              code: true,
              createdAt: true,
              timeToGenerate: true,
            },
            with: {
              parameters: {
                columns: {
                  id: true,
                  name: true,
                  datatype: true,
                  defaultValue: true,
                  description: true,
                },
              },
            },
            orderBy: desc(modelIterations.createdAt),
          },
          user: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });
      return res
        ? {
            ...res,
            images: res.images.map((image) => `${env.IMAGE_PREFIX}${image}`),
          }
        : null;
    }),

  modelTitle: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const res = await ctx.db.query.models.findFirst({
        where: eq(models.id, input.id),
        columns: {
          title: true,
        },
      });
      return res?.title ?? null;
    }),

  categories: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.query.categories.findMany({
      orderBy: asc(categories.name),
      columns: {
        id: true,
        name: true,
      },
    });
    return {
      names: ["None", ...result.map(({ name }) => name)],
      keyName: result.reduce(
        (categories, current) => {
          categories[current.id] = current.name;
          return categories;
        },
        { 0: "None" } as Record<number, string>,
      ),
      nameKey: result.reduce(
        (categories, current) => {
          categories[current.name] = current.id;
          return categories;
        },
        { None: 0 } as Record<string, number>,
      ),
    };
  }),

  userPage: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const res = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
        columns: {
          id: true,
          name: true,
        },
      });
      return res ?? null;
    }),
});
