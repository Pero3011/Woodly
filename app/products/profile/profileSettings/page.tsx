import Navbar from "@/components/Home/Navbar/Navbar";
import OrdersHistory from "@/components/Profile/OrdersHistory";
import ProfileSettings from "@/components/Profile/ProfileSettings";
import Sidebar from "@/components/Profile/Sidebar";

export default function page() {
  return (
    <div className="w-full">
      <Navbar hasSearch={true} />

      <div className="flex ">
        <Sidebar />
        <div className="flex-1">
          <ProfileSettings />
        </div>
      </div>
    </div>
  );
}
