import Navbar from "@/components/Home/Navbar/Navbar";
import OrdersHistory from "@/components/Profile/OrdersHistory";
import Sidebar from "@/components/Profile/Sidebar";

export default function page() {
  return (
    <div className="w-full">
      <Navbar hasSearch={true} />

      <div className="flex ">
        <Sidebar />
        <div className="flex-1">
          <OrdersHistory />
        </div>
      </div>
    </div>
  );
}
