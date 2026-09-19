import { getDatabaseConnection } from "@/lib/db";
import { notFound } from "next/navigation";
import oracledb from "oracledb";
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

  let connection;
  let row;

  try {
    connection = await getDatabaseConnection();

    // Same RAWTOHEX comparison as the API route — PROD_ID is RAW (binary),
    // and `id` here is the hex string version of it
    const query = `
      SELECT PROD_ID, NAME, DESCRIPTION, RATING, CATEGORY, PRICE, IMAGE
      FROM products
      WHERE RAWTOHEX(PROD_ID) = UPPER(:id)
    `;

    const result = await connection.execute(
      query,
      { id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    row = (result.rows as any[])?.[0];
  } finally {
    // Always release the connection, even if the query above throws
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error("Error closing connection:", closeErr);
      }
    }
  }

  // No product with this id — show Next.js's not-found page
  // instead of crashing or rendering empty fields
  if (!row) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FBF6EF]">
      <Navbar />
      <div className="grid grid-cols-5 gap-10 max-w-6xl mx-auto px-5 pb-5">
        <div className="col-span-3 pt-8">
          <Gallery />
        </div>
        <div className="col-span-2">
          <Details
            Prod_id={row.PROD_ID.toString("hex")}
            Prod_img={row.IMAGE}
            Title={row.NAME}
            Category={row.CATEGORY}
            Price={row.PRICE}
            Description={row.DESCRIPTION}
          />
        </div>
      </div>
      <ExtraInfo />
      <Footer />
    </div>
  );
}
