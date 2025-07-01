import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import useUser from "@/hooks/useUser";
import { Bell, MessageCircle, Shield, LogOut, Settings, MonitorSmartphone, Menu } from "lucide-react";
import { useRouter } from "next/router";

export default function Navbar() {
  const { data: user } = useUser();
  const router = useRouter();

  const getLinkClassName = (href: string) => {
    const isActive = router.pathname === href;
    return `flex w-full items-center gap-3 py-2 text-md font-bold rounded-md transition-all duration-300 ease-in-out ${
      isActive ? 'bg-gray-700 text-white' : 'hover:bg-gray-700 hover:text-white'
    }`;
  };
  
  return (
    <header className="flex h-20 w-full shrink-0 items-center px-4 md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="bg-[#f8f8f8] text-black hover:bg-gray-600 hover:text-white transition-colors duration-300 ease-in-out border border-gray-300">
            <Menu className="h-6 w-6 text-current transition-colors duration-300 ease-in-out" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-transparent text-white mt-safe mx-safe mb-safe">
          <SheetTitle className="sr-only">Navigace</SheetTitle>
          <SheetDescription className="sr-only">Postranní navigační panel s odkazy na různé sekce aplikace.</SheetDescription>
          <div className="grid gap-2 py-6">
            <div className="grid flex-1 text-left text-sm leading-tight ml-2">
              <span className="truncate font-semibold">{user?.firstName} {user?.lastName}</span>
              <span className="truncate text-xs">{user?.email}</span>
              <span className="truncate font-semibold">{user?.organization.name}</span>
            </div>
            <Link href="/alert" className={getLinkClassName('/alert')} prefetch={false}>
              <Bell className="h-5 w-5 transition-colors duration-300 ease-in-out ml-2" />
              Alert
            </Link>
            <Link href="/chat" className={getLinkClassName('/chat')} prefetch={false}>
              <MessageCircle className="h-5 w-5 transition-colors duration-300 ease-in-out ml-2" />
              Chat
            </Link>
            <Link href="/emergency" className={getLinkClassName('/emergency')} prefetch={false}>
              <Shield className="h-5 w-5 transition-colors duration-300 ease-in-out ml-2" />
              Nouzové kontakty
            </Link>
            {user?.role === 'SUPERADMIN' && <Link href="/monitoring" className={getLinkClassName('/monitoring')} prefetch={false}>
              <MonitorSmartphone className="h-5 w-5 transition-colors duration-300 ease-in-out ml-2" />
              Monitoring
            </Link>}
            <Link href="/settings" className={getLinkClassName('/settings')} prefetch={false}>
              <Settings className="h-5 w-5 transition-colors duration-300 ease-in-out ml-2" />
              Nastavení
            </Link>
            <Link href="/logout" className={getLinkClassName('/logout')} prefetch={false}>
              <LogOut className="h-5 w-5 transition-colors duration-300 ease-in-out ml-2" />
              Odhlásit se
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
