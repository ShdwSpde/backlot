import Hero from "@/components/home/Hero";
import TokenDashboard from "@/components/dashboard/TokenDashboard";
import FeaturedEpisode from "@/components/home/FeaturedEpisode";
import MilestonePreview from "@/components/home/MilestonePreview";
import SpotlightWall from "@/components/community/SpotlightWall";
import TokenCTA from "@/components/home/TokenCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TokenDashboard />
      <FeaturedEpisode />
      <MilestonePreview />
      <SpotlightWall />
      <TokenCTA />
    </>
  );
}
