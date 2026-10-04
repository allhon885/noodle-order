import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;


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

'menuId',oi.menu_item_id,

'menuName',m.name,

'quantity',oi.quantity,

'size',oi.size,

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
AND status NOT IN ('paid', 'cancelled')

ORDER BY id DESC

LIMIT 1


`,
[
tableNumber
]
);


// =================================
// มี Order เดิม → แทนที่รายการเดิม
// ด้วย cart ปัจจุบัน
// =================================

if (oldOrder.rows.length) {

  const orderId =
    oldOrder.rows[0].id;

  // -------------------------------
  // ลบรายการเดิมทั้งหมด
  // -------------------------------

  await client.query(
    `
    DELETE FROM order_items
    WHERE order_id = $1
    `,
    [
      orderId
    ]
  );


  // -------------------------------
  // เพิ่มรายการจาก cart ใหม่
  // -------------------------------

  let newTotal = 0;

  for (const item of cart) {

    const menuId =
      Number(item.menuId);

    const quantity =
      Number(item.quantity);

    if (!menuId || quantity <= 0) {

      throw new Error(
        "ข้อมูลรายการอาหารไม่ถูกต้อง"
      );

    }


    // -------------------------------
    // ดึงราคาเมนูจากฐานข้อมูล
    // -------------------------------

    const menuResult =
      await client.query(
        `
        SELECT
          id,
          name,
          price_normal,
          price_special,
          is_active
        FROM menu_items
        WHERE id = $1
        `,
        [
          menuId
        ]
      );


    if (menuResult.rows.length === 0) {

      throw new Error(
        `ไม่พบเมนู ID ${menuId}`
      );

    }


    const menu =
      menuResult.rows[0];


    if (!menu.is_active) {

      throw new Error(
        `เมนู ${menu.name} ปิดขายแล้ว`
      );

    }


    // -------------------------------
    // ขนาด
    // -------------------------------

    const size =
      item.size === "special"
        ? "special"
        : "normal";


    // -------------------------------
    // ราคา
    // -------------------------------

    let unitPrice =
      size === "special"
        ? Number(menu.price_special)
        : Number(menu.price_normal);


    // ถ้าไม่มีราคาพิเศษ
    // ให้ใช้ราคาธรรมดา

    if (
      size === "special" &&
      (!unitPrice ||
        Number.isNaN(unitPrice))
    ) {

      unitPrice =
        Number(menu.price_normal);

    }


    if (
      !unitPrice ||
      Number.isNaN(unitPrice)
    ) {

      throw new Error(
        `ไม่พบราคาของเมนู ${menu.name}`
      );

    }


    // -------------------------------
    // คำนวณ subtotal
    // -------------------------------

    const subtotal =
      unitPrice * quantity;


    newTotal += subtotal;


    // -------------------------------
    // INSERT รายการใหม่
    // -------------------------------

    await client.query(
      `
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
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9
      )
      `,
      [
        orderId,
        menuId,
        quantity,
        size,
        unitPrice,
        subtotal,
        item.noodle || null,
        item.vegetable || null,
        item.note || null
      ]
    );

  }


  // -------------------------------
  // อัปเดตยอดรวม Order
  // -------------------------------

  const updatedOrder =
    await client.query(
      `
      UPDATE orders

      SET
        total_amount = $1,
        status = 'pending'

      WHERE id = $2

      RETURNING *
      `,
      [
        newTotal,
        orderId
      ]
    );


  await client.query(
    "COMMIT"
  );


  return NextResponse.json({
    success: true,
    message: "เพิ่มรายการสำเร็จ",
    orderId,
    order: updatedOrder.rows[0]
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
  request: Request
) {

  const client = await pool.connect();

  try {

    const body = await request.json();

    const id = body.id || body.orderId;

    if (!id) {

      return NextResponse.json(
        {
          error: "ไม่พบ order id"
        },
        {
          status: 400
        }
      );

    }

    await client.query("BEGIN");


    // =================================
    // ตรวจสอบ Order
    // =================================

    const oldResult = await client.query(
      `
      SELECT *
      FROM orders
      WHERE id = $1
      FOR UPDATE
      `,
      [id]
    );


    if (oldResult.rows.length === 0) {

      throw new Error("ไม่พบ Order");

    }


    const old = oldResult.rows[0];


    // =================================
    // แก้ไขรายการอาหาร
    // =================================

    if (Array.isArray(body.items)) {


      // ห้ามแก้ Order ที่จ่ายเงินแล้ว
      if (
        old.status === "paid" ||
        old.payment_method
      ) {

        await client.query("ROLLBACK");

        return NextResponse.json(
          {
            error: "ออเดอร์นี้ชำระเงินแล้ว ไม่สามารถแก้ไขได้"
          },
          {
            status: 400
          }
        );

      }


      if (body.items.length === 0) {

        await client.query("ROLLBACK");

        return NextResponse.json(
          {
            error: "ออเดอร์ต้องมีอย่างน้อย 1 รายการ"
          },
          {
            status: 400
          }
        );

      }

      // =================================
      // รวมรายการซ้ำก่อนบันทึก
      // =================================

      const mergedItems: any[] = [];

      for (const item of body.items) {

        const menuId = Number(item.menuId);
        const quantity = Number(item.quantity);

        const existingIndex = mergedItems.findIndex(
          x =>
            Number(x.menuId) === menuId &&
            x.size === (item.size === "special" ? "special" : "normal") &&
            (x.noodle ?? null) === (item.noodle ?? null) &&
            (x.vegetable ?? null) === (item.vegetable ?? null) &&
            (x.note ?? null) === (item.note ?? null)
        );

        if (existingIndex !== -1) {

          mergedItems[existingIndex].quantity += quantity;

        } else {

          mergedItems.push({
            menuId,
            quantity,
            size:
              item.size === "special"
                ? "special"
                : "normal",
            noodle: item.noodle ?? null,
            vegetable: item.vegetable ?? null,
            note: item.note ?? null
          });

        }
      }


      // =================================
      // ลบรายการเดิม
      // =================================

      await client.query(
        `
        DELETE FROM order_items
        WHERE order_id = $1
        `,
        [id]
      );


      let total = 0;


      // =================================
      // เพิ่มรายการใหม่
      // =================================

      for (const item of mergedItems) {

        const menuId = Number(item.menuId);
        const quantity = Number(item.quantity);

        if (!menuId || quantity <= 0) {

          throw new Error(
            "ข้อมูลรายการอาหารไม่ถูกต้อง"
          );

        }


        // ---------------------------------
        // ดึงราคาเมนูจากฐานข้อมูล
        // ---------------------------------

        const menuResult = await client.query(
          `
          SELECT
            id,
            name,
            price_normal,
            price_special,
            is_active
          FROM menu_items
          WHERE id = $1
          `,
          [menuId]
        );


        if (menuResult.rows.length === 0) {

          throw new Error(
            `ไม่พบเมนู ID ${menuId}`
          );

        }


        const menu = menuResult.rows[0];


        if (!menu.is_active) {

          throw new Error(
            `เมนู ${menu.name} ปิดขายแล้ว`
          );

        }


        const size =
          item.size === "special"
            ? "special"
            : "normal";


        let unitPrice =
          size === "special"
            ? Number(menu.price_special)
            : Number(menu.price_normal);


        // ถ้าราคาพิเศษไม่มี ให้ใช้ราคาธรรมดา
        if (
          size === "special" &&
          (!unitPrice || Number.isNaN(unitPrice))
        ) {

          unitPrice =
            Number(menu.price_normal);

        }


        if (!unitPrice || Number.isNaN(unitPrice)) {

          throw new Error(
            `ไม่พบราคาของเมนู ${menu.name}`
          );

        }


        const subtotal =
          unitPrice * quantity;


        total += subtotal;


        await client.query(
          `
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
          (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9
          )
          `,
          [
            id,
            menuId,
            quantity,
            size,
            unitPrice,
            subtotal,
            item.noodle || null,
            item.vegetable || null,
            item.note || null
          ]
        );

      }


      // =================================
      // อัปเดตยอดรวม
      // =================================

      const updatedOrder = await client.query(
        `
        UPDATE orders

        SET
          total_amount = $1

        WHERE id = $2

        RETURNING *
        `,
        [
          total,
          id
        ]
      );


      await client.query("COMMIT");


      return NextResponse.json(
        {
          success: true,
          message: "แก้ไขออเดอร์เรียบร้อย",
          order: updatedOrder.rows[0]
        }
      );

    }


    // =================================
    // PAYMENT
    // =================================

    let paymentMethod =
      body.payment_method ??
      old.payment_method ??
      null;


    let cashReceived =
      body.cash_received ??
      old.cash_received ??
      null;


    let changeAmount =
      old.change_amount ??
      null;


    if (
      paymentMethod === "cash" &&
      cashReceived !== null
    ) {

      changeAmount =
        Number(cashReceived) -
        Number(old.total_amount);

    }


    const result = await client.query(
      `
      UPDATE orders

      SET
        status = $1::text,
        payment_method = $2::text,
        cash_received = $3::numeric,
        change_amount = $4::numeric

      WHERE id = $5::integer

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


    // =================================
    // ชำระเงินแล้ว → ปลดโต๊ะ
    // =================================

    if (
      body.status === "paid" ||
      body.status === "cancelled"
    ) {

      await client.query(
        `
        UPDATE restaurant_tables

        SET status = 'available'

        WHERE table_number = $1
        `,
        [
          old.table_number
        ]
      );

    }


    await client.query("COMMIT");


    return NextResponse.json(
      {
        success: true,
        order: result.rows[0]
      }
    );


  } catch (error: any) {


    await client.query("ROLLBACK");


    console.error(
      "PATCH ORDER ERROR",
      error
    );


    return NextResponse.json(
      {
        error:
          error.message ||
          "ไม่สามารถแก้ไขออเดอร์ได้"
      },
      {
        status: 500
      }
    );


  } finally {

    client.release();

  }

}