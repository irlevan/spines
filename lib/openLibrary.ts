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
