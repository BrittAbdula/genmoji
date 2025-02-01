import EmojiContainer from "@/components/emoji-container";
import { EmojiDetail } from "@/components/emoji-detail";
import { Emoji, EmojiResponse } from "@/types/emoji";
import Link from "next/link";
import { cn, constructMetadata } from "@/lib/utils";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
export const runtime = 'edge';

type Props = {
    params: Promise<{ slug: string }>; // ✅ 使用 Promise 包裹参数对象
};

async function getEmoji(slug: string): Promise<Emoji> {
  const res = await fetch(`https://gen.genmojionline.com?slug=${slug}`, {
    headers: {
      'Origin': 'https://genmojionline.com'
    },
    next: { revalidate: 60 }
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch emoji');
  }
  
  const emojiResponse = await res.json() as EmojiResponse;
  if (!emojiResponse.success || !emojiResponse.emoji) {
    throw new Error('Emoji not found');
  }
  return emojiResponse.emoji;
}

async function getRelatedEmojis(slug: string): Promise<Emoji[]> {
  const res = await fetch(`https://gen.genmojionline.com?slug=${slug}&related=12`, {
    headers: {
      'Origin': 'https://genmojionline.com'
    },
    next: { revalidate: 60 }
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch related emojis');
  }
  
  const emojiResponse = await res.json() as EmojiResponse;
  return emojiResponse.emojis || [];
}

export async function generateMetadata(props: Props): Promise<Metadata> {
    try {
        const {slug} = await props.params;
      const emoji = await getEmoji(slug);
      return constructMetadata({
        title: `Genmoji: ${emoji.prompt} | ${siteConfig.name}`,
        description: `prompt: ${emoji.prompt}, Generate the gemoji from Genmoji Online, Download or share the '${emoji.prompt}' genmoji`,
        openGraph: {
          images: [{
            url: emoji.image_url,
            width: 256,
            height: 256,
            alt: emoji.prompt,
          }],
        },
        path: `emoji/${emoji.slug}/`,
      });
    } catch (error) {
      return constructMetadata({
        title: `Emoji Not Found | ${siteConfig.name}`,
        description: 'The requested emoji could not be found',
      });
    }
  }

  export default async function EmojiPage(props: Props) {
    try {
        const {slug} = await props.params;
      const emoji = await getEmoji(slug);
      const relatedEmojis = await getRelatedEmojis(slug);

    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-5xl mx-auto">
          
          <div className="mt-8 flex flex-col items-center">
            <div className="w-full max-w-[520px] mb-8">
              <EmojiContainer emoji={emoji} size="xl" />
            </div>
            
            <div className="w-full max-w-md">
              <EmojiDetail emoji={emoji} />
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-xl font-bold mb-6">Related Genmojis</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {relatedEmojis.map((relatedEmoji) => (
                <EmojiContainer 
                  key={relatedEmoji.slug} 
                  emoji={relatedEmoji}
                  size="sm"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-muted-foreground hover:text-primary">
            ← Back to Home
          </Link>
          
          <div className="mt-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Emoji Not Found</h1>
            <p className="text-muted-foreground">
              The emoji you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }
} 
