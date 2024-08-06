import { env } from "~/env";
import { Client } from "minio";

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
