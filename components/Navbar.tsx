/**
 * v0 by Vercel.
 * @see https://v0.dev/t/lJwnQlHSEBA
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Navbar() {
  return (
    <header className="flex h-20 w-full shrink-0 items-center px-4 md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="bg-transparent hover:bg-transparent hover:text-gray-300 transition-colors duration-300 ease-in-out">
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-transparent text-white mt-safe mx-safe mb-safe">
          <div className="grid gap-2 py-6">
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">user.name</span>
              <span className="truncate text-xs">user.email</span>
            </div>
            <Link href="/alert" className="flex w-full items-center py-2 text-lg font-bold" prefetch={false}>
              Alarm
            </Link>
            <Link href="#" className="flex w-full items-center py-2 text-lg font-bold" prefetch={false}>
              Komunikace
            </Link>
            <Link href="#" className="flex w-full items-center py-2 text-lg font-bold" prefetch={false}>
              Záchranné složky
            </Link>
            <Link href="#" className="flex w-full items-center py-2 text-lg font-bold" prefetch={false}>
              Dokumenty
            </Link>
            <Link href="#" className="flex w-full items-center py-2 text-lg font-bold" prefetch={false}>
              Nastavení
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}
