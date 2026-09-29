"use client";

import { useState } from "react";


export default function BackupPage(){

const [loading,setLoading]=useState(false);



const downloadBackup = ()=>{

window.open(
"/api/backup",
"_blank"
);

};



const today =
new Date()
.toISOString()
.substring(0,10);



const downloadDaily = ()=>{

window.open(
`/api/report/daily-pdf?date=${today}`,
"_blank"
);

};



const downloadMonthly = ()=>{


const month =
today.substring(0,7);


window.open(

`/api/report/monthly-pdf?month=${month}`,

"_blank"

);


};




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
max-w-5xl
mx-auto
"
>


<h1
className="
text-3xl
font-bold
"
>

💾 Backup & Report

</h1>


<p
className="
mt-2
text-gray-500
"
>

สำรองข้อมูล และออกรายงานยอดขาย

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

title="💾 Backup Database"

detail="ดาวน์โหลดไฟล์ SQL สำหรับสำรองข้อมูลทั้งหมด"

button="Download Backup"

color="bg-green-500"

onClick={downloadBackup}

/>





<Card

title="📄 รายงานยอดขายรายวัน"

detail="Export PDF ยอดขายประจำวัน"

button="Export PDF"

color="bg-red-500"

onClick={downloadDaily}

/>





<Card

title="📊 รายงานยอดขายรายเดือน"

detail="Export PDF สรุปยอดขายรายเดือน"

button="Export PDF"

color="bg-blue-500"

onClick={downloadMonthly}

/>




</div>


</div>


</main>


);

}





function Card({

title,

detail,

button,

color,

onClick

}:any){


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

{detail}

</p>




<button

onClick={onClick}

className={`
mt-5
rounded-xl
px-5
py-3
font-bold
text-white
${color}
`}

>

{button}

</button>



</div>


);


}