"use client";

import { Icons } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import Marquee from "@/components/ui/marquee";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from 'next-intl';

const reviews = [
  {
      name: "Jack",
      username: "@jack",
      body: "The **Genmoji generator** nailed my 'robot in a top hat' request! Perfect accuracy for creating custom genmojis online - now my go-to emoji everywhere!",
      img: "https://avatar.vercel.sh/jack",
      feature_highlight: "Precision Prompt Processing",
  },
  {
      name: "Jill",
      username: "@jill",
      body: "Creating genmojis online is effortless across devices! My 'takeaway coffee with legs' genmoji became an instant hit in all my chats!",
      img: "https://avatar.vercel.sh/jill",
      feature_highlight: "Multi-Device Genmoji Creation",
  },
  {
      name: "John",
      username: "@john",
      body: "The **genmoji generator** delivers studio-quality results! Our team's 'space exploration' set works perfectly as professional-grade stickers!",
      img: "https://avatar.vercel.sh/john",
      feature_highlight: "Premium Quality Output",
  },
  {
      name: "Jane",
      username: "@jane",
      body: "Customized a pastel pink 'flower explosion' genmoji online - the color options and dynamic effects are game-changers for digital art!",
      img: "https://avatar.vercel.sh/jane",
      feature_highlight: "Advanced Color Customization",
  },
   {
      name: "Jenny",
      username: "@jenny",
      body: "Turned my selfie into a 'Jenny with sunglasses' genmoji instantly! Best online tool for personalized emoji creation!",
      img: "https://avatar.vercel.sh/jenny",
       feature_highlight: "Photo-to-Genmoji Technology",
  },
  {
      name: "James",
      username: "@james",
      body: "Refined prompts created my perfect 'blue dinosaur in red jumper' genmoji - the generator handles complex requests effortlessly!",
      img: "https://avatar.vercel.sh/james",
      feature_highlight: "AI-Powered Iterations",
  },
     {
      name: "Jamie",
      username: "@jamie",
      body:  "Crafted holographic D&D genmoji cards online - the collection builder makes grouping characters a breeze!",
      img: "https://avatar.vercel.sh/jamie",
      feature_highlight: "Themed Collections"
  },
  {
      name: "Jesse",
      username: "@jesse",
       body: "My 'golden retriever in bow tie' genmoji looks just like Max! The pet-friendly generator understands breed details perfectly!",
      img: "https://avatar.vercel.sh/jesse",
       feature_highlight: "Pet Portrait Genmojis",
  },
    {
      name: "Jordan",
      username: "@jordan",
      body: "Finding my genmojis is seamless - search by creation keywords exactly as I used in the generator!",
      img: "https://avatar.vercel.sh/jordan",
        feature_highlight: "Smart Search System",
  },
  {
       name: "Julia",
       username: "@julia",
       body: "Exported my 'sleepy cat in teacup' genmoji as stickers that work in any app - the online converter makes sharing effortless!",
       img: "https://avatar.vercel.sh/julia",
        feature_highlight: "Universal Sticker Export",
   },
       {
      name: "Jake",
      username: "@jake",
      body: "The genmoji generator outperforms Apple's version - unlimited customization for truly unique emojis!",
      img: "https://avatar.vercel.sh/jake",
        feature_highlight: "Superior Customization",
    },
    {
       name: "June",
       username: "@june",
       body: "First-time user created pro-level genmojis online! Friends think I hired a designer - the generator does all the work!",
       img: "https://avatar.vercel.sh/june",
         feature_highlight: "Beginner-Friendly Interface",
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
        <img className="rounded-full" width="32" height="32" alt={`${name} (${username}) avatar`} src={img} />
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
  const t = useTranslations('cta');
  
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
            <img src="/logo.png" alt="genmoji logo" className="w-auto h-full"/>
          </div>
          <div className="z-10 mt-4 flex flex-col items-center text-center text-black dark:text-white">
            <h2 className="text-3xl font-bold lg:text-4xl">
              {t('title')}
            </h2>
            <p className="mt-2">{t('description')}</p>
            <Link
              href="#"
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-8 text-white rounded-full group mt-4"
              )}
            >
              {t('button')}
              <ChevronRight className="ml-1 size-4 transition-all duration-300 ease-out group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-b from-transparent to-white to-70% dark:to-black" />
        </div>
      </div>
    </section>
  );
}
