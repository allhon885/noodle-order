"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);



  const mainMenus = [
    {
      name: "🍜 รับออเดอร์",
      path: "/",
    },
    {
      name: "📋 ออเดอร์",
      path: "/orders",
    },
    {
      name: "👨‍🍳 ครัว",
      path: "/kitchen",
    },
    {
      name: "💰 ชำระเงิน",
      path: "/payment",
    },
    {
      name: "🧾 ใบเสร็จ",
      path: "/receipt",
    },
  ];

  const menuSubMenus = [
    {
      name: "🍜 จัดการเมนูอาหาร",
      path: "/menu",
    },
    {
      name: "🥬 วัตถุดิบ",
      path: "/ingredients",
    },
    {
      name: "🧪 สูตรอาหาร",
      path: "/recipes",
    },
  ];

  const settingMenu = {
    name: "⚙️ ตั้งค่า",
    path: "/settings",
  };

  const tableMenu = {
    name: "🪑 โต๊ะ",
    path: "/settings/tables",
  };

  const reportMenu = {
    name: "📄 รายงาน",
    path: "/settings/report",
  };

  const dashboardMenu = {
    name: "📊 Dashboard",
    path: "/dashboard",
  };

  const isMenuActive = menuSubMenus.some(
    (menu) => pathname === menu.path
  );

  return (
    <nav className="sticky top-0 z-50 bg-white shadow">
      {/* ========================= */}
      {/* NAVBAR หลัก */}
      {/* ========================= */}

      <div
        className="
          mx-auto
          flex
          max-w-7xl
          items-center
          gap-2
          overflow-x-auto
          p-3
        "
      >
        {/* Logo */}

        <div
          className="
            mr-4
            whitespace-nowrap
            text-xl
            font-bold
          "
        >
          🍜 Hommm TooN
        </div>

        {/* เมนูหลัก */}

        {mainMenus.map((menu) => (
          <Link
            key={menu.path}
            href={menu.path}
            className={`
              whitespace-nowrap
              rounded-xl
              px-4
              py-2
              font-bold
              transition

              ${
                pathname === menu.path
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }
            `}
          >
            {menu.name}
          </Link>
        ))}

        {/* ========================= */}
        {/* ปุ่ม MENU */}
        {/* ========================= */}

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className={`
            whitespace-nowrap
            rounded-xl
            px-4
            py-2
            font-bold
            transition

            ${
              isMenuActive
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }
          `}
        >
          📋 เมนู {menuOpen ? "▲" : "▼"}
        </button>

        {/* Dashboard */}

        <Link
          href={dashboardMenu.path}
          className={`
            whitespace-nowrap
            rounded-xl
            px-4
            py-2
            font-bold
            transition

            ${
              pathname === dashboardMenu.path
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }
          `}
        >
          {dashboardMenu.name}
        </Link>

        {/* ตั้งค่า */}

        <Link
          href={settingMenu.path}
          className={`
            whitespace-nowrap
            rounded-xl
            px-4
            py-2
            font-bold
            transition

            ${
              pathname === settingMenu.path
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }
          `}
        >
          {settingMenu.name}
        </Link>

        {/* โต๊ะ */}

        <Link
          href={tableMenu.path}
          className={`
            whitespace-nowrap
            rounded-xl
            px-4
            py-2
            font-bold
            transition

            ${
              pathname === tableMenu.path
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }
          `}
        >
          {tableMenu.name}
        </Link>

        {/* รายงาน */}

        <Link
          href={reportMenu.path}
          className={`
            whitespace-nowrap
            rounded-xl
            px-4
            py-2
            font-bold
            transition

            ${
              pathname === reportMenu.path
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }
          `}
        >
          {reportMenu.name}
        </Link>
      </div>

      {/* ========================= */}
      {/* MENU ย่อยแบบ SLIDE */}
      {/* ========================= */}

      <div
        className={`
          overflow-hidden
          transition-all
          duration-300
          ease-in-out
          ${
            menuOpen
              ? "max-h-32 opacity-100"
              : "max-h-0 opacity-0"
          }
        `}
      >
        <div
          className="
            mx-auto
            max-w-7xl
            border-t
            border-gray-200
            bg-white
            px-3
            pb-3
            pt-2
          "
        >
          <div
            className="
              flex
              gap-2
              overflow-x-auto
            "
          >
            {menuSubMenus.map((menu) => (
              <Link
                key={menu.path}
                href={menu.path}
                onClick={() => setMenuOpen(false)}
                className={`
                  whitespace-nowrap
                  rounded-xl
                  px-4
                  py-2
                  font-bold
                  transition

                  ${
                    pathname === menu.path
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                {menu.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}