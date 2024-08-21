import { env } from "~/env";
import { Client } from "minio";
import { v4 as uuidv4 } from 'uuid';
import { TRPCError } from "@trpc/server";

const globalForMinio = global as unknown as { minio: Client };

export const minio = globalForMinio.minio || new Client({
  endPoint: env.MINIO_ENDPOINT,
  port: env.MINIO_PORT,
  useSSL: env.MINIO_USE_SSL,
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY,
});

if (env.NODE_ENV !== "production") globalForMinio.minio = minio;

export default minio;

export const saveImages = (minio: Client, images: string[]) => {
  return Promise.all(images.map(async (image) => {
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

    const presignedUrlRaw = await minio.presignedPutObject(env.MINIO_BUCKET, newFileName, 60);
    const presignedUrl = presignedUrlRaw.replace(/https?\:\/\/[a-zA-Z\-]*(\:[0-9]{1,5})?\/[a-zA-Z\-]*\//gm, env.IMAGE_PREFIX);
    return {
      fileName: newFileName,
      presignedUrl,
    };
  }));
};

export const removeImages = (minio: Client, images: string[]) => {
  return Promise.all(images.map(async (image) => {
    await minio.removeObject(env.MINIO_BUCKET, image);
  }));
};
