export type SafePreviewKind = "pdf" | "link";

export type SafePreviewTarget = {
  id: string;
  label: string;
  url: string;
  kind: SafePreviewKind;
  description?: string | null;
};

const URL_PATTERN = /\bhttps?:\/\/[^\s<>"'`]+/gi;
const TRAILING_PUNCTUATION_PATTERN = /[.,!?;:]+$/;

function trimSubmittedUrl(rawUrl: string): string {
  let candidate = rawUrl.trim().replace(TRAILING_PUNCTUATION_PATTERN, "");

  while (candidate.endsWith(")") && !candidate.includes("(")) {
    candidate = candidate.slice(0, -1);
  }

  while (candidate.endsWith("]") && !candidate.includes("[")) {
    candidate = candidate.slice(0, -1);
  }

  return candidate.replace(TRAILING_PUNCTUATION_PATTERN, "");
}

export function toSafeHttpUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) return null;

  const trimmed = trimSubmittedUrl(rawUrl);
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.href;
  } catch {
    return null;
  }
}

export function getPreviewHostname(rawUrl: string): string {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, "");
  } catch {
    return "Submitted link";
  }
}

export function isPdfPreviewTarget({
  fileName,
  fileType,
  url,
}: {
  fileName?: string | null;
  fileType?: string | null;
  url: string;
}): boolean {
  const normalizedType = fileType?.toLowerCase() ?? "";
  if (normalizedType.includes("pdf")) return true;

  try {
    const parsed = new URL(url);
    return parsed.pathname.toLowerCase().endsWith(".pdf");
  } catch {
    return fileName?.toLowerCase().endsWith(".pdf") ?? false;
  }
}

export function getSafePdfPreviewUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = "toolbar=0&navpanes=0&view=FitH";
    return parsed.href;
  } catch {
    return url;
  }
}

export function extractSafePreviewTargetsFromText(text: string | null | undefined) {
  if (!text) return [];

  const seen = new Set<string>();
  const matches = text.match(URL_PATTERN) ?? [];

  return matches.reduce<SafePreviewTarget[]>((targets, match) => {
    const safeUrl = toSafeHttpUrl(match);
    if (!safeUrl || seen.has(safeUrl)) return targets;

    seen.add(safeUrl);
    targets.push({
      id: `report-link-${targets.length + 1}`,
      label: getPreviewHostname(safeUrl),
      url: safeUrl,
      kind: isPdfPreviewTarget({ url: safeUrl }) ? "pdf" : "link",
    });

    return targets;
  }, []);
}
