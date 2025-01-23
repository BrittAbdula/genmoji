import { type PropsWithChildren } from "react";
import { Header } from "@/components/sections/header";
import { Footer } from "@/components/sections/footer";

export default function EmojiLayout({ children }: PropsWithChildren) {
  return (
    <main className="relative">
      <Header />
      {children}
      <Footer />
    </main>
  );
} 