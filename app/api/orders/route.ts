import { NextResponse } from "next/server";
import { pool } from "@/lib/db";



// ===============================
// GET ORDERS
// ===============================

export async function GET(){

try{


const result = await pool.query(`

SELECT

o.id,
o.order_number,
o.table_number,
o.status,
o.total_amount,
o.payment_method,
o.cash_received,
o.change_amount,
o.created_at,


COALESCE(

json_agg(

json_build_object(

'menuName',m.name,

'quantity',oi.quantity,

'unitPrice',oi.unit_price,

'subtotal',oi.subtotal,

'noodle',oi.noodle,

'vegetable',oi.vegetable,

'note',oi.note

)

)

FILTER(
WHERE oi.id IS NOT NULL
),

'[]'

) AS items


FROM orders o


LEFT JOIN order_items oi

ON o.id = oi.order_id


LEFT JOIN menu_items m

ON m.id = oi.menu_item_id


GROUP BY o.id


ORDER BY o.created_at DESC


`);



const orders =
result.rows.map(order=>({

...order,

items:
typeof order.items==="string"
?
JSON.parse(order.items)
:
order.items


}));



return NextResponse.json(
orders
);



}catch(error:any){


console.error(
"GET ORDERS ERROR",
error
);


return NextResponse.json(
{
error:error.message
},
{
status:500
}
);


}

}









// ===============================
// CREATE / ADD ORDER
// ===============================

export async function POST(
request:Request
){


const client =
await pool.connect();



try{


const body =
await request.json();



const tableNumber =
body.tableNumber;


const cart =
body.cart;



if(!tableNumber){

return NextResponse.json(
{
error:"กรุณาเลือกโต๊ะ"
},
{
status:400
}
);

}



if(!cart || cart.length===0){

return NextResponse.json(
{
error:"ไม่มีรายการอาหาร"
},
{
status:400
}
);

}




await client.query("BEGIN");





const total =

cart.reduce(
(sum:number,item:any)=>

sum +

(
Number(item.unitPrice)
*
Number(item.quantity)
)

,0);






// =================================
// เช็กโต๊ะเดิมก่อน
// =================================


const oldOrder = await client.query(`

SELECT *

FROM orders

WHERE table_number=$1

AND status!='paid'

ORDER BY id DESC

LIMIT 1


`,
[
tableNumber
]
);






// =================================
// มี order เดิม -> เพิ่มรายการ
// =================================

if(oldOrder.rows.length){


const orderId =
oldOrder.rows[0].id;



for(const item of cart){



await client.query(`

INSERT INTO order_items

(
order_id,
menu_item_id,
quantity,
size,
unit_price,
subtotal,
noodle,
vegetable,
note
)


VALUES

($1,$2,$3,$4,$5,$6,$7,$8,$9)


`,
[

orderId,

item.menuId,

item.quantity,

item.size || "normal",

item.unitPrice,

Number(item.unitPrice)
*
Number(item.quantity),

item.noodle || null,

item.vegetable || null,

item.note || null

]


);


}





await client.query(`

UPDATE orders

SET total_amount =
total_amount + $1


WHERE id=$2


`,
[
total,
orderId
]

);




await client.query("COMMIT");




return NextResponse.json({

success:true,

message:"เพิ่มรายการสำเร็จ",

orderId

});


}








// =================================
// สร้าง order ใหม่
// =================================


const last =

await client.query(`

SELECT order_number

FROM orders

ORDER BY id DESC

LIMIT 1

`);




let number = 1;


if(last.rows.length){


number =

parseInt(

last.rows[0].order_number.replace("ORD-","")

)

+1;


}



const orderNumber =

"ORD-" +

String(number).padStart(4,"0");








const orderResult =

await client.query(`

INSERT INTO orders

(
order_number,
table_number,
status,
total_amount
)


VALUES

($1,$2,'pending',$3)


RETURNING *


`,
[

orderNumber,

tableNumber,

total

]

);





const orderId =

orderResult.rows[0].id;







for(const item of cart){



await client.query(`

INSERT INTO order_items

(

order_id,

menu_item_id,

quantity,

size,

unit_price,

subtotal,

noodle,

vegetable,

note

)


VALUES

($1,$2,$3,$4,$5,$6,$7,$8,$9)


`,
[

orderId,

item.menuId,

item.quantity,

item.size || "normal",

item.unitPrice,

Number(item.unitPrice)
*
Number(item.quantity),

item.noodle || null,

item.vegetable || null,

item.note || null

]


);


}







await client.query(`

UPDATE restaurant_tables

SET status='busy'


WHERE table_number=$1


`,
[
tableNumber
]

);





await client.query("COMMIT");





return NextResponse.json({

success:true,

order:orderResult.rows[0]

});





}catch(error:any){



await client.query("ROLLBACK");



console.error(
"CREATE ORDER ERROR",
error
);



return NextResponse.json(

{
error:error.message
},

{
status:500
}

);



}

finally{


client.release();


}

}











// ===============================
// PATCH UPDATE ORDER
// ===============================


export async function PATCH(
request:Request
){


const client =
await pool.connect();



try{


const body =
await request.json();



const id =
body.id ||
body.orderId;



if(!id){

return NextResponse.json(
{
error:"ไม่พบ order id"
},
{
status:400
}
);

}



await client.query("BEGIN");





const oldResult =

await client.query(`

SELECT *

FROM orders

WHERE id=$1


`,
[
id
]

);




if(oldResult.rows.length===0){

throw new Error(
"ไม่พบ Order"
);

}



const old =
oldResult.rows[0];






let paymentMethod =

body.payment_method
||
old.payment_method;



let cashReceived =

body.cash_received
??
old.cash_received;




let changeAmount =

old.change_amount;






if(

paymentMethod==="cash"

&&

cashReceived

){

changeAmount =

Number(cashReceived)

-

Number(old.total_amount);


}






const result =

await client.query(`

UPDATE orders

SET

status=$1,

payment_method=$2,

cash_received=$3,

change_amount=$4


WHERE id=$5


RETURNING *


`,
[

body.status,

paymentMethod,

cashReceived,

changeAmount,

id

]

);







if(body.status==="paid"){



await client.query(`

UPDATE restaurant_tables

SET status='available'

WHERE table_number=$1


`,
[
old.table_number
]

);



}







await client.query("COMMIT");




return NextResponse.json(

result.rows[0]

);





}catch(error:any){



await client.query("ROLLBACK");



console.error(

"PATCH ORDER ERROR",

error

);



return NextResponse.json(

{
error:error.message
},

{
status:500
}

);



}

finally{


client.release();


}



}