import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import PDFDocument from "pdfkit";
import path from "path";
import { Buffer } from "buffer";


export async function GET(
request: Request
){

try{


const {searchParams} =
new URL(request.url);



const date =
searchParams.get("date")
||
new Date()
.toISOString()
.substring(0,10);





// ===============================
// ดึงข้อมูลร้าน
// ===============================

let shopName = "NOODLE POS";


try{


const shop =
await pool.query(`

SELECT shop_name

FROM shop_settings

LIMIT 1

`);


if(shop.rows.length){

shopName =
shop.rows[0].shop_name;

}


}catch(e){

console.log(
"ไม่มีข้อมูลร้าน"
);

}








// ===============================
// ดึงรายการขาย
// ===============================


const ordersResult =

await pool.query(`


SELECT


o.order_number,

o.table_number,

o.total_amount,

o.payment_method


FROM orders o


WHERE

o.status='paid'


AND DATE(o.created_at)=$1


ORDER BY o.id



`,
[
date
]

);



const orders =
ordersResult.rows;








// ===============================
// สรุปยอด
// ===============================


const summaryResult =

await pool.query(`


SELECT


COUNT(*) AS bills,


COALESCE(
SUM(total_amount),
0
) AS total,



COALESCE(

SUM(

CASE

WHEN payment_method='cash'

THEN total_amount

ELSE 0

END

),

0

) AS cash,




COALESCE(

SUM(

CASE

WHEN payment_method='transfer'

THEN total_amount

ELSE 0

END

),

0

) AS transfer



FROM orders



WHERE

status='paid'


AND DATE(created_at)=$1



`,
[
date
]

);



const summary =
summaryResult.rows[0];








// ===============================
// สร้าง PDF
// ===============================


const doc =
new PDFDocument({

size:"A4",

margin:40

});





doc.font(

path.join(

process.cwd(),

"public/fonts/NotoSansThai-Regular.ttf"

)

);






const chunks:Buffer[]=[];



doc.on(
"data",
(chunk)=>{

chunks.push(chunk);

}

);





doc.fontSize(22)

.text(

shopName,

{
align:"center"
}

);



doc.moveDown();



doc.fontSize(16)

.text(

"รายงานยอดขายประจำวัน",

{
align:"center"
}

);



doc.fontSize(12)

.text(

`วันที่ ${date}`

);



doc.moveDown();





doc.fontSize(14)

.text(
"สรุปยอดขาย"
);



doc.fontSize(12);



doc.text(

`จำนวนบิล : ${summary.bills} ใบ`

);



doc.text(

`ยอดขายรวม : ${Number(summary.total).toLocaleString()} บาท`

);



doc.text(

`เงินสด : ${Number(summary.cash).toLocaleString()} บาท`

);



doc.text(

`โอนเงิน : ${Number(summary.transfer).toLocaleString()} บาท`

);






doc.moveDown();



doc.fontSize(14)

.text(
"รายละเอียดบิล"
);



doc.moveDown();






if(orders.length===0){


doc.fontSize(12)

.text(
"ไม่มีรายการขาย"
);


}else{



orders.forEach(order=>{


doc.fontSize(12)

.text(

`${order.order_number}

โต๊ะ ${order.table_number}

${Number(order.total_amount).toLocaleString()} บาท

${
order.payment_method==="cash"
?
"เงินสด"
:
"โอนเงิน"
}


`

);


doc.moveDown();


});


}






// จบ PDF

doc.end();






const pdfPromise =
new Promise<Buffer>((resolve)=>{

doc.on(
"end",
()=>{

resolve(
Buffer.concat(chunks)
);

}

);

});


doc.end();


const pdf =
await pdfPromise;





return new NextResponse(
new Uint8Array(pdf),

{

headers:{

"Content-Type":

"application/pdf",



"Content-Disposition":

`inline; filename=daily-report-${date}.pdf`

}


}

);






}catch(error:any){



console.error(
"DAILY PDF ERROR:",
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