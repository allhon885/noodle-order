"use client";

import { useEffect, useState } from "react";


type OrderItem = {

  menuName:string;

  quantity:number;

  size:string;

  noodle:string | null;

  vegetable:string | null;

  note:string | null;

};



type Order = {

  id:number;

  order_number:string;

  table_number:string;

  status:string;

  created_at:string;

  items:OrderItem[];

};





export default function KitchenPage(){


const [orders,setOrders] =
useState<Order[]>([]);



const loadOrders = async()=>{


try{


const response =
await fetch("/api/orders");



const data =
await response.json();



if(response.ok){

setOrders(data);

}



}catch(error){

console.error(
"LOAD KITCHEN ERROR",
error
);

}


};







useEffect(()=>{


loadOrders();



const timer =
setInterval(()=>{

loadOrders();

},3000);



return ()=>clearInterval(timer);



},[]);








const updateStatus = async(

orderId:number,

status:string

)=>{


try{


const response =
await fetch(
"/api/orders",
{

method:"PATCH",

headers:{
"Content-Type":"application/json"
},


body:JSON.stringify({

id:orderId,

status

})


}

);




const data =
await response.json();




if(!response.ok){

alert(
data.error ||
"เปลี่ยนสถานะไม่สำเร็จ"
);

return;

}




setOrders(current=>

current.map(order=>

order.id===orderId

?

{

...order,

status:data.status

}

:

order

)

);




}catch(error){

console.error(error);

}



};







const pending =
orders.filter(
order=>
order.status==="pending"
);



const preparing =
orders.filter(
order=>
order.status==="preparing"
);



const completed =
orders.filter(
order=>
order.status==="completed"
);






return (

<main
className="
min-h-screen
bg-gray-100
p-6
"
>


<h1
className="
mb-6
text-4xl
font-bold
"
>

👨‍🍳 Kitchen Display

</h1>





<div
className="
grid
gap-5
lg:grid-cols-3
"
>





<KitchenColumn

title="🔴 รอทำ"

count={pending.length}

orders={pending}

buttonText="🔥 รับทำ"

nextStatus="preparing"

updateStatus={updateStatus}

/>






<KitchenColumn

title="🟡 กำลังทำ"

count={preparing.length}

orders={preparing}

buttonText="✅ เสร็จแล้ว"

nextStatus="completed"

updateStatus={updateStatus}

/>






<KitchenColumn

title="🟢 เสร็จแล้ว"

count={completed.length}

orders={completed}

updateStatus={updateStatus}

/>



</div>


</main>

);


}









function KitchenColumn({

title,

count,

orders,

buttonText,

nextStatus,

updateStatus

}:any){





return (

<section>


<h2
className="
mb-4
text-2xl
font-bold
"
>

{title} ({count})

</h2>





<div
className="
space-y-4
"
>


{

orders.map(
(order:Order)=>(



<div

key={order.id}

className="
rounded-2xl
bg-white
p-5
shadow
"

>



<div>

<div
className="
text-2xl
font-bold
"
>

{order.order_number}

</div>



<div
className="
text-lg
text-gray-600
"
>

โต๊ะ {order.table_number}

</div>


</div>






<div
className="
mt-4
space-y-3
"
>


{

order.items.map(
(item,index)=>(


<div

key={index}

className="
rounded-xl
bg-gray-50
p-3
"

>


<div
className="
flex
justify-between
font-bold
"
>

<span>

{item.menuName}

</span>


<span>

x{item.quantity}

</span>


</div>




<div
className="
text-gray-600
"
>


{

item.size==="normal"

?

"ธรรมดา"

:

"พิเศษ"

}



{

item.noodle &&
` • ${item.noodle}`

}



{

item.vegetable &&
` • ${item.vegetable}`

}



</div>




{

item.note &&

<div
className="
font-bold
text-red-500
"
>

⚠️ {item.note}

</div>


}



</div>



)


)

}



</div>






{

buttonText &&

<button


onClick={()=>


updateStatus(

order.id,

nextStatus

)


}


className="
mt-5
w-full
rounded-xl
bg-black
py-4
text-xl
font-bold
text-white
"

>


{buttonText}


</button>


}





<div
className="
mt-3
text-sm
text-gray-400
"
>


{

new Date(
order.created_at
)
.toLocaleString(
"th-TH"
)

}


</div>




</div>



)


)


}



</div>



</section>


);


}