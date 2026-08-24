import Navbar from "@/components/Home/Navbar/Navbar"
import Heropage from "@/components/Home/Hero/Heropage"
import Propertiespage from "@/components/Home/Properties/Propertiespage"
import JourneyPage from "@/components/Home/TheJourneyOfYourPiece/Journeypage"
import MasterPiece from "@/components/Home/FeaturedMasterPiece/MasterPiece"
import Footer from "@/components/Home/Footer/FooterPage"

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
  )
}
