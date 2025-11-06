"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const isHomePage = router.pathname === "/";

  return (
    <header className="w-full flex fixed p-1 z-50 px-2 bg-transparent justify-between items-center">
      <div>
        <Link href="/" passHref onClick={() => location.reload()}>
          {/* <img
            src="/logo-black.png"
            alt="Logo"
            className="w-36 mt-2 ml-5"
          /> */}
        </Link>
      </div>
      {isHomePage && (
        <div className="mr-4 mt-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="px-10 py-3.5 bg-[#333643] hover:bg-[#3d4150] text-white text-md font-medium rounded-full transition-all duration-200">
                Experimenter Dashboard
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[#2a2d38] border-[#3d4150]">
              <DialogHeader>
                <DialogTitle className="text-white text-xl">Experimenter Dashboard</DialogTitle>
                <DialogDescription className="text-gray-400 text-base px-8 py-8">
                  Access to the Experimenter Dashboard will be reactivated soon. Please check back later for updates.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </header>
  );
}