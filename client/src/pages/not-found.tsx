import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-dvh w-full bg-black text-primary font-terminal flex items-center justify-center p-6">
      <div className="w-full max-w-lg border-2 border-primary/40 bg-black/80 p-6">
        <p className="font-pixel text-sm text-red-400 mb-4">ERROR_404</p>
        <h1 className="font-pixel text-xl sm:text-2xl leading-relaxed mb-4">SIGNAL_NOT_FOUND</h1>
        <p className="text-lg leading-relaxed text-white/80 mb-6">
          This route is outside the arcade. The portfolio is still online.
        </p>
        <Link
          href="/"
          className="inline-flex items-center min-h-11 px-4 border-2 border-primary text-primary font-pixel text-xs hover:bg-primary hover:text-black"
        >
          RETURN_TO_PORTFOLIO
        </Link>
      </div>
    </div>
  );
}
