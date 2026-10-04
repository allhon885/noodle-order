import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(
  request: Request
) {
  try {

    const { searchParams } =
      new URL(request.url);

    const table =
      searchParams.get("table");

    if (!table) {
      return NextResponse.json(
        {
          error: "missing table"
        },
        {
          status: 400
        }
      );
    }

    // =====================================
    // หา Order ปัจจุบันของโต๊ะ
    // ไม่เอา paid และ cancelled
    // =====================================

    const orderResult =
      await pool.query(
        `
        SELECT *
        FROM orders
        WHERE table_number = $1
        AND status NOT IN ('paid', 'cancelled')
        ORDER BY id DESC
        LIMIT 1
        `,
        [table]
      );

    // =====================================
    // ไม่มี Order ปัจจุบัน
    // =====================================

    if (orderResult.rows.length === 0) {

      return NextResponse.json({
        order: null,
        items: []
      });

    }

    const order =
      orderResult.rows[0];

    // =====================================
    // ดึงรายการอาหารของ Order
    // =====================================

    const itemsResult =
      await pool.query(
        `
        SELECT
          oi.id,
          oi.menu_item_id,
          oi.quantity,
          oi.size,
          oi.unit_price,
          oi.subtotal,
          oi.note,
          oi.noodle,
          oi.vegetable,
          m.name
        FROM order_items oi
        LEFT JOIN menu_items m
          ON m.id = oi.menu_item_id
        WHERE oi.order_id = $1
        `,
        [order.id]
      );

    return NextResponse.json({
      order,
      items: itemsResult.rows
    });

  } catch (error: any) {

    console.error(error);

    return NextResponse.json(
      {
        error: error.message
      },
      {
        status: 500
      }
    );

  }
}