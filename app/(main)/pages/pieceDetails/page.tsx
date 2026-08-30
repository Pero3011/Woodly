import Navbar from "@/components/Navbar";
import Details from "@/components/PieceDetails/Details";
import Gallery from "@/components/PieceDetails/Gallery";

export default function PieceDetailsPage() {
    return (
      <div className="h-screen bg-[#FBF6EF]">
        <Navbar />
        <div className="grid grid-cols-2 ">
          <Gallery />
          <Details
            Badge="Artisan Limited"
            Title="The Sculpted Walnut Relief"
            Category="Masterpiece Series"
            Price={3850}
            OriginalPrice={4200}
            Description="A masterpiece of patience and precision. This relief panel features over 100 hours of meticulous hand-carving and scroll saw work. Crafted from a single slab of premium American Black Walnut, the intricate geometric patterns are achieved through traditional fretwork techniques, finished with a hand-rubbed natural oil that brings the complex grain to life."
            Dimensions='72"L x 18"W x 28"H'
            Weight="142 lbs"
            LeadTime="4-6 Weeks"
            Origin="Portland Studio"
          />
        </div>
      </div>
    );
}