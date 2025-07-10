import Marquee from "@/components/ui/marquee";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import EmojiContainer from "@/components/emoji-container";
import { Emoji } from "@/types/emoji";

const SHOWCASE_IMAGES = [
  {
    slug: "a-red-cat-with-a-hat--m7gc2hobwjjk",
    image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/ec1b5fc7-655a-4b6e-80cd-03afd1e3a100/public"
  },
  {
    slug: "donald-trump--m6p5j2zy",
    image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/1be8ab5c-9cea-4a9e-6f40-2d59ef803300/public"
  },
  {
    slug: "unrealistic-smiling-donut-with-headphones",
    image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/42f0e9be-3c37-4821-fcbc-a0821281b700/public"
  },
  {
    slug: "blue-eyes-white-dragon-explosion",
    image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/0197145a-b1e0-4183-6a41-603d3fcabc00/public"
  },
  {
    slug: "medieval-tankard-wood",
    image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/1bd48d89-1739-4f23-39a5-deb814556500/public"
  },
  {
    slug: "pink-wildflower",
    image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/4a31febb-e1fa-4f97-b142-021b02caa900/public"
  },
  {
    slug: "purple-jellyfish",
    image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/f873a587-2af8-49e9-dbd0-7a0c36de3000/public"
  },
  {
    slug: "care-bear-with-a-smiling-face-with-heart-eyes-on-his-belly--m6covmuq",
    image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/a1478724-d8c5-4d04-c67e-fdff5e4a4500/public"
  },
  {
    slug: "dragon-riding-a-motorcyle",
    image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/905a6673-ead7-4d03-c3c4-8f2d7de2d400/public"
  },
  {
    slug: "2d-dragon-baby-simple",
    image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/79efdf24-9310-48f5-7b13-43d63f6c1d00/public"
  },
  {
    slug: "shh-with-clown",
    image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/2ca982e8-c56a-4e2a-dd67-72196c7cdd00/public"
  },
  {
    slug: "brain",
    image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/62f18150-8d13-4113-5367-e32983d2cc00/public"
  },
  // {
  //   slug: "plane--m6d90d3n",
  //   image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/4c8df1c7-ac1f-472f-aa05-03d52a1b7200/public"
  // },
  {
    slug: "toad-mushroom",
    image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/fdd9e9a0-afcf-4ade-94fa-6d27501b0600/public"
  },
  {
    slug: "lorax-with-mustache-on-head",
    image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/d133cc14-83f7-4f59-e2d8-c939c1b0e900/public"
  },
  {
    slug: "white-party-balloons-with-a-pink-bows-print--m6f1if6f",
    image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/0cb13c3f-fa14-4d45-087b-34e33c3db000/public"
  },
  {
    slug: "pink-drink",
    image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/3a3f5674-e5fc-4669-9a30-56417377a600/public"
  },
  {
    slug: "clown-goose--m7gcr5o074pw",
    image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/d59524d3-6729-49b9-286e-f42017832b00/public"
  }
];


const EmojiCard = ({ slug, image_url, index }: { slug: string; image_url: string; index: number }) => {
  const locale = useLocale();
  const emoji: Emoji = { 
    slug, 
    image_url, 
    prompt: `Showcase emoji ${index + 1}`,
    base_slug: slug.split('--')[0],
    created_at: new Date().toISOString(),
    is_public: true,
    locale: locale,
    has_reference_image: false,
    model: "showcase",
    is_indexable: false
  };
  
  return (
    <div className={cn(
      "h-32 w-32 sm:h-36 sm:w-36 mx-1 will-change-transform", // Reduced size, removed hover animation
    )}>
      <EmojiContainer 
        emoji={emoji} 
        size="sm" 
        lazyLoad={index > 6} // Reduced priority loading
        priority={index < 3} // Reduced priority count
        padding="p-0.5" 
        withBorder={true}
      />
    </div>
  );
};

export function EmojiShowcase() {
  // Show fewer items for better performance
  const displayItems = SHOWCASE_IMAGES.slice(0, 12); // Reduced from full array
  const firstRow = displayItems.slice(0, 6);
  const secondRow = displayItems.slice(6, 12);

  return (
    <div className="relative flex w-full flex-col items-center justify-center gap-2 overflow-hidden py-3">
      <Marquee className="[--duration:50s] [--gap:0.5rem]" repeat={2}>
        {firstRow.map((item, i) => (
          <EmojiCard key={i} {...item} index={i} />
        ))}
      </Marquee>
      <Marquee reverse className="[--duration:45s] [--gap:0.5rem]" repeat={2}>
        {secondRow.map((item, i) => (
          <EmojiCard key={i} {...item} index={i + firstRow.length} />
        ))}
      </Marquee>

      {/* Simplified edge gradients */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background" />
    </div>
  );
} 