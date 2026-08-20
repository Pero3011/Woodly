import Navbar from "@/components/Home/Navbar/Navbar";
import Sidebar from "@/components/Shop/Sidebar/Sidebar";
import Heading from "@/components/Shop/Heading/Heading";

export default function page() {
  return (
    <div>
      <Navbar hasSearch={true} />
      <div className="flex">
        <aside>
          <Sidebar />
        </aside>
        <div className="flex-1">
          <Heading />
        </div>
      </div>
    </div>
  );
}
