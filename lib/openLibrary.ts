const SEARCH_URL = "https://openlibrary.org/search.json";
const COVERS_URL = "https://covers.openlibrary.org/b/id";

export interface OpenLibraryResult {
  title: string;
  author: string;
  isbn: string | null;
  coverUrl: string | null;
  pageCount: number | null;
  openLibraryKey: string;
}

interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  isbn?: string[];
  cover_i?: number;
  number_of_pages_median?: number;
}

export async function searchOpenLibrary(query: string): Promise<OpenLibraryResult[]> {
  const url = new URL(SEARCH_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "10");
  url.searchParams.set("fields", "key,title,author_name,isbn,cover_i,number_of_pages_median");

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Open Library search failed: ${res.status}`);
  }

  const data: { docs: OpenLibraryDoc[] } = await res.json();

  return data.docs.map((doc) => ({
    title: doc.title,
    author: doc.author_name?.[0] ?? "Unknown",
    isbn: doc.isbn?.[0] ?? null,
    coverUrl: doc.cover_i ? `${COVERS_URL}/${doc.cover_i}-M.jpg` : null,
    pageCount: doc.number_of_pages_median ?? null,
    openLibraryKey: doc.key,
  }));
}

export interface OpenLibraryEdition {
  editionKey: string;
  coverUrl: string | null;
  pageCount: number | null;
  publisher: string | null;
  publishDate: string | null;
  isbn: string | null;
}

interface OpenLibraryEditionEntry {
  key: string;
  covers?: number[];
  number_of_pages?: number;
  publishers?: string[];
  publish_date?: string;
  isbn_13?: string[];
  isbn_10?: string[];
}

// A "work" (e.g. /works/OL12345W) can have many published editions with
// different page counts, covers, and publishers. This lists them so the
// reader can pick the physical copy they actually own.
export async function getEditions(workKey: string): Promise<OpenLibraryEdition[]> {
  const res = await fetch(`https://openlibrary.org${workKey}/editions.json?limit=25`);
  if (!res.ok) {
    throw new Error(`Open Library editions lookup failed: ${res.status}`);
  }

  const data: { entries: OpenLibraryEditionEntry[] } = await res.json();

  return data.entries
    .map((entry) => ({
      editionKey: entry.key,
      coverUrl: entry.covers?.[0] ? `${COVERS_URL}/${entry.covers[0]}-M.jpg` : null,
      pageCount: entry.number_of_pages ?? null,
      publisher: entry.publishers?.[0] ?? null,
      publishDate: entry.publish_date ?? null,
      isbn: entry.isbn_13?.[0] ?? entry.isbn_10?.[0] ?? null,
    }))
    .filter((edition) => edition.coverUrl || edition.pageCount || edition.publisher);
}

export interface IsbnLookupResult {
  coverUrl: string | null;
  pageCount: number | null;
  publisher: string | null;
}

interface OpenLibraryIsbnEntry {
  covers?: number[];
  number_of_pages?: number;
  publishers?: string[];
}

// Best-effort enrichment for imported rows that only carry an ISBN. Returns
// all-null on any failure so a single bad ISBN can't fail an entire import.
export async function lookupByIsbn(isbn: string): Promise<IsbnLookupResult> {
  try {
    const res = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
    if (!res.ok) return { coverUrl: null, pageCount: null, publisher: null };
    const data: OpenLibraryIsbnEntry = await res.json();
    return {
      coverUrl: data.covers?.[0] ? `${COVERS_URL}/${data.covers[0]}-M.jpg` : null,
      pageCount: data.number_of_pages ?? null,
      publisher: data.publishers?.[0] ?? null,
    };
  } catch {
    return { coverUrl: null, pageCount: null, publisher: null };
  }
}
