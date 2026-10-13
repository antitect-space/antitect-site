/**
 * Admin-authored plain text as paragraphs: a blank line starts a new one, a
 * single line break stays a break. Never Markdown, never HTML.
 */
export function Description({ text }: { text: string }) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="flex max-w-[564px] flex-col gap-4">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="type-body whitespace-pre-line text-ink">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
