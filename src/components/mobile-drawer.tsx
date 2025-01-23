import { Icons } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
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
          <div className="flex items-center justify-between">
            <Link
              href="/"
              title="brand-logo"
              className="relative flex items-center space-x-2"
            >
              <img src="/logo.png" alt="🥳" width="40" height="40"/>
              <span className="font-bold text-xl">{siteConfig.name}</span>
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
