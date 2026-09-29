import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import * as XLSX from "xlsx";



export async function GET(
request:Request
){


try{


const {searchParams}=new URL(request.url);


const date =
searchParams.get("date")
||
new Date()
.toISOString()
.substring(0,10);





const result = await pool.query(`

SELECT

o.order_number,

o.table_number,

m.name AS menu_name,

oi.quantity,

oi.unit_price,

oi.subtotal,

o.payment_method,

o.created_at


FROM orders o


JOIN order_items oi

ON o.id = oi.order_id


JOIN menu_items m

ON m.id = oi.menu_item_id



WHERE

o.status='paid'


AND DATE(o.created_at)= $1



ORDER BY o.created_at


`,
[
date
]

);





const summary = await pool.query(`

SELECT


COUNT(*) AS total_orders,


SUM(total_amount) AS total_sales,


SUM(

CASE

WHEN payment_method='cash'

THEN total_amount

ELSE 0

END

) AS cash_sales,



SUM(

CASE

WHEN payment_method='transfer'

THEN total_amount

ELSE 0

END

) AS transfer_sales



FROM orders


WHERE status='paid'


AND DATE(created_at)=$1


`,
[
date
]

);







const rows=[

{

"วันที่":date,

"จำนวนบิล":
summary.rows[0].total_orders,

"ยอดขายรวม":
summary.rows[0].total_sales,

"เงินสด":
summary.rows[0].cash_sales,

"โอน":
summary.rows[0].transfer_sales

},


{},


...result.rows.map(item=>(

{

"เลขบิล":
item.order_number,

"โต๊ะ":
item.table_number,

"เมนู":
item.menu_name,

"จำนวน":
item.quantity,

"ราคา":
item.unit_price,

"รวม":
item.subtotal,

"ชำระ":
item.payment_method==="cash"
?
"เงินสด"
:
"โอนเงิน",

"เวลา":
new Date(item.created_at)
.toLocaleString("th-TH")

}

))

];





const worksheet =
XLSX.utils.json_to_sheet(rows);



const workbook =
XLSX.utils.book_new();



XLSX.utils.book_append_sheet(

workbook,

worksheet,

"Daily Sales"

);




const buffer =
XLSX.write(

workbook,

{
type:"buffer",
bookType:"xlsx"
}

);





return new NextResponse(

buffer,

{

headers:{


"Content-Type":

"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",


"Content-Disposition":

`attachment; filename=daily-sales-${date}.xlsx`

}

}

);



}catch(error:any){


console.error(error);


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