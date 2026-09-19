import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/FooterPage";
import Details from "@/components/PieceDetails/Details";
import Gallery from "@/components/PieceDetails/Gallery";
import ExtraInfo from "@/components/PieceDetails/ExtraInfo";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PieceDetailsPage({ params }: PageProps) {
  const { id } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/shop/${id}`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    notFound();
  }

  const { product } = await res.json();

  return (
    <div className="min-h-screen bg-[#FBF6EF]">
      <Navbar />
      <div className="grid grid-cols-5 gap-10 max-w-6xl mx-auto px-5 pb-5">
        <div className="col-span-3 pt-8">
          <Gallery />
        </div>
        <div className="col-span-2">
          <Details
            Title={product.prod_name}
            Category={product.prod_category}
            Price={product.prod_price}
            Description={product.prod_description}
          />
        </div>
      </div>
      <ExtraInfo />
      <Footer />
    </div>
  );
}
