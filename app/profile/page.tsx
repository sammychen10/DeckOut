import { ProfileView } from "@/components/ProfileView";

export const metadata = {
  title: "My Profile — DeckOut",
};

export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ProfileView />
    </div>
  );
}
