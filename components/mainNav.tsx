"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import CcLogo from '../app/cc-logo.svg';
export default function MainNav() {
  const [state, setState] = React.useState(false);
  const menus = [
    { title: "Feedback", path: "/contact" },
  ];

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <button
        className="pr-2 absolute md:hidden right-0 top-4"
        title="menu"
        onClick={() => setState(!state)}
      >
        <Menu />
      </button>
      <header className="px-4 py-3 shadow flex justify-between  bg-white">
        {!state ? (
          <Link
            href="/"
            aria-label="Back to homepage"
            className="flex md:justify-center justify-start items-center gap-3"
          >
            <div className="flex items-center justify-center w-15">
              <CcLogo className="w-[120px]" />
            </div>
          </Link>
        ) : null}
        <div className="flex justify-between">
          <div className="flex">
            <div
              className={`flex-1 justify-self-center pb-3 mt-8 md:block md:pb-0 md:mt-0 ${
                state ? "block" : "hidden"
              }`}
            >
              <ul className="justify-center items-center space-y-8 md:flex md:space-x-6 md:space-y-0 mt-2 ml-5 font-semibold">
                {menus.map((item, idx) => (
                  <li
                    key={idx}
                    className="hover:text-rose-600 text-sm"
                  >
                    <Link href={item.path}>{item.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}