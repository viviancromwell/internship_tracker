import Image from "next/image";
import Link from "next/link";
import strideFullColor from "@/assets/icons/stride-full-color.svg";

const featured = [
  { role: "UX Intern", company: "Spotify", location: "NYC", tag: "Design" },
  { role: "PM Intern", company: "Notion", location: "SF", tag: "Product" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 py-5 max-w-6xl mx-auto">
        <Image src={strideFullColor} alt="Stride" height={32} />
        <div className="flex items-center gap-8">
          <Link
            href="/internships"
            className="text-sm font-medium text-neutral-600 hover:text-charcoal transition-colors"
          >
            Browse
          </Link>
          <Link
            href="/internships"
            className="text-sm font-medium text-neutral-600 hover:text-charcoal transition-colors"
          >
            Companies
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-full hover:bg-accent transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-10 pt-16 pb-12">
        <h1 className="text-5xl font-bold text-charcoal leading-tight">
          Find your next step
        </h1>
        <p className="text-lg text-muted mt-4">
          Internships matched to your skills.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 bg-primary text-white text-base font-semibold rounded-full hover:bg-accent transition-colors"
        >
          Explore <span aria-hidden="true">&rarr;</span>
        </Link>
      </section>

      {/* Featured Cards */}
      <section className="max-w-6xl mx-auto px-10 pb-20">
        <div className="flex gap-6">
          {featured.map((item) => (
            <div
              key={item.role}
              className="bg-neutral-50 rounded-2xl border border-tan/60 p-6 w-64 shadow-sm"
            >
              <h3 className="text-base font-bold text-charcoal">
                {item.role}
              </h3>
              <p className="text-sm text-muted mt-1">
                {item.company} &middot; {item.location}
              </p>
              <span className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                {item.tag}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
