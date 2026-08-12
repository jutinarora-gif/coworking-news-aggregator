// Produces an email-safe JPEG copy of a space's cover photo, without
// touching spaces.cover_url (which stays AVIF/WebP for on-site use --
// those formats are meaningfully smaller and most site traffic is
// browsers that render them fine). Email clients are a different
// audience: Outlook doesn't render AVIF at all and only partially
// supports WebP, so anything going into a newsletter needs a plain JPEG.
//
// Usage: node scripts/email-image.mjs <space-slug>
// Prints the public JPEG URL to paste into the emailer. Re-running for
// the same slug just overwrites that one email-jpg file (upsert), so
// it's safe to re-run whenever Space of the Week changes.

import { createClient } from "@supabase/supabase-js";
import { execFileSync } from "node:child_process";
import { writeFileSync, readFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const BUCKET = "space-photos";
const EMAIL_PREFIX = "email-jpg";

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error("Usage: node scripts/email-image.mjs <space-slug>");
    process.exit(1);
  }

  const { data: space, error } = await supabase.from("spaces").select("name,cover_url").eq("slug", slug).maybeSingle();
  if (error) throw error;
  if (!space) throw new Error(`No space found for slug "${slug}"`);
  if (!space.cover_url) throw new Error(`"${space.name}" has no cover_url set`);

  console.log(`Converting cover photo for ${space.name}...`);
  const res = await fetch(space.cover_url);
  if (!res.ok) throw new Error(`Failed to fetch cover_url: ${res.status}`);
  const srcBuf = Buffer.from(await res.arrayBuffer());

  const srcPath = join(tmpdir(), `${slug}-src`);
  const jpgPath = join(tmpdir(), `${slug}-email.jpg`);
  writeFileSync(srcPath, srcBuf);

  execFileSync("python3", [
    "-c",
    `
from PIL import Image
im = Image.open("${srcPath}").convert("RGB")
im.save("${jpgPath}", "JPEG", quality=88)
`,
  ]);

  const jpgBuf = readFileSync(jpgPath);
  unlinkSync(srcPath);
  unlinkSync(jpgPath);

  const path = `${EMAIL_PREFIX}/${slug}.jpg`;
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, jpgBuf, { contentType: "image/jpeg", upsert: true });
  if (upErr) throw upErr;

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  console.log(`\nEmail-safe JPEG ready (site's cover_url was NOT changed):\n${pub.publicUrl}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
