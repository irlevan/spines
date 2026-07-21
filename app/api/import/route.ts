import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { parseImportCsv } from "@/lib/importCsv";
import { lookupByIsbn } from "@/lib/openLibrary";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const text = await file.text();

  let parsed;
  try {
    parsed = parseImportCsv(text);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }

  const existing = await prisma.book.findMany({ select: { title: true, author: true } });
  const existingKeys = new Set(existing.map((b) => `${normalize(b.title)}::${normalize(b.author)}`));

  let imported = 0;
  let skipped = 0;

  for (const row of parsed.books) {
    const key = `${normalize(row.title)}::${normalize(row.author)}`;
    if (existingKeys.has(key)) {
      skipped++;
      continue;
    }
    existingKeys.add(key);

    let coverUrl: string | null = null;
    let pageCount: number | null = null;
    let publisher: string | null = null;
    if (row.isbn) {
      const enriched = await lookupByIsbn(row.isbn);
      coverUrl = enriched.coverUrl;
      pageCount = enriched.pageCount;
      publisher = enriched.publisher;
    }

    await prisma.book.create({
      data: {
        title: row.title,
        author: row.author,
        isbn: row.isbn,
        coverUrl,
        pageCount,
        publisher,
        format: row.format,
        shelf: row.shelf,
        rating: row.rating,
        moodTags: row.moodTags,
        paceTag: row.paceTag,
        reviewText: row.reviewText,
        dateFinished: row.dateFinished,
      },
    });
    imported++;
  }

  revalidatePath("/");
  revalidatePath("/library");

  return NextResponse.json({ source: parsed.source, imported, skipped });
}
