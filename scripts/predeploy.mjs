import { readFile } from "node:fs/promises";

const target = process.argv[2];
if (!new Set(["staging", "production"]).has(target)) throw new Error("usage: node scripts/predeploy.mjs staging|production");
const config = JSON.parse(await readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8"));
const env = config.env?.[target];
if (!env) throw new Error(`missing environment ${target}`);
const serialized = JSON.stringify(env);
const invalid = ["00000000-0000-0000-0000-000000000000", "REPLACE_ME", "REPLACE_WITH_APPROVED_SNAPSHOT", "example.pipedrive.com"];
for (const value of invalid) if (serialized.includes(value)) throw new Error(`${target} still contains placeholder: ${value}`);
for (const key of ["PIPEDRIVE_OWNER_ID", "PIPEDRIVE_QA_OWNER_ID", "PIPEDRIVE_CHANNEL"]) {
  if (Number(env.vars?.[key]) <= 0) throw new Error(`${target}.${key} must be configured`);
}
if (!env.vars?.PIPEDRIVE_BLOG_LABEL_ID) throw new Error(`${target}.PIPEDRIVE_BLOG_LABEL_ID must be configured`);
console.log(`${target}: configuration ready`);
