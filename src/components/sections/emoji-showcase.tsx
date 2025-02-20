import Marquee from "@/components/ui/marquee";
import { cn } from "@/lib/utils";
import Link from "next/link";

const SHOWCASE_IMAGES = [
  {
    slug: "ginger-teen-guy-white-button-up-shirt-blue-striped-tie-straight-hair-side-part-smile-hazel-eyes-buff",
    image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA//0507f6f6-9105-4d20-7a63-696dd8f50b00/public"
  },
  {
    slug: "donald-trump--m6p5j2zy",
    image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA//1be8ab5c-9cea-4a9e-6f40-2d59ef803300/public"
  },
  {
    slug: "unrealistic-smiling-donut-with-headphones",
    image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA//42f0e9be-3c37-4821-fcbc-a0821281b700/public"
  },
  {
    slug: "blue-eyes-white-dragon-explosion",
    image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA//0197145a-b1e0-4183-6a41-603d3fcabc00/public"
  },
  {
    slug: "medieval-tankard-wood",
    image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA//1bd48d89-1739-4f23-39a5-deb814556500/public"
  },
  {
    slug: "pink-wildflower",
    image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA//4a31febb-e1fa-4f97-b142-021b02caa900/public"
  },
  {
    slug: "police-guinea-pig",
    image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA//7d76ccdc-f28d-4891-ba58-f4e24c97cd00/public"
  },
  {
    slug: "care-bear-with-a-smiling-face-with-heart-eyes-on-his-belly--m6covmuq",
    image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA//a1478724-d8c5-4d04-c67e-fdff5e4a4500/public"
  },
  {
    slug: "dragon-riding-a-motorcyle",
    image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA//905a6673-ead7-4d03-c3c4-8f2d7de2d400/public"
  },
  {
    slug: "2d-dragon-baby-simple",
    image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA//79efdf24-9310-48f5-7b13-43d63f6c1d00/public"
  },
  {
    slug: "shh-with-clown",
    image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA//2ca982e8-c56a-4e2a-dd67-72196c7cdd00/public"
  },
  {
    slug: "brain",
    image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA//62f18150-8d13-4113-5367-e32983d2cc00/public"
  },
  // {
  //   slug: "plane--m6d90d3n",
  //   image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA//4c8df1c7-ac1f-472f-aa05-03d52a1b7200/public"
  // },
  {
    slug: "toad-mushroom",
    image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA//fdd9e9a0-afcf-4ade-94fa-6d27501b0600/public"
  },
  {
    slug: "lorax-with-mustache-on-head",
    image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA//d133cc14-83f7-4f59-e2d8-c939c1b0e900/public"
  },
  {
    slug: "white-party-balloons-with-a-pink-bows-print--m6f1if6f",
    image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA//0cb13c3f-fa14-4d45-087b-34e33c3db000/public"
  },
  {
    slug: "pink-drink",
    image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA//3a3f5674-e5fc-4669-9a30-56417377a600/public"
  },
  {
    slug: "clown-goose",
    image_url: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA//57756e92-18f6-46fd-db41-1ce9a9946100/public"
  }
];


const EmojiCard = ({ slug, image_url, index }: { slug: string; image_url: string; index: number }) => {
  return (
    <Link href={`/emoji/${slug}/`}>
      <div
        className={cn(
          "relative h-32 w-32 sm:h-40 sm:w-40 mx-4 transform-gpu transition-all duration-500",
          "rounded-xl p-4 cursor-pointer",
          "hover:bg-gray-950/[.05]",
          "dark:hover:bg-gray-50/[.15]",
          "hover:scale-105"
        )}
      >
        <img
          src={image_url}
          alt={`Showcase emoji ${index + 1}`}
          className="w-full h-full object-contain"
          loading="lazy"
          draggable={false}
        />
      </div>
    </Link>
  );
};

export function EmojiShowcase() {
  const firstRow = SHOWCASE_IMAGES.slice(0, Math.ceil(SHOWCASE_IMAGES.length / 2));
  const secondRow = SHOWCASE_IMAGES.slice(Math.ceil(SHOWCASE_IMAGES.length / 2));

  return (
    <div className="relative flex w-full flex-col items-center justify-center gap-8 overflow-hidden py-4">
      <Marquee  className="[--duration:40s]">
        {firstRow.map((item, i) => (
          <EmojiCard key={i} {...item} index={i} />
        ))}
      </Marquee>
      <Marquee reverse  className="[--duration:35s]">
        {secondRow.map((item, i) => (
          <EmojiCard key={i} {...item} index={i + firstRow.length} />
        ))}
      </Marquee>

      {/* Edge gradients */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background" />
    </div>
  );
} 