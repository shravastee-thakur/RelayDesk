import Navbar from "../components/Navbar";
import PublicHero from "../components/PublicHero";

export default function LandingPage() {
  // Simulate auth state — wire this to your auth context
  const user = {
    name: "John Doe",
    role: "public" as const, // "customer" | "agent" | "admin"
  };

  return (
    <>
      <Navbar user={user} onLogout={() => console.log("logout")} />
      <PublicHero />
    </>
  );
}
