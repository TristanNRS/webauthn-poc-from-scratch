import Link from "next/link";

export default function Home() {
  return (
    <main>
      <Link
        href="/register"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Register
      </Link>
      <Link
        href="/login"
        className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Login
      </Link>
    </main>
  );
}
