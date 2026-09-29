import { NextResponse } from "next/server";
import { pool } from "@/lib/db";


// =====================
// GET ALL MENU
// =====================
export async function GET() {

  try {

    const result = await pool.query(`

      SELECT
        id,
        name,
        category,
        description,
        price_normal,
        price_special,
        is_active,
        created_at

      FROM public.menu_items

      ORDER BY id ASC

    `);


    return NextResponse.json(result.rows);


  } catch(error) {

    console.error(error);


    return NextResponse.json(
      {
        error:"ไม่สามารถดึงข้อมูลเมนูได้"
      },
      {
        status:500
      }
    );

  }

}





// =====================
// CREATE MENU
// =====================
export async function POST(
  request:Request
) {

  try {


    const body = await request.json();


    const {
      name,
      category,
      description,
      priceNormal,
      priceSpecial
    } = body;



    if(
      !name ||
      !category ||
      !priceNormal
    ){

      return NextResponse.json(
        {
          error:"ข้อมูลเมนูไม่ครบ"
        },
        {
          status:400
        }
      );

    }



    const result =
      await pool.query(

      `
      INSERT INTO public.menu_items
      (
        name,
        category,
        description,
        price_normal,
        price_special,
        is_active
      )

      VALUES
      ($1,$2,$3,$4,$5,true)

      RETURNING *
      `,

      [
        name,
        category,
        description ?? null,
        priceNormal,
        priceSpecial ?? null
      ]

    );



    return NextResponse.json({

      success:true,

      menu:result.rows[0]

    });



  } catch(error){


    console.error(error);


    return NextResponse.json(
      {
        error:"ไม่สามารถเพิ่มเมนูได้"
      },
      {
        status:500
      }
    );

  }

}






// =====================
// UPDATE MENU
// =====================
export async function PATCH(
  request:Request
){

  try{


    const body =
      await request.json();


    const {
      id,
      name,
      category,
      description,
      priceNormal,
      priceSpecial,
      isActive

    } = body;



    if(!id){

      return NextResponse.json(
        {
          error:"ไม่พบ id เมนู"
        },
        {
          status:400
        }
      );

    }



    const result =
      await pool.query(

      `
      UPDATE public.menu_items

      SET

        name =
          COALESCE($1,name),

        category =
          COALESCE($2,category),

        description =
          COALESCE($3,description),

        price_normal =
          COALESCE($4,price_normal),

        price_special =
          COALESCE($5,price_special),

        is_active =
          COALESCE($6,is_active)


      WHERE id=$7

      RETURNING *

      `,

      [
        name,
        category,
        description,
        priceNormal,
        priceSpecial,
        isActive,
        id
      ]

    );



    if(result.rowCount===0){

      return NextResponse.json(
        {
          error:"ไม่พบเมนู"
        },
        {
          status:404
        }
      );

    }



    return NextResponse.json({

      success:true,

      menu:result.rows[0]

    });



  }catch(error){


    console.error(error);


    return NextResponse.json(
      {
        error:"ไม่สามารถแก้ไขเมนูได้"
      },
      {
        status:500
      }
    );

  }

}






// =====================
// DELETE MENU
// =====================
export async function DELETE(
  request:Request
){

  try{


    const body =
      await request.json();


    const id =
      Number(body.id);



    if(!id){

      return NextResponse.json(
        {
          error:"ไม่พบ id เมนู"
        },
        {
          status:400
        }
      );

    }



    const result =
      await pool.query(

      `
      DELETE FROM public.menu_items

      WHERE id=$1

      RETURNING *

      `,

      [id]

    );



    if(result.rowCount===0){

      return NextResponse.json(
        {
          error:"ไม่พบเมนู"
        },
        {
          status:404
        }
      );

    }



    return NextResponse.json({

      success:true,

      menu:result.rows[0]

    });



  }catch(error){


    console.error(error);


    return NextResponse.json(
      {
        error:"ไม่สามารถลบเมนูได้"
      },
      {
        status:500
      }
    );

  }

}