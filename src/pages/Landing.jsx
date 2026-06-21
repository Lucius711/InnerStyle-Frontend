import Seo from "@/components/seo/Seo";
import Hero from "@/sections/Hero";
import Stats from "@/sections/Stats";
import Features from "@/sections/Features";
import Pipeline from "@/sections/Pipeline";
import Showcase from "@/sections/Showcase";
import CTA from "@/sections/CTA";

export default function Landing() {
  return (
    <>
      <Seo
        title="2D & Text → Animated 3D"
        description="InnerStyle turns a single 2D image or a line of text into a textured, rigged and animated 3D model — personalized 3D generation powered by AI."
        canonical="https://innerstyle.app/"
      />
      <Hero />
      <Stats />
      <Features />
      <Pipeline />
      <Showcase />
      <CTA />
    </>
  );
}
