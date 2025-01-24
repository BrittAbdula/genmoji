import { Icons } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import Marquee from "@/components/ui/marquee";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
const reviews = [
  {
    name: "Jack",
    username: "@jack",
    body: "**Genmoji Online's prompts are amazing!** It understood 'a robot wearing a top hat' perfectly and I use it everywhere!",
    img: "https://avatar.vercel.sh/jack",
    feature_highlight: "Accurate Prompt Understanding",
  },
  {
    name: "Jill",
    username: "@jill",
      body: "I love how **easy it is to create custom emojis on any device!** My 'takeaway coffee with legs' is now my signature emoji!",
    img: "https://avatar.vercel.sh/jill",
    feature_highlight: "Cross-Platform Accessibility",
  },
    {
    name: "John",
    username: "@john",
    body: "**The quality is fantastic!** I made a series of 'space exploration' emojis for my team, and they look amazing as stickers!",
      img: "https://avatar.vercel.sh/john",
      feature_highlight: "High-Quality Output",
  },
  {
    name: "Jane",
    username: "@jane",
    body: "I created an 'explosion of flowers' emoji in pastel pink, and it's perfect! **Love the color options and dynamic effects**!",
    img: "https://avatar.vercel.sh/jane",
    feature_highlight: "Color Customization & Dynamic Effects",
  },
  {
    name: "Jenny",
    username: "@jenny",
        body: "Genmoji Online is a game changer! I uploaded a photo of myself and made a 'Jenny with sunglasses' emoji easily! **Love the photo integration!**",
    img: "https://avatar.vercel.sh/jenny",
    feature_highlight: "Personalized Photo Emojis",
  },
  {
    name: "James",
    username: "@james",
    body: "I was able to make a custom 'blue dinosaur with red jumper' emoji by **iterating my prompts.** So easy and powerful!",
    img: "https://avatar.vercel.sh/james",
      feature_highlight: "Iterative Prompting",
  },
    {
    name: "Jamie",
    username: "@jamie",
    body: "I created a bunch of 'holographic trading card' emojis for our D&D group, and they turned out incredible. **So fun to make emoji collections**!",
    img: "https://avatar.vercel.sh/jamie",
     feature_highlight: "Emoji Collection Creation"
  },
  {
      name: "Jesse",
      username: "@jesse",
      body: "I made a 'golden retriever wearing a bow tie' emoji using Genmoji Online. It's almost as cute as my real dog! **Simple descriptions work great!**",
      img: "https://avatar.vercel.sh/jesse",
    feature_highlight: "Easy Pet Emojis",
  },
    {
    name: "Jordan",
    username: "@jordan",
    body: "**I love that I can search for my Genmoji** using the words I used to create it! It's so easy to find them again!",
        img: "https://avatar.vercel.sh/jordan",
      feature_highlight: "Searchable Emojis",
    },
     {
    name: "Julia",
    username: "@julia",
    body: "I love that I can use my Genmoji as stickers! I sent a 'sleepy cat in a teacup' to all my friends and they loved it. **Stickers in any app!**",
    img: "https://avatar.vercel.sh/julia",
         feature_highlight: "Use as Stickers",
  }
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative w-64 cursor-pointer overflow-hidden rounded-[2rem] border p-4",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]"
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{body}</blockquote>
    </figure>
  );
};

export function CTA() {
  return (
    <section id="cta">
      <div className="py-14 container mx-auto px-4 max-w-[1000px] ">
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-[2rem] border p-10 py-14">
          <div className="absolute rotate-[35deg]">
            <Marquee pauseOnHover className="[--duration:20s]" repeat={3}>
              {firstRow.map((review) => (
                <ReviewCard key={review.username} {...review} />
              ))}
            </Marquee>
            <Marquee
              reverse
              pauseOnHover
              className="[--duration:20s]"
              repeat={3}
            >
              {secondRow.map((review) => (
                <ReviewCard key={review.username} {...review} />
              ))}
            </Marquee>
            <Marquee pauseOnHover className="[--duration:20s]" repeat={3}>
              {firstRow.map((review) => (
                <ReviewCard key={review.username} {...review} />
              ))}
            </Marquee>
            <Marquee
              reverse
              pauseOnHover
              className="[--duration:20s]"
              repeat={3}
            >
              {secondRow.map((review) => (
                <ReviewCard key={review.username} {...review} />
              ))}
            </Marquee>
            <Marquee pauseOnHover className="[--duration:20s]" repeat={3}>
              {firstRow.map((review) => (
                <ReviewCard key={review.username} {...review} />
              ))}
            </Marquee>
            <Marquee
              reverse
              pauseOnHover
              className="[--duration:20s]"
              repeat={3}
            >
              {secondRow.map((review) => (
                <ReviewCard key={review.username} {...review} />
              ))}
            </Marquee>
          </div>
          <div className="z-10 mx-auto size-24 rounded-[2rem] border bg-white/10 p-3 shadow-2xl backdrop-blur-md dark:bg-black/10 lg:size-32">
            <Icons.logo className="w-auto h-full" />
          </div>
          <div className="z-10 mt-4 flex flex-col items-center text-center text-black dark:text-white">
            <h1 className="text-3xl font-bold lg:text-4xl">
              {siteConfig.name}
            </h1>
            <p className="mt-2">{siteConfig.description}</p>
            <Link
              href="#"
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-8 text-white rounded-full group mt-4"
              )}
            >
              {siteConfig.cta}
              <ChevronRight className="ml-1 size-4 transition-all duration-300 ease-out group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-b from-transparent to-white to-70% dark:to-black" />
        </div>
      </div>
    </section>
  );
}
