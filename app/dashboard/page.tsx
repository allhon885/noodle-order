"use client";

import { useEffect, useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


type SalesChart = {
  date: string;
  sales: string;
};


type Summary = {
  today_sales: string;
  paid_sales: string;
  total_orders: string;
  cash_sales: string;
  transfer_sales: string;
};


type TopMenu = {
  name: string;
  total_quantity: string;
  total_sales: string;
};



export default function DashboardPage(){


  const [summary,setSummary] =
    useState<Summary | null>(null);


  const [topMenu,setTopMenu] =
    useState<TopMenu[]>([]);


  const [salesChart,setSalesChart] =
    useState<SalesChart[]>([]);



  const loadDashboard = async()=>{

    try{

      const res =
        await fetch("/api/dashboard");


      const data =
        await res.json();



      if(res.ok){

        setSummary(data.summary);

        setTopMenu(
          data.topMenu
        );

        setSalesChart(
          data.salesChart
        );

      }


    }catch(error){

      console.error(error);

    }

  };




  useEffect(()=>{


    loadDashboard();


    const timer =
      setInterval(
        loadDashboard,
        30000
      );


    return ()=>clearInterval(timer);


  },[]);





  if(!summary){

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
        text-center
        text-xl
        "
        >

        กำลังโหลด Dashboard...

        </div>


      </main>

    );

  }






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
max-w-6xl
"
>



<h1
className="
text-3xl
font-bold
"
>
📊 Dashboard
</h1>


<p
className="
mt-1
text-gray-500
"
>
สรุปยอดขายประจำวัน
</p>





{/* SUMMARY */}


<div
className="
mt-6
grid
gap-5
md:grid-cols-5
"
>



<Card
title="💰 ยอดขายวันนี้"
value={
Number(summary.today_sales)
.toLocaleString()
}
color="text-orange-500"
/>


<Card
title="💰 รับเงินจริง"
value={
Number(summary.paid_sales)
.toLocaleString()
}
color="text-green-600"
/>


<Card
title="🧾 จำนวนบิล"
value={
summary.total_orders
}
unit="บิล"
color="text-black"
/>



<Card
title="💵 เงินสด"
value={
Number(summary.cash_sales)
.toLocaleString()
}
color="text-green-600"
/>



<Card
title="📱 โอนเงิน"
value={
Number(summary.transfer_sales)
.toLocaleString()
}
color="text-blue-600"
/>



</div>







{/* TOP MENU */}


<div
className="
mt-6
rounded-2xl
bg-white
p-6
shadow
"
>


<h2
className="
text-2xl
font-bold
"
>
🏆 เมนูขายดี
</h2>



<div
className="
mt-5
space-y-3
"
>


{
topMenu.length===0

?

<div
className="
text-gray-400
"
>
ยังไม่มีข้อมูล
</div>


:


topMenu.map(
(menu,index)=>(


<div
key={menu.name}
className="
flex
justify-between
rounded-xl
bg-gray-50
p-4
"
>


<div
className="
font-bold
"
>

{index+1}. {menu.name}

</div>



<div
className="
text-right
"
>

<div
className="
font-bold
"
>
{menu.total_quantity} ชาม
</div>


<div
className="
text-sm
text-gray-500
"
>
ยอด {Number(menu.total_sales).toLocaleString()} บาท
</div>


</div>



</div>


)

)

}



</div>



</div>









{/* CHART */}


<div
className="
mt-6
rounded-2xl
bg-white
p-6
shadow
"
>


<h2
className="
text-2xl
font-bold
"
>

📈 ยอดขายย้อนหลัง

</h2>



<div
className="
mt-5
h-80
"
>


<ResponsiveContainer
width="100%"
height="100%"
>


<LineChart
data={salesChart}
>


<CartesianGrid />


<XAxis
dataKey="date"
/>


<YAxis />


<Tooltip />


<Line
type="monotone"
dataKey="sales"
/>


</LineChart>


</ResponsiveContainer>


</div>



</div>





</div>


</main>


);


}





function Card({
title,
value,
unit = "บาท",
color
}:{
title:string;
value:string;
unit?:string;
color:string;
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


<div
className="
text-gray-500
"
>
{title}
</div>



<div
className={`
mt-2
text-3xl
font-bold
${color}
`}
>

{value}

{unit}

</div>


</div>


);


}