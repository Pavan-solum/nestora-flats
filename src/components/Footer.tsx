import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line/80 bg-[#14212b] text-white">
      <div className="container-shell grid gap-8 py-12 md:grid-cols-3">
        <div>
          <Image
            src="/logo.png"
            alt="Prop Nexa Homes"
            width={512}
            height={512}
            className="h-28 w-auto max-w-full rounded-xl bg-[#f7f9fb] object-contain object-left p-1.5 md:h-36"
          />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
            Property brokers helping buyers and sellers connect through Prop Nexa Homes
            marketing agents — browse by city and area, then let our team handle
            the conversation.
          </p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-gold-soft">
            Explore
          </p>
          <div className="flex flex-col text-sm text-white/75">
            <Link href="/explore" className="inline-flex min-h-11 items-center">
              Browse by city
            </Link>
            <Link href="/explore/bengaluru" className="inline-flex min-h-11 items-center">
              Bengaluru areas
            </Link>
            <Link href="/enquiry?intent=buy" className="inline-flex min-h-11 items-center">
              Buy with Prop Nexa Homes
            </Link>
            <Link href="/enquiry?intent=sell" className="inline-flex min-h-11 items-center">
              Sell with Prop Nexa Homes
            </Link>
            <Link href="/admin/login" className="inline-flex min-h-11 items-center">
              Agent admin
            </Link>
          </div>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-gold-soft">
            How it works
          </p>
          <p className="text-sm leading-relaxed text-white/70">
            Buyers and sellers contact Prop Nexa Homes agents — never each other
            directly on this site.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-shell flex flex-wrap items-center justify-between gap-2 py-4 text-xs text-white/50">
          <span>© {new Date().getFullYear()} Prop Nexa Homes</span>
          <span>City → Area · Agent enquiries · Inventory desk</span>
        </div>
      </div>
    </footer>
  );
}
