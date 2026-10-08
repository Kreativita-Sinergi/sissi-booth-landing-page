import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { AdminPanel } from "@/components/sections/AdminPanel";
import { Audience } from "@/components/sections/Audience";
import { Comparison } from "@/components/sections/Comparison";
import { Contact } from "@/components/sections/Contact";
import { Faq } from "@/components/sections/Faq";
import { Features } from "@/components/sections/Features";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Marquee } from "@/components/sections/Marquee";
import { Modes } from "@/components/sections/Modes";
import { Offline } from "@/components/sections/Offline";
import { Plans } from "@/components/sections/Plans";
import { ProblemSolution } from "@/components/sections/ProblemSolution";

/** Landing page Sissi Booth — urutan bagian sama dengan desain Figma. */
export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <ProblemSolution />
        <HowItWorks />
        <Modes />
        <Features />
        <Offline />
        <AdminPanel />
        <Comparison />
        <Plans />
        <Audience />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
