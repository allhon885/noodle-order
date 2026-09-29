"use client";

import { useEffect, useState } from "react";


type OrderItem = {

menuName:string;

quantity:number;

unitPrice:number;

subtotal:number;

noodle?:string|null;

vegetable?:string|null;

};



type Order = {

id:number;

order_number:string;

table_number:string;

status:string;

total_amount:string | number;

payment_method:string|null;

cash_received:string|null;

change_amount:string|null;

created_at:string;

items:OrderItem[];

};



type Shop={

shop_name:string;

phone:string;

address:string;

receipt_footer:string;

};





const money=(value:any)=>{


if(value===null || value===undefined){

return "0.00";

}


return Number(value).toLocaleString(
"th-TH",
{
minimumFractionDigits:2,
maximumFractionDigits:2
}
);


};







export default function ReceiptPage(){


const [orders,setOrders]=
useState<Order[]>([]);


const [shop,setShop]=
useState<Shop|null>(null);


const [selected,setSelected]=
useState<Order|null>(null);





const loadData=async()=>{


try{


const orderRes =
await fetch("/api/orders");


const orderData =
await orderRes.json();



console.log(
"ORDERS",
orderData
);



if(orderRes.ok){


const fixedOrders =
orderData.map((order:any)=>({

...order,

items:

typeof order.items==="string"

?

JSON.parse(order.items)

:

order.items || []

}));


setOrders(fixedOrders);


}






const shopRes =
await fetch("/api/settings/shop");


const shopData =
await shopRes.json();



console.log(
"SHOP",
shopData
);



if(shopRes.ok){

setShop(shopData);

}



}catch(error){

console.error(
"RECEIPT ERROR",
error
);


}


};






useEffect(()=>{


loadData();


},[]);







const paidOrders =

orders.filter(

order=>

order.status==="paid"

);






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
max-w-4xl
mx-auto
"
>


<h1
className="
text-3xl
font-bold
"
>

🧾 ใบเสร็จ

</h1>





{

paidOrders.length===0

?


<div
className="
mt-6
bg-white
rounded-xl
p-10
text-center
shadow
"
>

ยังไม่มีรายการชำระเงิน

</div>


:

paidOrders.map(order=>(


<div
key={order.id}
className="
mt-5
bg-white
rounded-xl
p-5
shadow
flex
justify-between
"
>


<div>

<div
className="
text-xl
font-bold
"
>

{order.order_number}

</div>


<div>

โต๊ะ {order.table_number}

</div>


</div>



<button

onClick={()=>setSelected(order)}

className="
bg-black
text-white
rounded-xl
px-5
py-2
font-bold
"
>

🧾 เปิดใบเสร็จ

</button>



</div>


))


}







{

selected &&

<div
className="
mt-6
bg-white
rounded-xl
p-6
max-w-md
shadow
"
>


<div
className="
text-center
"
>


<h2
className="
text-2xl
font-bold
"
>

{shop?.shop_name || "Noodle POS"}

</h2>


<div>

ใบเสร็จรับเงิน

</div>


</div>




<hr className="my-4"/>



<div>

เลขที่:
{selected.order_number}

</div>


<div>

โต๊ะ:
{selected.table_number}

</div>





<div className="mt-4">


{

selected.items.map(

(item,index)=>(


<div
key={index}
className="
flex
justify-between
border-b
py-2
"
>


<span>

{item.menuName}

x{item.quantity}

</span>


<span>

{money(item.subtotal)}

</span>


</div>


)

)

}



</div>





<div
className="
mt-5
text-xl
font-bold
flex
justify-between
"
>

<span>

รวม

</span>


<span>

{money(selected.total_amount)}

บาท

</span>


</div>






<div className="mt-3">


ชำระโดย:

{

selected.payment_method==="cash"

?

"💵 เงินสด"

:

"📱 โอนเงิน"

}


</div>





{

selected.payment_method==="cash"

&&

<>

<div>

รับเงิน:
{money(selected.cash_received)}

</div>


<div>

เงินทอน:
{money(selected.change_amount)}

</div>

</>


}





<button

onClick={()=>window.print()}

className="
mt-5
w-full
bg-black
text-white
rounded-xl
py-3
"

>

🖨️ พิมพ์

</button>




</div>


}



</div>


</main>


);


}