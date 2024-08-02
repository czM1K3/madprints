import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import e from "e";
import { env } from "~/env";

export type KeyValue = Record<string, string>;

export const publicRouter = createTRPCRouter({
  modelsPage: publicProcedure
    .input(z.object({
      page: z.number().min(1),
      search: z.string().nullable().default(null),
      category: z.string().uuid().nullable().default(null),
      user: z.string().uuid().nullable().default(null),
    }))
    .query(async ({ ctx, input }) => {
      const perPage = env.NEXT_PUBLIC_PER_PAGE;
      const query = e.tuple({
        models: e.array_agg(e.select(e.Model, (model) => ({
          id: true,
          title: true,
          description: true,
          category: {
            id: true,
            name: true,
          },
          limit: env.NEXT_PUBLIC_PER_PAGE,
          offset: e.op(e.op(input.page, "-", e.int32(1)), "*", perPage),
          order_by: {
            expression: model.created_at,
            direction: e.DESC,
          },
          filter: e.all(e.array_unpack(e.array([
            e.op(e.int32(1), "=", e.int32(1)),
            ...(input.search ? [
              e.op(
                e.op(model.title, "ilike", e.str(`%${input.search}%`)),
                "or",
                e.op(model.description, "ilike", e.str(`%${input.search}%`))
              )
            ]:[]),
            ...(input.category ? [
              e.op(model.category.id, "?=", e.uuid(input.category)),
            ]:[]),
            ...(input.user ? [
              e.op(model.user.id, "=", e.uuid(input.user)),
            ]:[]),
          ]))),
        }))),
        pages: e.math.ceil(
          e.op(
            e.count(e.select(e.Model, (model) => ({
              filter: e.all(e.array_unpack(e.array([
                e.op(e.int32(1), "=", e.int32(1)),
                ...(input.search ? [
                  e.op(
                    e.op(model.title, "ilike", e.str(`%${input.search}%`)),
                    "or",
                    e.op(model.description, "ilike", e.str(`%${input.search}%`))
                  )
                ]:[]),
                ...(input.category ? [
                  e.op(model.category.id, "?=", e.uuid(input.category)),
                ]:[]),
                ...(input.user ? [
                  e.op(model.user.id, "=", e.uuid(input.user)),
                ]:[]),
              ]))),
            }))),
            "/",
            perPage
          )
        ),
      });
      return await query.run(ctx.edgedb);
    }),

  modelPage: publicProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const query = e.params({
        id: e.uuid,
      }, (params) => e.select(e.Model, (model) => ({
        id: true,
        title: true,
        description: true,
        created_at: true,
        iterations: (iteration) => ({
          id: true,
          number: true,
          code: true,
          created_at: true,
          parameters: {
            id: true,
            name: true,
            datatype: true,
            default_value: true,
            description: true,
          },
          order_by: {
            expression: iteration.created_at,
            direction: e.DESC,
          },
        }),
        user: {
          id: true,
          name: true,
          image: true,
        },
        filter_single: e.op(model.id, "=", params.id),
      })));
      return await query.run(ctx.edgedb, {
        id: input.id,
      });
    }),

  modelTitle: publicProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .query(async ({ input, ctx }) => {
      const query = e.params({
        id: e.uuid,
      }, (params) => e.select(e.Model, (model) => ({
        id: true,
        title: true,
        filter_single: e.op(model.id, "=", params.id),
      })));
      const response = await query.run(ctx.edgedb, { id: input.id });
      return response?.title;
    }),

  categories: publicProcedure.query(async ({ ctx }) => {
    const query = e.select(e.Category, (category) => ({
      id: true,
      name: true,
      order_by: category.name,
    }));
    const result = await query.run(ctx.edgedb);
    return {
      names: ["None", ...result.map(({ name }) => name)],
      keyName: result.reduce((categories, current) => {
        categories[current.id] = current.name;
        return categories;
      }, { "": "None" } as KeyValue),
      nameKey: result.reduce((categories, current) => {
        categories[current.name] = current.id;
        return categories;
      }, { "None": "" } as KeyValue),
    };
  }),

  userPage: publicProcedure.input(z.object({
    id: z.string().uuid(),
  })).query(async ({ ctx, input }) => {
    const query = e.params({
      id: e.uuid
    }, (params) => e.select(e.User, (user) => ({
      id: true,
      name: true,
      filter_single: e.op(user.id, "=", params.id),
    })));
    return await query.run(ctx.edgedb, {
      id: input.id,
    });
  }),
});
