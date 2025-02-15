import { Bell, User, BookOpen } from 'lucide-react';
import { useRouter } from "next/router";

export default function Footer() {
  const router = useRouter();

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white flex justify-around items-center h-16">
      <button
        onClick={() => router.push("/alert")}
        className="flex flex-col items-center"
      >
        <Bell />
        <span className="text-sm">Alarm</span>
      </button>

      <button
        onClick={() => router.push("/profil")}
        className="flex flex-col items-center"
      >
        <User />
        <span className="text-sm">Můj profil</span>
      </button>

      <button
        onClick={() => router.push("/informace")}
        className="flex flex-col items-center"
      >
        <BookOpen />
        <span className="text-sm">Informace</span>
      </button>
    </footer>
  );
}
