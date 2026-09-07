import type { SessionImportResponse } from "@/lib/api";

export type ImportableSession = Record<string, unknown>;

function normalizeImportSessions(value: unknown, locale: string): ImportableSession[] {
  const candidate =
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Array.isArray((value as { sessions?: unknown }).sessions)
      ? (value as { sessions: unknown[] }).sessions
      : Array.isArray(value)
        ? value
        : [value];

  const sessions = candidate.filter(
    (item): item is ImportableSession => !!item && typeof item === "object" && !Array.isArray(item)
  );
  if (sessions.length !== candidate.length) {
    throw new Error(
      locale === "zh" ? "应提供导出的会话 JSON 或 JSONL" : "Expected exported session JSON or JSONL"
    );
  }
  return sessions;
}

export function parseImportSessions(text: string, locale = "en"): ImportableSession[] {
  const trimmed = text.trim();
  if (!trimmed) throw new Error(locale === "zh" ? "文件为空" : "File is empty");

  try {
    return normalizeImportSessions(JSON.parse(trimmed), locale);
  } catch (jsonError) {
    const lines = trimmed.split(/\r?\n/).filter(line => line.trim());
    if (lines.length <= 1) throw jsonError;
    return normalizeImportSessions(
      lines.map(line => JSON.parse(line)),
      locale
    );
  }
}

export function importSummary(result: SessionImportResponse, locale = "en"): string {
  if (locale === "zh") {
    const parts = [`已导入 ${result.imported} 个`];
    if (result.skipped > 0) parts.push(`已跳过 ${result.skipped} 个`);
    if (result.detached > 0) parts.push(`${result.detached} 个因父会话缺失而独立导入`);
    return parts.join("；");
  }
  const parts = [`${result.imported} imported`];
  if (result.skipped > 0) parts.push(`${result.skipped} skipped`);
  if (result.detached > 0) {
    parts.push(`${result.detached} detached from missing parents`);
  }
  return parts.join("; ");
}
