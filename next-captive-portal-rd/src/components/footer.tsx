"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-4 flex items-center justify-center">
      <Link href="/" className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
        <img
          src="/AuraConnect-48px.png"
          alt="AuraConnect"
          className="h-5 w-auto"
          draggable={false}
        />
      </Link>
    </footer>
  );
}
