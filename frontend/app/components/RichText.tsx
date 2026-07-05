import Link from 'next/link';

type RichTextProps = {
  text?: string | null;
  tone?: 'light' | 'dark';
  compact?: boolean;
  className?: string;
};

type Block =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'rule' };

const urlPattern = /(https?:\/\/[^\s)]+|www\.[^\s)]+)/g;

function normalizeLooseMarkdown(value: string) {
  return value
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/[ \t]+(#{1,4}\s+)/g, '\n\n$1')
    .replace(/(?<!-)[ \t]+(\*\*[^*]{2,80}\*\*\s*[-:])/g, '\n\n$1')
    .replace(/(?<!#)[ \t]+(\d{1,2}\.\s+[A-Z0-9])/g, '\n$1')
    .replace(/[ \t]+(-\s+[A-Z0-9])/g, '\n$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function cleanInlineMarkdown(value: string) {
  return value
    .replace(/^#{1,6}\s*/, '')
    .replace(/^[-*]\s+/, '')
    .trim();
}

function splitBlocks(text?: string | null): Block[] {
  const source = normalizeLooseMarkdown(text || '');
  if (!source) return [];

  const blocks: Block[] = [];
  let listItems: string[] = [];

  function flushList() {
    if (listItems.length > 0) {
      blocks.push({ type: 'list', items: listItems });
      listItems = [];
    }
  }

  for (const rawLine of source.split('\n')) {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      continue;
    }

    if (/^-{3,}$/.test(line)) {
      flushList();
      blocks.push({ type: 'rule' });
      continue;
    }

    const heading = line.match(/^#{1,4}\s+(.+)/);
    if (heading) {
      flushList();
      blocks.push({ type: 'heading', text: cleanInlineMarkdown(heading[1]) });
      continue;
    }

    const bullet = line.match(/^[-*]\s+(.+)/);
    const numbered = line.match(/^(\d+)\.\s+(.+)/);
    if (bullet || numbered) {
      listItems.push(cleanInlineMarkdown(bullet ? bullet[1] : `${numbered?.[1]}. ${numbered?.[2]}`));
      continue;
    }

    flushList();
    blocks.push({ type: 'paragraph', text: line });
  }

  flushList();
  return blocks;
}

function renderInline(text: string, tone: 'light' | 'dark') {
  const linkClass = tone === 'dark' ? 'text-[#AAA3D6] underline-offset-4 hover:underline' : 'text-[#5F56B3] underline-offset-4 hover:underline';
  const strongClass = tone === 'dark' ? 'font-extrabold text-white' : 'font-extrabold text-[#0F172A]';
  const parts = text.split(/(\*\*[^*]+\*\*|https?:\/\/[^\s)]+|www\.[^\s)]+)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={`${part}-${index}`} className={strongClass}>
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (urlPattern.test(part)) {
      urlPattern.lastIndex = 0;
      const href = part.startsWith('http') ? part : `https://${part}`;
      return (
        <Link key={`${part}-${index}`} href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {part}
        </Link>
      );
    }

    urlPattern.lastIndex = 0;
    return part;
  });
}

export function stripRichText(text?: string | null) {
  return normalizeLooseMarkdown(text || '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function RichText({ text, tone = 'light', compact = false, className = '' }: RichTextProps) {
  const blocks = splitBlocks(text);
  if (blocks.length === 0) return null;

  const paragraphClass = tone === 'dark' ? 'text-[#E5E7EB]' : 'text-[#334155]';
  const mutedClass = tone === 'dark' ? 'text-[#CBD5E1]' : 'text-[#475569]';
  const headingClass = tone === 'dark' ? 'text-white' : 'text-[#0F172A]';
  const bulletClass = tone === 'dark' ? 'bg-[#AAA3D6]' : 'bg-[#5F56B3]';

  return (
    <div className={`${compact ? 'space-y-2' : 'space-y-4'} ${className}`}>
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return (
            <h2 key={`${block.type}-${index}`} className={`${compact ? 'text-base' : 'text-lg sm:text-xl'} font-extrabold leading-snug ${headingClass}`}>
              {renderInline(block.text, tone)}
            </h2>
          );
        }

        if (block.type === 'list') {
          return (
            <ul key={`${block.type}-${index}`} className={`${compact ? 'space-y-1.5' : 'space-y-2'} ${mutedClass}`}>
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`} className="grid grid-cols-[0.55rem_1fr] gap-3 leading-7">
                  <span className={`mt-3 h-1.5 w-1.5 rounded-full ${bulletClass}`} />
                  <span>{renderInline(item, tone)}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === 'rule') {
          return <div key={`${block.type}-${index}`} className={tone === 'dark' ? 'h-px bg-white/10' : 'h-px bg-[#E5E7EB]'} />;
        }

        return (
          <p key={`${block.type}-${index}`} className={`${compact ? 'leading-6' : 'leading-8'} ${paragraphClass}`}>
            {renderInline(block.text, tone)}
          </p>
        );
      })}
    </div>
  );
}
