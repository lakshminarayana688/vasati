import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8F6FC] flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-3xl font-extrabold text-[#5C16C5]">404 – Page Not Found</h2>
      <p className="text-sm text-gray-500 mt-2">The page you are looking for does not exist on VASATI.</p>
      <Link
        href="/"
        className="mt-6 px-6 py-3 rounded-full bg-[#5C16C5] text-white text-xs font-bold shadow-md hover:bg-[#430E96]"
      >
        Return to Home
      </Link>
    </div>
  );
}
