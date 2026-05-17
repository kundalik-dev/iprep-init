export interface ParsedCodexOutput {
  content: string;
  sessionId: string | null;
  errorMessage: string | null;
}

function walkStrings(value: unknown, keyMatcher: (key: string) => boolean): string | null {
  if (typeof value !== 'object' || value === null) return null;
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (keyMatcher(key) && typeof nested === 'string' && nested.trim()) {
      return nested.trim();
    }
    const child = walkStrings(nested, keyMatcher);
    if (child) return child;
  }
  return null;
}

function extractText(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (typeof value !== 'object' || value === null) return null;

  const record = value as Record<string, unknown>;
  for (const key of ['content', 'text', 'message', 'summary']) {
    const raw = record[key];
    if (typeof raw === 'string' && raw.trim()) return raw;
  }

  if (Array.isArray(record.content)) {
    return record.content
      .map((item) => extractText(item))
      .filter((item): item is string => Boolean(item))
      .join('');
  }

  return null;
}

export function parseCodexJsonl(stdout: string): ParsedCodexOutput {
  const assistantParts: string[] = [];
  let sessionId: string | null = null;
  let errorMessage: string | null = null;

  for (const line of stdout.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let event: unknown;
    try {
      event = JSON.parse(trimmed);
    } catch {
      assistantParts.push(trimmed);
      continue;
    }

    sessionId ??= walkStrings(
      event,
      (key) => key === 'session_id' || key === 'sessionId' || key === 'conversation_id',
    );

    const record = event as Record<string, unknown>;
    const type = typeof record.type === 'string' ? record.type : '';
    if (type.toLowerCase().includes('error')) {
      errorMessage ??= extractText(event);
      continue;
    }

    if (
      type.toLowerCase().includes('message') ||
      type.toLowerCase().includes('assistant') ||
      type.toLowerCase().includes('final')
    ) {
      const text = extractText(event);
      if (text) assistantParts.push(text);
    }
  }

  return {
    content: assistantParts.join('\n').trim(),
    sessionId,
    errorMessage,
  };
}

export function isUnknownSessionError(stderr: string, stdout: string): boolean {
  const combined = `${stderr}\n${stdout}`.toLowerCase();
  return combined.includes('unknown session') || combined.includes('session not found');
}
