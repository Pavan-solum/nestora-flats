import fs from "node:fs";
import path from "node:path";

const file = path.join(process.cwd(), ".env");
if (fs.existsSync(file)) {
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const separator = line.indexOf("=");
    if (separator <= 0 || line.startsWith("#")) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

async function main() {
  const { seedDatabase } = await import("../src/lib/supabase/records");
  const result = await seedDatabase();
  console.log(
    `Seeded ${result.flats} flats and ${result.images} images. Extra columns: ${result.extraColumns}`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
