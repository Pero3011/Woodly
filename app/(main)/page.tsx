import Home from "./pages/home/page";

async function delay(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
export default async function HomePage() {
  await delay(3000);
  return (
    <div>
      <Home/>
    </div>
  );
}
