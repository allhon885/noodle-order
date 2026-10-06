import { NextResponse } from "next/server";
import { pool } from "@/lib/db";


export async function GET(){

  try {


    const result = await pool.query(`

      SELECT
        id,
        shop_name,
        phone,
        address,
        receipt_footer

      FROM shop_settings

      LIMIT 1

    `);



    if(result.rows.length === 0){

      return NextResponse.json({

        id:null,
        shop_name:"",
        phone:"",
        address:"",
        receipt_footer:""

      });

    }



    return NextResponse.json(
      result.rows[0]
    );



  } catch(error){


    console.error(
      "SHOP API ERROR:",
      error
    );


    return NextResponse.json(

      {
        error:"โหลดข้อมูลร้านไม่สำเร็จ"
      },

      {
        status:500
      }

    );


  }

}

export async function PATCH(
  request: Request
) {

  try {

    const body = await request.json();

    const {
      shop_name,
      phone,
      address,
      receipt_footer
    } = body;


    // =========================
    // หา ID ของข้อมูลร้าน
    // =========================

    const existing = await pool.query(`
      SELECT id
      FROM shop_settings
      ORDER BY id
      LIMIT 1
    `);


    // =========================
    // ถ้ายังไม่มีข้อมูลร้าน
    // ให้สร้างใหม่
    // =========================

    if (existing.rows.length === 0) {

      const result = await pool.query(`
        INSERT INTO shop_settings (
          shop_name,
          phone,
          address,
          receipt_footer
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      [
        shop_name,
        phone,
        address,
        receipt_footer
      ]);


      return NextResponse.json(
        result.rows[0]
      );

    }


    // =========================
    // มีข้อมูลร้านอยู่แล้ว
    // =========================

    const shopId =
      existing.rows[0].id;


    const result = await pool.query(`
      UPDATE shop_settings

      SET
        shop_name = $1,
        phone = $2,
        address = $3,
        receipt_footer = $4

      WHERE id = $5

      RETURNING *
    `,
    [
      shop_name,
      phone,
      address,
      receipt_footer,
      shopId
    ]);


    return NextResponse.json(
      result.rows[0]
    );


  } catch (error) {

    console.error(
      "UPDATE SHOP ERROR:",
      error
    );


    return NextResponse.json(
      {
        error: "แก้ไขข้อมูลร้านไม่สำเร็จ"
      },
      {
        status: 500
      }
    );

  }

}