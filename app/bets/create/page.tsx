import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CreateBetForm } from "@/components/create-bet-form";

export default async function CreateBetPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Fetch charities from Supabase
  // const { data: charities } = await supabase.from("charities").select("*").eq("is_active", true);

  // Mock charities for now
  const mockCharities = [
    { id: "1", name: "American Red Cross" },
    { id: "2", name: "Cancer Research Institute" },
    { id: "3", name: "American Heart Association" },
    { id: "4", name: "Doctors Without Borders" },
    { id: "5", name: "World Wildlife Fund" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Create a New Bet</h1>
        <p className="text-muted-foreground">
          Set a goal, choose a charity, and put your money where your mouth is.
        </p>
      </div>

      <CreateBetForm charities={mockCharities} />
    </div>
  );
}

