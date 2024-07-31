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
      const query = e.params({
        page: e.int32,
        perPage: e.int32,
      }, (params) => e.tuple({
        models: e.array_agg(e.select(e.Model, (model) => ({
          id: true,
          title: true,
          description: true,
          limit: env.PER_PAGE,
          offset: e.op(e.op(params.page, "-", e.int32(1)), "*", params.perPage),
          order_by: {
            expression: model.created_at,
            direction: e.DESC,
          },
        }))),
        pages: e.math.ceil(
          e.op(
            e.count(e.select(e.Model, (model) => ({
              filter: e.op(model.title, "like", "%")
            }))),
            "/",
            params.perPage
          )
        ),
      }));
      return await query.run(ctx.edgedb,  {
        page: input.page,
        perPage: env.PER_PAGE,
      });
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
});
