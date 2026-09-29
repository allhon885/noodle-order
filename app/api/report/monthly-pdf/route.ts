import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import PDFDocument from "pdfkit";
import path from "path";


export async function GET(
request: Request
){

try{


const {searchParams} =
new URL(request.url);


const month =
searchParams.get("month")
||
new Date()
.toISOString()
.substring(0,7);



// ===============================
// SHOP
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

}catch{}





// ===============================
// DAILY SALES
// ===============================

const daily =
await pool.query(`


SELECT

DATE(created_at) AS sale_date,

COUNT(*) AS bills,

SUM(total_amount) AS total


FROM orders


WHERE

status='paid'

AND TO_CHAR(created_at,'YYYY-MM')=$1


GROUP BY DATE(created_at)


ORDER BY DATE(created_at)


`,
[
month
]
);






// ===============================
// SUMMARY
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


AND TO_CHAR(created_at,'YYYY-MM')=$1


`,
[
month
]
);


const summary =
summaryResult.rows[0];







// ===============================
// CREATE PDF
// ===============================


const doc =
new PDFDocument({

size:"A4",

margin:50

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
(chunk)=>chunks.push(chunk)
);





// HEADER


doc.fontSize(22)

.text(

shopName,

{
align:"center"
}

);



doc.moveDown(0.5);



doc.fontSize(16)

.text(

"รายงานยอดขายประจำเดือน",

{
align:"center"
}

);



doc.fontSize(12)

.text(

`เดือน ${month}`,

{
align:"center"
}

);



doc.moveDown(2);





// SUMMARY


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




doc.moveDown(2);




// TABLE


doc.fontSize(14)

.text(
"ยอดขายรายวัน"
);


doc.moveDown();



const xDate = 60;
const xBill = 260;
const xMoney = 420;


let tableY = doc.y;



doc.fontSize(12);


doc.text(
"วันที่",
xDate,
tableY
);


doc.text(
"จำนวนบิล",
xBill,
tableY
);


doc.text(
"ยอดขาย",
xMoney,
tableY
);



doc.moveDown(0.5);



doc.moveTo(
50,
doc.y
)
.lineTo(
520,
doc.y
)
.stroke();



doc.moveDown(0.5);





let totalBills = 0;

let totalSales = 0;




daily.rows.forEach(row=>{


const date =

new Date(row.sale_date)

.toLocaleDateString(
"th-TH"
);



const bills =
Number(row.bills);



const total =
Number(row.total);



totalBills += bills;

totalSales += total;



const y = doc.y;



doc.text(
date,
xDate,
y
);



doc.text(
String(bills),
xBill,
y
);



doc.text(
total.toLocaleString(),
xMoney,
y
);



doc.moveDown(1);



});





// TOTAL LINE


doc.moveTo(
50,
doc.y
)
.lineTo(
520,
doc.y
)
.stroke();



doc.moveDown(0.5);



doc.fontSize(12)

.text(

`รวมทั้งหมด ${totalBills} บิล     ${totalSales.toLocaleString()} บาท`

);






// FOOTER


doc.fontSize(10)

.text(

"ขอบคุณที่ใช้บริการ ❤️",

50,

760,

{
align:"center"
}

);






doc.end();





const pdf =
await new Promise<Buffer>((resolve)=>{


doc.on(

"end",

()=>{

resolve(
Buffer.concat(chunks)
);

}

);


});







return new NextResponse(

new Uint8Array(pdf),

{

headers:{

"Content-Type":

"application/pdf",


"Content-Disposition":

`inline; filename=monthly-report-${month}.pdf`

}

}

);




}catch(error:any){


console.error(
"MONTHLY PDF ERROR",
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