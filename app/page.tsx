import Hero from "@/components/home/Hero";
import FeaturedEpisode from "@/components/home/FeaturedEpisode";
import MilestonePreview from "@/components/home/MilestonePreview";
import SpotlightWall from "@/components/community/SpotlightWall";
import TokenCTA from "@/components/home/TokenCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedEpisode />
      <MilestonePreview />
      <SpotlightWall />
      <TokenCTA />
    </>
  );
}
