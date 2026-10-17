import { NextResponse } from "next/server";
import { pool } from "@/lib/db";


// GET — ดึงวัตถุดิบทั้งหมด
export async function GET() {

  try {

    const result = await pool.query(`
      SELECT
        id,
        name,
        unit,
        cost_per_unit,
        stock,
        created_at
      FROM ingredients
      ORDER BY id
    `);

    return NextResponse.json(result.rows);

  } catch (error: any) {

    console.error("GET INGREDIENTS ERROR", error);

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


// POST — เพิ่มวัตถุดิบ
export async function POST(request: Request) {

  try {

    const body = await request.json();

    const result = await pool.query(
      `
      INSERT INTO ingredients
      (
        name,
        unit,
        cost_per_unit,
        stock
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4
      )
      RETURNING *
      `,
      [
        body.name,
        body.unit,
        body.cost_per_unit ?? 0,
        body.stock ?? 0
      ]
    );

    return NextResponse.json(
      result.rows[0]
    );

  } catch (error: any) {

    console.error("CREATE INGREDIENT ERROR", error);

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


// PATCH — แก้ไขวัตถุดิบ
export async function PATCH(request: Request) {

  try {

    const body = await request.json();

    const result = await pool.query(
      `
      UPDATE ingredients

      SET
        name = $1,
        unit = $2,
        cost_per_unit = $3,
        stock = $4

      WHERE id = $5

      RETURNING *
      `,
      [
        body.name,
        body.unit,
        body.cost_per_unit,
        body.stock,
        body.id
      ]
    );

    return NextResponse.json(
      result.rows[0]
    );

  } catch (error: any) {

    console.error("UPDATE INGREDIENT ERROR", error);

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


// DELETE — ลบวัตถุดิบ
export async function DELETE(request: Request) {

  try {

    const body = await request.json();

    const result = await pool.query(
      `
      DELETE FROM ingredients

      WHERE id = $1

      RETURNING *
      `,
      [body.id]
    );

    return NextResponse.json(
      result.rows[0]
    );

  } catch (error: any) {

    console.error("DELETE INGREDIENT ERROR", error);

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