"use client";

import Link from "next/link";
import { useRouter } from "next/router";

export function Navbar() {
  const router = useRouter();
  const isHomePage = router.pathname === "/";

  // Only show on homepage as a minimal brand link
  if (!isHomePage) return null;

  return (
    <header className="w-full flex fixed p-1 z-50 px-2 bg-transparent justify-between items-center">
      <div>
        <Link href="/" passHref>
          {/* <img
            src="/logo-black.png"
            alt="Logo"
            className="w-36 mt-2 ml-5"
          /> */}
        </Link>
      </div>
    </header>
  );
}
