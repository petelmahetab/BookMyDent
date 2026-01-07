import Navbar from "@/components/Navbar";
import FeatureCards from "@/components/voice/FeatureCards";
import ProPlanRequired from "@/components/voice/ProPlanRequired";
import VoiceAssistantWidget from "@/components/voice/VoiceAssistantWidget";
import WelcomeSection from "@/components/voice/WelcomeSection";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

async function VoicePage() {
  const user = await currentUser();
  
  if (!user) redirect("/");

  // ✅ THIS IS THE ONLY CHANGE - Check metadata instead of Clerk plans
  const isPro = user.publicMetadata?.isPro === true;

  if (!isPro) return <ProPlanRequired />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        <WelcomeSection />
        <FeatureCards />
      </div>

      <VoiceAssistantWidget />
    </div>
  );
}

export default VoicePage;