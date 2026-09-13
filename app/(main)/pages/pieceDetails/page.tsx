import Navbar from "@/components/Navbar";
import Footer from "@/components/FooterPage";
import Details from "@/components/PieceDetails/Details";
import Gallery from "@/components/PieceDetails/Gallery";
import ExtraInfo from "@/components/PieceDetails/ExtraInfo";

export default function PieceDetailsPage() {
  return (
    <div className="min-h-screen bg-[#FBF6EF]">
      <Navbar />
      <div className="grid grid-cols-5 gap-10 max-w-6xl mx-auto px-5 pb-5">
        <div className="col-span-3 pt-8">
          <Gallery />
        </div>
        <div className="col-span-2">
          <Details
            Badge="Custom Commission"
            Title="The Carved Portrait"
            Category="Portrait Series"
            Price={650}
            OriginalPrice={750}
            Description="A one-of-a-kind keepsake carved from your own photo. Each portrait is hand-fretworked from a single block of solid maple, with the likeness cut in deep relief so the grain catches the light across every feature. Finished with a natural oil that keeps the wood's warm, honey tone."
            Dimensions='8"L x 6"W x 1.5"D'
            Weight="3 lbs"
            LeadTime="2-3 Weeks"
            Origin="Portland Studio"
          />
        </div>
      </div>

      <ExtraInfo />

      <Footer />
    </div>
  );
}
