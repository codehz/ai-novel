import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import * as schema from "./schema";

const sqlite = new Database(Bun.env.DB_FILE_NAME!);
export const db = drizzle({ client: sqlite, schema });
migrate(db, { migrationsFolder: "./drizzle" });
