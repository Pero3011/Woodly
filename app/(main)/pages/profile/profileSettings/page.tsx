import Navbar from "@/components/Navbar";
import ProfileSettings from "@/components/Profile/ProfileSettings";
import ProfileSidebar from "@/components/ProfileSidebar";

export default function page() {
  return (
    // <div className="w-full">
    //   <Navbar/>

    //   <div className="flex ">
    //     <ProfileSidebar />
    //     <div className="flex-1">
    //       <ProfileSettings />
    //     </div>
    //   </div>
    // </div>
    <div className="w-full">
      <Navbar/>
      <div className="md:flex">
        <ProfileSidebar />
        <div className="md:flex-1">
          <ProfileSettings />
        </div>
      </div>
    </div>
  );
}
