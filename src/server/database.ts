import { createClient, type Client } from "edgedb";
import { env } from "~/env";

const globalForEdgeDB = global as unknown as { edgedb: Client };

export const edgedb = globalForEdgeDB.edgedb || createClient();

if (env.NODE_ENV !== "production") globalForEdgeDB.edgedb = edgedb;

export default edgedb;
