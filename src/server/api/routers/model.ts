import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import e from "e";

export const modelRouter = createTRPCRouter({
  create: protectedProcedure.input(z.object({
    title: z.string(),
    description: z.string(),
    code: z.string(),
    parameters: z.array(z.object({
      name: z.string(),
      datatype: z.enum([ "Number", "Boolean", "String"]),
      default_value: z.string(),
      description: z.string().nullable(),
    })),
  })).mutation(async ({ ctx, input }) => {
    const modelId = await ctx.edgedb.transaction(async (edgedb) => {
      const { id : modelId } = await e.insert(e.Model, {
        title: input.title,
        description: input.description,
        user: e.select(e.User, (user) =>({
          filter_single: e.op(user.id, "=", e.uuid(ctx.session.user.id))
        })),
      }).run(edgedb);
      const { id: modelIterationId } = await e.insert(e.ModelIteration, {
        code: input.code,
        number: 1,
        model: e.select(e.Model, (model) => ({
          filter_single: e.op(model.id, "=", e.uuid(modelId)),
        })),
      }).run(edgedb);
      for (const parameter of input.parameters) {
        await e.insert(e.ModelIterationParameters, {
          datatype: parameter.datatype,
          default_value: parameter.default_value,
          name: parameter.name,
          description: parameter.description === "" ? null : parameter.description,
          modelIteration: e.select(e.ModelIteration, (modelIteration) => ({
            filter_single: e.op(modelIteration.id, "=", e.uuid(modelIterationId))
          })),
        }).run(edgedb);
      }
      return modelId;
    });
    return modelId;
  }),
});
