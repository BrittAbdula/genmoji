import { Emoji } from '@/types/emoji';

const DENYLIST = [
  'butthole', 'butt-hole', 'butt_hole', 'asshole', 'ass-hole', 'anus',
  'blowjob', 'blow-job', 'suck', 'sucking', 'cock', 'dick', 'penis',
  'porn', 'naked', 'nude', 'nudity',
  'semen', 'cum', 'jizz', 'spunk',
  'fingering', 'pussy', 'vagina', 'clit',
  'boob', 'boobs', 'tit', 'tits', 'nipple', 'cleavage',
  'doggy-style', 'doggystyle',
  'fuck', 'fucking', 'fucked',
  'hitler', 'nazi', 'swastika', 'kkk', 'ku-klux',
  'rape', 'molest',
];

const PATTERN = new RegExp(`(^|[^a-z])(${DENYLIST.join('|')})([^a-z]|$)`, 'i');

export function isSfwEmoji(e: Pick<Emoji, 'slug' | 'prompt'>): boolean {
  if (!e) return false;
  const text = `${e.slug ?? ''} ${e.prompt ?? ''}`.toLowerCase();
  return !PATTERN.test(text);
}

export function filterSfw<T extends Pick<Emoji, 'slug' | 'prompt'>>(list: T[] | null | undefined): T[] {
  if (!list) return [];
  return list.filter(isSfwEmoji);
}
