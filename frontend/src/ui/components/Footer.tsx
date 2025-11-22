export function Footer() {
  return (
    <footer className="mt-10">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="card rounded-2xl px-6 py-5 flex items-center justify-between">
          <div className="text-white/70 text-sm">
            Nebula Atlas · FHEVM Mock · 本地开发模式
          </div>
          <div className="text-xs text-white/40">
            © {new Date().getFullYear()} Nebula Atlas
          </div>
        </div>
      </div>
    </footer>
  );
}


