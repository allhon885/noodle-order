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
){

  try {


    const body = await request.json();


    const {
      shop_name,
      phone,
      address,
      receipt_footer
    } = body;



    const result = await pool.query(`

      UPDATE shop_settings

      SET
        shop_name=$1,
        phone=$2,
        address=$3,
        receipt_footer=$4,
        updated_at=NOW()

      WHERE id = 1

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



  }catch(error){

    console.error(
      "UPDATE SHOP ERROR",
      error
    );


    return NextResponse.json(
      {
        error:"แก้ไขข้อมูลร้านไม่สำเร็จ"
      },
      {
        status:500
      }
    );

  }

}