import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line/80 bg-[#14212b] text-white">
      <div className="container-shell grid gap-8 py-12 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl">Nestora</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
            Property brokers helping buyers and sellers connect through Nestora
            marketing agents — browse by city and area, then let our team handle
            the conversation.
          </p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-gold-soft">
            Explore
          </p>
          <div className="flex flex-col gap-2 text-sm text-white/75">
            <Link href="/explore">Browse by city</Link>
            <Link href="/explore/bengaluru">Bengaluru areas</Link>
            <Link href="/enquiry?intent=buy">Buy with Nestora</Link>
            <Link href="/enquiry?intent=sell">Sell with Nestora</Link>
            <Link href="/admin/login">Agent admin</Link>
          </div>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-gold-soft">
            How it works
          </p>
          <p className="text-sm leading-relaxed text-white/70">
            Buyers and sellers contact Nestora agents — never each other
            directly on this site. Demo admin:{" "}
            <span className="text-white">admin / admin123</span>
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-shell flex flex-wrap items-center justify-between gap-2 py-4 text-xs text-white/50">
          <span>© {new Date().getFullYear()} Nestora Brokers</span>
          <span>City → Area · Agent enquiries · Inventory desk</span>
        </div>
      </div>
    </footer>
  );
}
