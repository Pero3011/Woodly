import Navbar from "@/components/Navbar";
import OrdersHistory from "@/components/Profile/OrdersHistory";
import Sidebar from "@/components/ProfileSidebar";

export default function page() {
  return (
    <div className="w-full">
      <Navbar />

      <div className="lg:flex">
        <Sidebar />
        <div className="lg:flex-1">
          <OrdersHistory />
        </div>
      </div>
    </div>
  );
}
