import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-[#C9A84C] text-xs tracking-[0.4em] uppercase mb-4">
        404
      </p>
      <h1 className="text-4xl font-semibold text-white mb-4">
        Page not found
      </h1>
      <p className="text-[#555] text-sm mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="bg-[#C9A84C] hover:bg-[#E0BE6C] text-black text-sm font-semibold tracking-widest uppercase px-8 py-3.5 rounded transition-colors"
      >
        Go home
      </Link>
    </div>
  );
}
