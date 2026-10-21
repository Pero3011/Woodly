import { notFound } from "next/navigation";
import { headers } from "next/headers";

import Navbar from "@/components/Navbar";
import Footer from "@/components/FooterPage";
import Details from "@/components/PieceDetails/Details";
import Gallery from "@/components/PieceDetails/Gallery";
import ExtraInfo from "@/components/PieceDetails/ExtraInfo";

interface PageProps {
  params: Promise<{ id: string }>;
}


async function getProduct(id: string) {
  const headersList = await headers();

  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");

  const protocol =
    headersList.get("x-forwarded-proto")?.split(",")[0] ?? "https";

  if (!host) {
    throw new Error("Unable to determine request host");
  }

  const baseUrl = `${protocol}://${host}`;

  const res = await fetch(
    new URL(`/api/shop/${encodeURIComponent(id)}`, baseUrl),
    {
      cache: "no-store",
    },
  );

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch product details: ${res.status}`);
  }

  const data = await res.json();
  return data.product ?? null;
}


export default async function PieceDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);

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
            Prod_img={product.prod_imgs?.[0] || ""}
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
