"use client";

import { useEffect, useState } from "react";


type OrderItem = {
  menuName:string;
  quantity:number;
};


type Order = {

  id:number;

  order_number:string;

  table_number:string;

  status:string;

  total_amount:string | number;

  payment_method:string | null;

  cash_received:string | null;

  change_amount:string | null;

  created_at:string;

  items:OrderItem[];

};



export default function PaymentPage(){


const [orders,setOrders] =
useState<Order[]>([]);


const [cashReceived,setCashReceived] =
useState<Record<number,string>>({});


const [loading,setLoading] =
useState<number | null>(null);



const loadOrders = async()=>{

try{

const res =
await fetch("/api/orders");


const data =
await res.json();


if(res.ok){

setOrders(data);

}


}catch(error){

console.error(error);

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





const calculateChange = (
received:number,
total:number
)=>{

return received-total;

};







const updatePayment = async(
order:Order,
method:string
)=>{


let received = 0;


if(method==="cash"){


received =
Number(
cashReceived[order.id]
);



if(!received){

alert(
"กรุณาใส่จำนวนเงิน"
);

return;

}



if(
received <
Number(order.total_amount)
){

alert(
"เงินไม่พอ"
);

return;

}


}





try{


setLoading(order.id);



const res =
await fetch(
"/api/orders",
{

method:"PATCH",

headers:{

"Content-Type":"application/json"

},


body:JSON.stringify({

id:order.id,

status:"paid",

payment_method:method,

cash_received:
method==="cash"
?
received
:
null

})


}

);




const data =
await res.json();




if(!res.ok){

alert(
data.error ||
"ชำระเงินไม่สำเร็จ"
);

return;

}




alert(
"ชำระเงินเรียบร้อย"
);



setCashReceived(
prev=>{

const copy={
...prev
};

delete copy[order.id];

return copy;

}

);



loadOrders();



}catch(error){

console.error(error);

alert(
"ระบบผิดพลาด"
);


}finally{


setLoading(null);


}


};






const paymentOrders =
orders.filter(

order=>

order.status==="completed"

&&

!order.payment_method

);








return (

<main className="
min-h-screen
bg-gray-100
p-6
">


<div className="
max-w-6xl
mx-auto
">


<h1 className="
text-3xl
font-bold
">

💰 ชำระเงิน

</h1>


<p className="
mt-2
text-gray-500
">

รายการที่ทำเสร็จแล้วรอรับเงิน

</p>





{
paymentOrders.length===0

?

<div className="
mt-6
bg-white
rounded-xl
p-10
text-center
shadow
">

<h2 className="
text-xl
font-bold
text-gray-400
">

🎉 ไม่มีรายการรอชำระ

</h2>

</div>


:


<div className="
mt-6
grid
md:grid-cols-2
gap-5
">


{

paymentOrders.map(order=>(


<div
key={order.id}
className="
bg-white
rounded-2xl
shadow
p-5
"
>



<div className="
flex
justify-between
">


<div>

<h2 className="
text-2xl
font-bold
">

{order.order_number}

</h2>


<p className="
text-gray-600
">

โต๊ะ {order.table_number}

</p>


</div>



<div className="
text-right
">


<div className="
text-2xl
font-bold
text-orange-500
">

{Number(order.total_amount).toLocaleString()}

บาท

</div>


<span className="
text-green-600
">

✓ พร้อมชำระ

</span>


</div>



</div>






<div className="
mt-5
space-y-2
">


{

order.items.map(
(item,index)=>(


<div
key={index}
className="
flex
justify-between
bg-gray-50
rounded-lg
p-3
"
>


<b>

{item.menuName}

</b>


<span>

x{item.quantity}

</span>


</div>


)

)


}



</div>






<input

type="number"

placeholder="เงินที่ลูกค้าจ่าย"

value={
cashReceived[order.id] || ""
}

onChange={
e=>

setCashReceived({

...cashReceived,

[order.id]:
e.target.value

})

}

className="
mt-5
w-full
border
rounded-xl
p-3
"

/>






{
cashReceived[order.id]

&&

<div className="
mt-3
bg-green-50
rounded-xl
p-4
text-center
">


<div>
เงินทอน
</div>


<b className="
text-2xl
text-green-600
">

{

calculateChange(

Number(
cashReceived[order.id]
),

Number(
order.total_amount
)

)

}

บาท

</b>


</div>

}







<div className="
mt-5
grid
grid-cols-2
gap-3
">


<button

disabled={loading===order.id}

onClick={()=>updatePayment(order,"cash")}

className="
bg-green-500
text-white
rounded-xl
py-3
font-bold
"

>

💵 เงินสด

</button>





<button

disabled={loading===order.id}

onClick={()=>updatePayment(order,"transfer")}

className="
bg-blue-500
text-white
rounded-xl
py-3
font-bold
"

>

📱 โอนเงิน

</button>



</div>






</div>


))


}



</div>


}



</div>


</main>

);


}