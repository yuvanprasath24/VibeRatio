import { NextRequest, NextResponse } from "next/server";
import { ZipArchive } from "archiver";
import { PassThrough, Readable } from "stream";

interface BasketItemPayload {
  url: string;
  name: string;
  provider: string;
}

function isAllowedHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return (
    h === "pexels.com" ||
    h.endsWith(".pexels.com") ||
    h === "pixabay.com" ||
    h.endsWith(".pixabay.com")
    // NOTE: Unsplash disabled — uncomment to allow after re-enabling.
    // ||
    // h === "unsplash.com" ||
    // h.endsWith(".unsplash.com")
  );
}

function safeName(raw: string): string {
  return raw.replace(/[^\w.\-]+/g, "_").slice(0, 80).trim() || "wallpaper";
}

function fileExt(pathname: string): string {
  const match = /\.([a-z0-9]+)$/i.exec(pathname);
  if (match && ["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(match[1].toLowerCase())) {
    return match[1].toLowerCase();
  }
  return "jpg";
}

const MAX_ITEMS = 50;
const MAX_TOTAL_BYTES = 200 * 1024 * 1024;

export async function POST(req: NextRequest) {
  let body: { items?: BasketItemPayload[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const items = body.items;
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "No items provided" }, { status: 400 });
  }
  if (items.length > MAX_ITEMS) {
    return NextResponse.json({ error: `Too many items (max ${MAX_ITEMS})` }, { status: 400 });
  }

  for (const item of items) {
    if (!item.url || !item.name) continue;
    let target: URL;
    try {
      target = new URL(item.url);
    } catch {
      return NextResponse.json({ error: `Invalid URL: ${item.url}` }, { status: 400 });
    }
    if (target.protocol !== "https:" || !isAllowedHost(target.hostname)) {
      return NextResponse.json({ error: `Host not allowed: ${target.hostname}` }, { status: 400 });
    }
  }

  const passThrough = new PassThrough();
  const archive = new ZipArchive({ zlib: { level: 6 } });

  archive.pipe(passThrough);

  let totalBytes = 0;
  const validItems = items.filter((item) => item.url && item.name);

  for (const item of validItems) {
    try {
      const upstream = await fetch(item.url, { cache: "no-store" });
      if (!upstream.ok || !upstream.body) continue;

      const contentLength = Number(upstream.headers.get("content-length") ?? 0);
      if (contentLength > 0 && totalBytes + contentLength > MAX_TOTAL_BYTES) {
        continue;
      }

      const buffer = Buffer.from(await upstream.arrayBuffer());
      totalBytes += buffer.length;

      const ext = fileExt(new URL(item.url).pathname);
      const filename = `${safeName(item.name)}.${ext}`;
      archive.append(buffer, { name: filename });
    } catch {
      // skip failed items silently
    }
  }

  archive.finalize();

  const headers = new Headers();
  headers.set("Content-Type", "application/zip");
  headers.set("Content-Disposition", 'attachment; filename="wallpaper-basket.zip"');

  return new Response(Readable.toWeb(passThrough) as ReadableStream, {
    status: 200,
    headers,
  });
}
