import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { saveImages, removeImages } from "~/server/strorage";
import { env } from "~/env";
import { categories, modelIterationParameters, modelIterations, models } from "~/server/db/schema";
import { desc, eq } from "drizzle-orm";

export const modelRouter = createTRPCRouter({
  create: protectedProcedure.input(z.object({
    title: z.string(),
    description: z.string(),
    code: z.string(),
    category: z.number().min(0).nullable(),
    parameters: z.array(z.object({
      name: z.string(),
      datatype: z.enum([ "Number", "Boolean", "String"]),
      defaultValue: z.string(),
      description: z.string().nullable(),
    })),
    images: z.array(z.string()).min(1).max(10),
    timeToGenerate: z.number().int().min(0).nullable(),
  })).mutation(async ({ ctx, input }) => {
    const res = await ctx.db.transaction(async (tx) => {
      const images = await saveImages(ctx.minio, input.images);
      const insertedModels = await tx.insert(models).values({
        title: input.title,
        description: input.description,
        userId: ctx.session.user.id,
        categoryId: input.category !== 0 ? input.category : null,
        images: images.map((image) => image.fileName),
      }).returning();
      const modelId = insertedModels[0]?.id ?? null;
      if (!modelId) {
        throw new Error("Something went wrong");
      }
      const insertedModelIteration = await tx.insert(modelIterations).values({
        code: input.code,
        number: 1,
        modelId,
        timeToGenerate: input.timeToGenerate,
      }).returning();
      const modelIterationId = insertedModelIteration[0]?.id ?? null;
      if (!modelIterationId) {
        throw new Error("Something went wrong");
      }
      for (const parameter of input.parameters) {
        await tx.insert(modelIterationParameters).values({
          datatype: parameter.datatype,
          defaultValue: parameter.defaultValue,
          name: parameter.name,
          description: parameter.description === "" ? null : parameter.description,
          modelIterationId,
        });
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
    const res = await ctx.db.query.models.findFirst({
      where: eq(models.id, input.id),
      columns: {
        id: true,
        title: true,
        description: true,
        images: true,
        categoryId: true,
        userId: true,
      },
    });
    if (res && res.userId === ctx.session.user.id) {
      return {
        ...res,
        images: res.images.map((image) => `${env.IMAGE_PREFIX}${image}`),
        userId: undefined,
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
    category: z.number().min(0).nullable(),
    images: z.array(z.string()).min(1).max(10).nullable(),
  })).mutation(async ({ ctx, input }) => {
    const res = await ctx.db.query.models.findFirst({
      where: eq(models.id, input.id),
      columns: {
        userId: true,
        images: true,
      }
    });
    if (!res) {
      throw new TRPCError({message: "Model no found", code: "NOT_FOUND" });
    }
    if (res.userId !== ctx.session.user.id) {
      throw new TRPCError({message: "Wrong user", code: "UNAUTHORIZED" });
    }
    if (input.category && input.category !== 0) {
      const category = await ctx.db.query.categories.findFirst({
        where: eq(categories.id, input.category),
      });
      if (!category) {
        throw new TRPCError({message: "Category no found", code: "NOT_FOUND" });
      }
    }
    const newImages = input.images === null ? null : await saveImages(ctx.minio, input.images);

    await ctx.db.update(models).set({
      title: input.title,
      description: input.description,
      images: newImages === null ? undefined : newImages.map((image) => image.fileName),
      categoryId: input.category !== 0 ? input.category : null,
    }).where(eq(models.id, input.id));
    if (newImages !== null) {
      await removeImages(ctx.minio, res.images)
    }
    return {
      presignedUrls: newImages?.map((image) => image.presignedUrl) ?? null,
    };
  }),

  newIterationProps: protectedProcedure.input(z.object({
    id: z.string().uuid(),
  })).query(async ({ ctx, input }) => {
    const res = await ctx.db.query.models.findFirst({
      where: eq(models.id, input.id),
      columns: {
        id: true,
        userId: true,
      },
      with: {
        iterations: {
          orderBy: desc(modelIterations.number),
          limit: 1,
          columns: {
            id: true,
            code: true,
          },
          with: {
            parameters: {
              columns: {
                id: true,
                datatype: true,
                defaultValue: true,
                description: true,
                name: true,
              },
            },
          },
        },
      },
    });
    if (res && res.userId === ctx.session.user.id && res.iterations.length === 1) {
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

  // TODO more validation
  newIteration: protectedProcedure.input(z.object({
    id: z.string().uuid(),
    code: z.string(),
    parameters: z.array(z.object({
      name: z.string(),
      datatype: z.enum([ "Number", "Boolean", "String"]),
      defaultValue: z.string(),
      description: z.string().nullable(),
    })),
    timeToGenerate: z.number().int().min(0).nullable(),
  })).mutation(async ({ ctx, input }) => {
    const res = await ctx.db.query.models.findFirst({
      columns: {
        userId: true,
      },
      where: eq(models.id, input.id),
    });
    if (!res) {
      throw new TRPCError({message: "Model no found", code: "NOT_FOUND" });
    }
    if (res.userId !== ctx.session.user.id) {
      throw new TRPCError({message: "Wrong user", code: "UNAUTHORIZED" });
    }
    await ctx.db.transaction(async (tx) => {
      const modelIteration = await tx.query.modelIterations.findMany({
        where: eq(modelIterations.modelId, input.id),
        columns: {
          number: true,
          modelId: true,
        },
        orderBy: desc(modelIterations.number),
        limit: 1,
      });
      const nextNumber = (modelIteration[0]?.number ?? 0) + 1;
      const modelIterationNew = await tx.insert(modelIterations).values({
        code: input.code,
        number: nextNumber,
        modelId: input.id,
        timeToGenerate: input.timeToGenerate,
      }).returning();
      for (const parameter of input.parameters) {
        await tx.insert(modelIterationParameters).values({
          datatype: parameter.datatype,
          defaultValue: parameter.defaultValue,
          name: parameter.name,
          description: parameter.description === "" ? null : parameter.description,
          modelIterationId: modelIterationNew[0]!.id
        });
      }
    });
    return 1;
  }),
});
