"use client";

import { Section } from "@/components/section";
import { easeOutCubic } from "@/lib/animation";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function FeatureScroll() {
  const phone1Ref = useRef(null);
  const phone2Ref = useRef(null);
  const phone3Ref = useRef(null);

  const { scrollYProgress: scrollYProgress1 } = useScroll({
    target: phone1Ref,
    offset: ["start end", "end start"],
  });

  const { scrollYProgress: scrollYProgress2 } = useScroll({
    target: phone2Ref,
    offset: ["start end", "end start"],
  });

  const { scrollYProgress: scrollYProgress3 } = useScroll({
    target: phone3Ref,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress1, [0, 0.3], [150, 0], {
    ease: easeOutCubic,
  });
  const y2 = useTransform(scrollYProgress2, [0.1, 0.4], [200, 0], {
    ease: easeOutCubic,
  });
  const y3 = useTransform(scrollYProgress3, [0.2, 0.5], [250, 0], {
    ease: easeOutCubic,
  });

  return (
    <Section
      id="feature-scroll"
      title="Experience"
      subtitle="An app unlike any other"
      className="container px-4 sm:px-10"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mx-auto select-none">
        <motion.img
          ref={phone1Ref}
          src="/Device-6.png"
          alt="iPhone 1"
          className="w-full h-auto -z-10 max-w-[250px] sm:max-w-[300px] mx-auto"
          style={{ y: y1 }}
        />
        <motion.img
          ref={phone2Ref}
          src="/Device-7.png"
          alt="iPhone 2"
          className="w-full h-auto -z-10 max-w-[250px] sm:max-w-[300px] mx-auto"
          style={{ y: y2 }}
        />
        <motion.img
          ref={phone3Ref}
          src="/Device-8.png"
          alt="iPhone 3"
          className="w-full h-auto -z-10 max-w-[250px] sm:max-w-[300px] mx-auto"
          style={{ y: y3 }}
        />
      </div>
    </Section>
  );
}
