"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";


export default function Navbar(){

  const pathname = usePathname();


  const menus = [

    {
      name:"🍜 รับออเดอร์",
      path:"/"
    },

    {
      name:"📋 ออเดอร์",
      path:"/orders"
    },

    {
      name:"👨‍🍳 ครัว",
      path:"/kitchen"
    },

    {
      name:"💰 ชำระเงิน",
      path:"/payment"
    },

    {
      name:"🧾 ใบเสร็จ",
      path:"/receipt"
    },

    {
      name:"📋 เมนู",
      path:"/menu"
    },

    {
      name:"📊 Dashboard",
      path:"/dashboard"
    },

    {
      name:"⚙️ ตั้งค่า",
      path:"/settings"
    },

    {
    name:"🪑 โต๊ะ",
    path:"/settings/tables"
    },
    

    {
    name:"📄 รายงาน",
    path:"/settings/report"
    },
    

  ];



  return (

    <nav
      className="
      sticky
      top-0
      z-50
      bg-white
      shadow
      "
    >

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


        <div
          className="
          mr-4
          whitespace-nowrap
          text-xl
          font-bold
          "
        >

          🍜 Noodle POS

        </div>



        {
          menus.map(menu=>(

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

                  ?

                  "bg-orange-500 text-white"

                  :

                  "bg-gray-100 text-gray-700 hover:bg-gray-200"

                }

              `}

            >

              {menu.name}

            </Link>

          ))

        }



      </div>


    </nav>

  );

}