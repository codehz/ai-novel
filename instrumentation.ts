export async function register() {
  if (process.env.NEXT_RUNTIME !== "edge") {
    // Dynamic import to avoid edge runtime bundling issues
    console.log("Starting Sqlite3 World...");
    const { getWorld } = await import("workflow/runtime");
    await getWorld().start?.();
    console.log("Sqlite3 World started");
  }
}
