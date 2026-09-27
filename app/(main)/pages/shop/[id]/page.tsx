import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/FooterPage";
import Details from "@/components/PieceDetails/Details";
import Gallery from "@/components/PieceDetails/Gallery";
import ExtraInfo from "@/components/PieceDetails/ExtraInfo";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string) {
  // Use absolute URL for server-side fetching in Next.js App Router
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/shop/${id}`, {
    cache: "no-store", // Ensures fresh data on request
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch product details. Status: ${res.status}`);
  }

  const data = await res.json();
  return data.product;
}

export default async function PieceDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  // If the API route returns a 404 or no product, show Next.js 404 page
  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FBF6EF]">
      <Navbar />
      <div className="grid grid-cols-5 gap-10 max-w-6xl mx-auto px-5 pb-5">
        <div className="col-span-3 pt-8">
          <Gallery images={product.prod_imgs} />
        </div>
        <div className="col-span-2">
          <Details
            Prod_id={product.prod_id}
            Prod_img={product.prod_imgs[0] || ""}
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
