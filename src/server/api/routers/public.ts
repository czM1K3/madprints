import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import e from "e";
import { env } from "~/env";

export const publicRouter = createTRPCRouter({
  modelsPage: publicProcedure
    .input(z.object({
      page: z.number().min(1),
    }))
    .query(async ({ ctx, input }) => {
      const modelsPromise = e.select(e.Model, (model) => ({
        id: true,
        title: true,
        description: true,
        limit: env.PER_PAGE,
        offset: (input.page - 1) * env.PER_PAGE,
        order_by: {
          expression: model.created_at,
          direction: e.DESC,
        },
      })).run(ctx.edgedb);
      const countPromise = e.count(e.select(e.Model, (model) => ({
        filter:e.op(model.title, "like", "%")
      }))).run(ctx.edgedb);
      const response = await Promise.all([modelsPromise, countPromise]);
      return {
        models: response[0],
        pages: Math.ceil(response[1] / env.PER_PAGE),
      };
    }),

  modelPage: publicProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const res = await e.select(e.Model, (model) => ({
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
        filter: e.op(model.id, "=", e.uuid(input.id)),
      })).run(ctx.edgedb);
      if (res.length === 1) {
        return res[0];
      } else {
        return null;
      }
    }),
});
