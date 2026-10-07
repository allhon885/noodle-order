import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(request: Request) {

  try {

    const { searchParams } =
      new URL(request.url);

    const range =
      searchParams.get("range") || "7";


    // =========================
    // กำหนดช่วงวันที่
    // =========================

    let dateCondition = "";

    if (range === "today") {

      dateCondition = `
        DATE(created_at) = CURRENT_DATE
      `;

    }

    else if (range === "30") {

      dateCondition = `
        DATE(created_at)
        >= CURRENT_DATE - INTERVAL '29 days'
        AND DATE(created_at)
        <= CURRENT_DATE
      `;

    }

    else {

      // ค่าเริ่มต้น = 7 วัน
      dateCondition = `
        DATE(created_at)
        >= CURRENT_DATE - INTERVAL '6 days'
        AND DATE(created_at)
        <= CURRENT_DATE
      `;

    }


    // =========================
    // SUMMARY
    // =========================

    const summary = await pool.query(`

      SELECT

        COALESCE(
          SUM(total_amount),
          0
        ) AS today_sales,

        COUNT(*) AS total_orders,

        COALESCE(
          SUM(
            CASE
              WHEN status = 'paid'
              THEN total_amount
              ELSE 0
            END
          ),
          0
        ) AS paid_sales,

        COALESCE(
          SUM(
            CASE
              WHEN status = 'paid'
              AND payment_method = 'cash'
              THEN total_amount
              ELSE 0
            END
          ),
          0
        ) AS cash_sales,

        COALESCE(
          SUM(
            CASE
              WHEN status = 'paid'
              AND payment_method = 'transfer'
              THEN total_amount
              ELSE 0
            END
          ),
          0
        ) AS transfer_sales

      FROM orders

      WHERE ${dateCondition}

      AND status IN (
        'pending',
        'preparing',
        'completed',
        'paid'
      )

    `);


    // =========================
    // TOP 10 MENU
    // =========================

    const topMenu = await pool.query(`

      SELECT

        m.name,

        COALESCE(
          SUM(oi.quantity),
          0
        ) AS total_quantity,

        COALESCE(
          SUM(oi.subtotal),
          0
        ) AS total_sales

      FROM order_items oi

      INNER JOIN orders o
        ON o.id = oi.order_id

      INNER JOIN menu_items m
        ON m.id = oi.menu_item_id

      WHERE ${dateCondition.replace(
        /created_at/g,
        "o.created_at"
      )}

      AND o.status IN (
        'completed',
        'paid'
      )

      GROUP BY m.name

      ORDER BY total_quantity DESC

      LIMIT 10

    `);


    // =========================
    // SALES CHART
    // =========================

    const salesChart = await pool.query(`

      SELECT

        TO_CHAR(
          DATE(created_at),
          'DD/MM'
        ) AS date,

        COALESCE(
          SUM(total_amount),
          0
        ) AS sales

      FROM orders

      WHERE ${dateCondition}

      AND status IN (
        'completed',
        'paid'
      )

      GROUP BY DATE(created_at)

      ORDER BY DATE(created_at)

    `);


    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json({

      summary:
        summary.rows[0],

      topMenu:
        topMenu.rows,

      salesChart:
        salesChart.rows

    });


  } catch (error) {

    console.error(
      "DASHBOARD ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "โหลด Dashboard ไม่สำเร็จ"
      },
      {
        status: 500
      }
    );

  }

}