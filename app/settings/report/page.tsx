"use client";


import {useState} from "react";



export default function ReportPage(){


const today =
new Date()
.toISOString()
.substring(0,10);



const [date,setDate] =
useState(today);



const [month,setMonth] =
useState(
today.substring(0,7)
);



const [loading,setLoading] =
useState(false);





const exportDaily = async()=>{


try{


setLoading(true);


window.open(

`/api/report/daily-pdf?date=${date}`,

"_blank"

);



}catch(error){

console.error(error);

}

finally{

setLoading(false);

}


};







const exportMonthly = async()=>{


try{


setLoading(true);


window.open(

`/api/report/monthly-pdf?month=${month}`,

"_blank"

);



}catch(error){

console.error(error);

}

finally{

setLoading(false);

}


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
mx-auto
max-w-4xl
"

>


<h1

className="
text-3xl
font-bold
"

>

📊 รายงานยอดขาย

</h1>



<p

className="
mt-2
text-gray-500
"

>

Export รายงาน PDF สำหรับตรวจสอบยอดขาย

</p>






<div

className="
mt-6
grid
gap-6
md:grid-cols-2
"

>






{/* รายวัน */}


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

📅 รายงานรายวัน

</h2>



<p

className="
mt-2
text-gray-500
"

>

ดูยอดขายของวันที่เลือก

</p>




<label

className="
mt-4
block
font-bold
"

>

เลือกวันที่

</label>



<input

type="date"

value={date}

onChange={
e=>setDate(e.target.value)
}

className="
mt-2
w-full
rounded-xl
border
p-3
"

/>




<button


onClick={exportDaily}


disabled={loading}


className="
mt-5
w-full
rounded-xl
bg-red-500
py-3
font-bold
text-white
hover:bg-red-600
"

>

{

loading

?

"กำลังสร้าง PDF..."

:

"📄 Export PDF รายวัน"

}


</button>



</div>









{/* รายเดือน */}



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

🗓 รายงานรายเดือน

</h2>



<p

className="
mt-2
text-gray-500
"

>

สรุปยอดขายทั้งเดือน

</p>




<label

className="
mt-4
block
font-bold
"

>

เลือกเดือน

</label>




<input


type="month"


value={month}


onChange={

e=>setMonth(e.target.value)

}


className="
mt-2
w-full
rounded-xl
border
p-3
"


/>





<button


onClick={exportMonthly}


disabled={loading}


className="
mt-5
w-full
rounded-xl
bg-orange-500
py-3
font-bold
text-white
hover:bg-orange-600
"

>

{

loading

?

"กำลังสร้าง PDF..."

:

"📄 Export PDF รายเดือน"

}


</button>




</div>






</div>





<div

className="
mt-8
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

💡 ขั้นตอนถัดไป

</h2>


<ul

className="
mt-3
list-disc
pl-5
text-gray-600
"

>

<li>
เพิ่มกราฟยอดขายรายวัน
</li>

<li>
เพิ่มเมนูขายดี Top 10
</li>

<li>
เพิ่ม Backup Database
</li>

<li>
เพิ่ม Export Excel
</li>


</ul>


</div>






</div>


</main>


);


}