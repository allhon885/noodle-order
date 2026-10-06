import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";


const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["thai"],
  weight: [
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
  ],
});


export const metadata: Metadata = {

  title: "Noodle POS",

  description: "Restaurant Order System",

};


export default function RootLayout({
  children
}: LayoutProps<"/">) {


  return (

    <html
      lang="th"
      className={`${kanit.variable} h-full antialiased`}
    >

      <body
        className="
        min-h-full
        flex
        flex-col
        font-sans
        "
      >

        <Navbar />

        <main
          className="
          flex-1
          "
        >

          {children}

        </main>

      </body>

    </html>

  );

}