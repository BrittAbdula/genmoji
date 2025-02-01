import { Icons } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { outfit } from '@/lib/fonts';
import { AuroraText } from "@/components/ui/aurora-text";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { easeInOutCubic } from "@/lib/animation";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { IoMenuSharp } from "react-icons/io5";

export function MobileDrawer() {
  return (
    <Drawer>
      <DrawerTrigger>
        <IoMenuSharp className="text-2xl" />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="px-6">
          <DrawerTitle className="sr-only">Navigation Menu</DrawerTitle>
          <div className="flex items-center justify-between">
            <Link
              href="/"
              title="brand-logo"
              className="relative flex items-center space-x-2"
            >
              <img src="/logo.png" alt="🥳" width="40" height="40"/>
              <motion.div
            className="absolute inset-0 -z-10 bg-gradient-to-b from-pink-100/30 via-purple-100/30 to-transparent dark:from-pink-950/30 dark:via-purple-950/30 rounded-full blur-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
              <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeInOutCubic }}
            className={cn(
              "text-xl sm:text-2xl font-bold tracking-tight",
              outfit.className
            )}
          >
            <AuroraText>Genmoji</AuroraText>{" "}
            <span className="text-muted-foreground">Online</span>
          </motion.p>
            </Link>
            <ThemeToggle />
          </div>
        </DrawerHeader>

        <div className="px-6 py-4 flex flex-col gap-2">
          <Link 
            href="/" 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
        </div>

        <DrawerFooter className="px-6">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "default" }),
              "text-white rounded-full group w-full"
            )}
          >
            {siteConfig.cta}
          </Link>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
