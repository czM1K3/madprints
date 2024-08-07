import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import e from "e";
import { TRPCError } from "@trpc/server";
import { env } from "~/env";
import { v4 as uuidv4 } from 'uuid';

export const modelRouter = createTRPCRouter({
  create: protectedProcedure.input(z.object({
    title: z.string(),
    description: z.string(),
    code: z.string(),
    category: z.string().uuid().nullable(),
    parameters: z.array(z.object({
      name: z.string(),
      datatype: z.enum([ "Number", "Boolean", "String"]),
      default_value: z.string(),
      description: z.string().nullable(),
    })),
    images: z.array(z.string()).max(10),
  })).mutation(async ({ ctx, input }) => {
    const res = await ctx.edgedb.transaction(async (edgedb) => {
      const images = await Promise.all(input.images.map(async (image) => {
        const uuid = uuidv4();
        const splitted = image.split(".");
        if (splitted.length < 2) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Image doesn't have extension",
          })
        }
        const extension = splitted[splitted.length - 1];
        const newFileName = `${uuid}.${extension}`;

        const presignedUrl = await ctx.minio.presignedPutObject(env.MINIO_BUCKET, newFileName, 60);
        return {
          fileName: newFileName,
          presignedUrl,
        };
      }));
      const { id : modelId } = await e.insert(e.Model, {
        title: input.title,
        description: input.description,
        user: e.select(e.User, (user) =>({
          filter_single: e.op(user.id, "=", e.uuid(ctx.session.user.id))
        })),
        category: input.category ? (
          e.select(e.Category, (category) => ({
            filter_single: e.op(category.id, "=", e.uuid(input.category!))
          }))
        ) : null,
        images: images.map((image) => image.fileName),
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

      return {
        id: modelId,
        presignedUrls: images.map((image) => image.presignedUrl),
      };
    });
    return res;
  }),

  editProps: protectedProcedure.input(z.object({
    id: z.string().uuid(),
  })).query(async ({ ctx, input }) => {
    const res = await e.select(e.Model, (model) => ({
      id: true,
      title: true,
      description: true,
      category: {
        id: true,
      },
      user: {
        id: true,
      },
      images: true,
      filter_single: e.op(model.id, "=", e.uuid(input.id)),
    })).run(ctx.edgedb);
    if (res && res.user.id === ctx.session.user.id) {
      return {
        ...res,
        user: undefined,
      };
    } else if (!res) {
      throw new TRPCError({message: "Model no found", code: "NOT_FOUND" });
    } else {
      throw new TRPCError({message: "Wrong user", code: "UNAUTHORIZED" });
    }
  }),

  edit: protectedProcedure.input(z.object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string(),
    category: z.string().uuid().nullable(),
  })).mutation(async ({ ctx, input }) => {
    const res = await e.select(e.Model, (model) => ({
      user: {
        id: true,
      },
      filter_single: e.op(model.id, "=", e.uuid(input.id)),
    })).run(ctx.edgedb);
    if (!res) {
      throw new TRPCError({message: "Model no found", code: "NOT_FOUND" });
    }
    if (res.user.id !== ctx.session.user.id) {
      throw new TRPCError({message: "Wrong user", code: "UNAUTHORIZED" });
    }
    await e.update(e.Model, (model) => ({
      filter: e.op(model.id, "=", e.uuid(input.id)),
      set: {
        title: input.title,
        description: input.description,
        category: input.category ? (
          e.select(e.Category, (category) => ({
            filter_single: e.op(category.id, "=", e.uuid(input.category!))
          }))
        ) : null,
      },
    })).run(ctx.edgedb);
  }),

  newIterationProps: protectedProcedure.input(z.object({
    id: z.string().uuid(),
  })).query(async ({ ctx, input }) => {
    const res = await e.select(e.Model, (model) => ({
      id: true,
      user: {
        id: true,
      },
      iterations: (modelIteration) => ({
        id: true,
        code: true,
        parameters: {
          id: true,
          datatype: true,
          default_value: true,
          description: true,
          name: true,
        },
        order_by: {
          expression: modelIteration.number,
          direction: e.DESC,
        },
        limit: 1,
      }),
      filter_single: e.op(model.id, "=", e.uuid(input.id)),
    })).run(ctx.edgedb);
    if (res && res.user.id === ctx.session.user.id && res.iterations.length === 1) {
      return {
        id: res.id,
        iteration: res.iterations[0]!,
      };
    } else if (!res) {
      throw new TRPCError({message: "Model no found", code: "NOT_FOUND" });
    } else {
      throw new TRPCError({message: "Wrong user", code: "UNAUTHORIZED" });
    }
  }),

  newIteration: protectedProcedure.input(z.object({
    id: z.string().uuid(),
    code: z.string(),
    parameters: z.array(z.object({
      name: z.string(),
      datatype: z.enum([ "Number", "Boolean", "String"]),
      default_value: z.string(),
      description: z.string().nullable(),
    })),
  })).mutation(async ({ ctx, input }) => {
    const res = await e.select(e.Model, (model) => ({
      user: {
        id: true,
      },
      filter_single: e.op(model.id, "=", e.uuid(input.id)),
    })).run(ctx.edgedb);
    if (!res) {
      throw new TRPCError({message: "Model no found", code: "NOT_FOUND" });
    }
    if (res.user.id !== ctx.session.user.id) {
      throw new TRPCError({message: "Wrong user", code: "UNAUTHORIZED" });
    }
    await ctx.edgedb.transaction(async (edgedb) => {
      const modelIteration = await e.select(e.ModelIteration, (modelIteration) => ({
        number: true,
        model: {
          id: true,
        },
        order_by: {
          expression: modelIteration.number,
          direction: e.DESC,
        },
        limit: 1,
        filter: e.op(modelIteration.model.id, "=", e.uuid(input.id)),
      })).run(edgedb);
      const nextNumber = (modelIteration[0]?.number ?? 0) + 1;
      const modelIterationNew = await e.insert(e.ModelIteration, {
        code: input.code,
        number: nextNumber,
        model: e.select(e.Model, (model) => ({
          id: true,
          filter_single: e.op(model.id, "=", e.uuid(modelIteration[0]!.model.id)),
        })),
      }).run(edgedb);
      for (const parameter of input.parameters) {
        await e.insert(e.ModelIterationParameters, {
          datatype: parameter.datatype,
          default_value: parameter.default_value,
          name: parameter.name,
          description: parameter.description === "" ? null : parameter.description,
          modelIteration: e.select(e.ModelIteration, (modelIteration) => ({
            filter_single: e.op(modelIteration.id, "=", e.uuid(modelIterationNew.id))
          })),
        }).run(edgedb);
      }
    });
    return 1;
  }),
});
