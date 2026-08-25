import Navbar from "@/components/Navbar";
import Heropage from "@/components/Home/Heropage";
import Propertiespage from "@/components/Home/Properties/Propertiespage";
import JourneyPage from "@/components/Home/TheJourneyOfYourPiece/Journeypage";
import MasterPiece from "@/components/Home/FeaturedMasterPiece/MasterPiece";
import Footer from "@/components/FooterPage";

export default function Home() {
  return (
    <div>
      <Navbar />
      <Heropage />
      <Propertiespage />
      <JourneyPage />
      <MasterPiece />
      <Footer />
    </div>
  );
}