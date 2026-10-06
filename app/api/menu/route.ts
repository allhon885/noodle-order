import { NextResponse } from "next/server";
import { pool } from "@/lib/db";


export async function GET(){

try{


const result = await pool.query(`

SELECT
  id,
  name,
  category,
  description,
  price_normal,
  price_special,
  image_url
FROM menu_items
WHERE is_active = true
ORDER BY id

`);




return NextResponse.json(
result.rows
);



}catch(error:any){


console.error(
"MENU API ERROR",
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