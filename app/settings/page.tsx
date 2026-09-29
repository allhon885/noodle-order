"use client";

import Link from "next/link";


export default function SettingsPage(){


return (

<main
className="
min-h-screen
bg-gray-100
p-6
"
>


<div
className="
mx-auto
max-w-5xl
"
>


<h1
className="
text-3xl
font-bold
"
>
⚙️ ตั้งค่าระบบ
</h1>


<p
className="
mt-2
text-gray-500
"
>
จัดการข้อมูลร้าน และการทำงานของระบบ
</p>




<div
className="
mt-6
grid
gap-5
md:grid-cols-2
"
>



<Card

title="🏪 ข้อมูลร้าน"

text="ชื่อร้าน ที่อยู่ เบอร์โทร สำหรับใบเสร็จ"

href="/settings/shop"

/>



<Card

title="🪑 จัดการโต๊ะ"

text="เพิ่ม ลบ แก้ไขโต๊ะ"

href="/settings/tables"

/>




<Card

title="💰 การขาย"

text="ตั้งค่าการรับเงิน และระบบขาย"

href="/settings/sales"

/>



<Card

title="👤 ผู้ใช้งาน"

text="จัดการสิทธิ์พนักงาน"

href="/settings/users"

/>



<Card

title="💾 สำรองข้อมูล"

text="Export รายงาน และ Backup"

href="/settings/backup"

/>



<Card

title="📊 รายงานยอดขาย"

text="Export PDF รายวัน และรายเดือน"

href="/settings/report"

/>



</div>


</div>


</main>

);


}





function Card({

title,

text,

href

}:{

title:string;

text:string;

href:string;

}){


return (

<div

className="
rounded-2xl
bg-white
p-6
shadow
"

>


<h2
className="
text-xl
font-bold
"
>

{title}

</h2>



<p

className="
mt-2
text-gray-500
"

>

{text}

</p>




<Link

href={href}

className="
inline-block
mt-4
rounded-xl
bg-orange-500
px-5
py-2
font-bold
text-white
hover:bg-orange-600
"

>

จัดการ

</Link>



</div>


);


}