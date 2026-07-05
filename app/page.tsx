import { Hero } from "@/components/Hero";
import { AgentConsole } from "@/components/AgentConsole";
import { Work } from "@/components/Work";
import { Projects } from "@/components/Projects";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-ink">
      <main>
        <Hero />
        <AgentConsole />
        <Work />
        <Projects />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
