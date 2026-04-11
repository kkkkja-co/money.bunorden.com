/** Parse comma-separated tag input into a normalized list for storage. */
export function parseTagsInput(raw: string): string[] {
  const parts = raw.split(/[,，]/).map((s) => s.trim()).filter(Boolean)
  const seen = new Set<string>()
  const out: string[] = []
  for (const p of parts.slice(0, 20)) {
    const tag = p.slice(0, 40)
    const key = tag.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(tag)
  }
  return out
}

export function tagsToInputString(tags: string[] | null | undefined): string {
  return (tags ?? []).join(', ')
}
