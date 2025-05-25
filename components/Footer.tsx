export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 text-[8px] pb-1 z-50 pr-[calc(1rem_+_env(safe-area-inset-right))] pl-[calc(1rem_+_env(safe-area-inset-left))] mx-auto max-w-4xl flex justify-center">
      <div className="flex w-full justify-between items-center text-muted-foreground">
        <span>© {year} CyberDev s.r.o.</span>
        <a
          href="https://cyberdev.cz"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          CyberDev.cz
        </a>
      </div>
    </footer>
  );
}