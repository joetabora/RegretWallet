import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AntiCharityMarketplace } from "@/components/anti-charity-marketplace";

export default async function AntiCharitiesPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <AntiCharityMarketplace
        selectedCharityId={undefined}
        onSelect={(id) => {
          // Handle selection - could redirect or show confirmation
          console.log("Selected anti-charity:", id);
        }}
      />
    </div>
  );
}

