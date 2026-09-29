import { NextResponse } from "next/server";
import { pool } from "@/lib/db";


function formatValue(value:any){

  if(value === null){
    return "NULL";
  }


  if(value instanceof Date){

    return `'${value
      .toISOString()
      .replace("T"," ")
      .substring(0,19)}'`;

  }



  if(typeof value === "string"){

    return `'${value.replace(/'/g,"''")}'`;

  }



  if(typeof value === "boolean"){

    return value
      ? "TRUE"
      : "FALSE";

  }



  return value;

}





export async function GET(){


try{


const tables = [

"shop_settings",

"restaurant_tables",

"menu_items",

"orders",

"order_items"

];





let sql = "";



sql += `

-- ==================================

-- NOODLE POS DATABASE BACKUP

-- Generated ${new Date().toISOString()}

-- ==================================


`;





// ===============================
// ปิด FK ชั่วคราว
// ===============================


sql += `

SET session_replication_role = 'replica';


`;






// ===============================
// Export Table
// ===============================


for(const table of tables){



const result =

await pool.query(

`

SELECT *

FROM ${table}

ORDER BY id

`

);





sql += `

-- ==================================

-- TABLE ${table}

-- ==================================



TRUNCATE TABLE ${table}

RESTART IDENTITY CASCADE;



`;





for(const row of result.rows){



const columns =

Object.keys(row)

.map(

c=>`"${c}"`

)

.join(",");






const values =

Object.values(row)

.map(formatValue)

.join(",");





sql += `

INSERT INTO ${table}

(${columns})

VALUES

(${values});



`;



}



}






// ===============================
// Reset Sequence
// ===============================


sql += `


-- RESET SEQUENCE


SELECT setval(

pg_get_serial_sequence('shop_settings','id'),

COALESCE(MAX(id),1)

)

FROM shop_settings;



SELECT setval(

pg_get_serial_sequence('restaurant_tables','id'),

COALESCE(MAX(id),1)

)

FROM restaurant_tables;



SELECT setval(

pg_get_serial_sequence('menu_items','id'),

COALESCE(MAX(id),1)

)

FROM menu_items;



SELECT setval(

pg_get_serial_sequence('orders','id'),

COALESCE(MAX(id),1)

)

FROM orders;



SELECT setval(

pg_get_serial_sequence('order_items','id'),

COALESCE(MAX(id),1)

)

FROM order_items;



`;






// เปิด FK กลับ


sql += `


SET session_replication_role = 'origin';



`;







const filename =

`noodle-backup-${
new Date()
.toISOString()
.substring(0,10)
}.sql`;







return new NextResponse(

sql,

{

headers:{


"Content-Type":

"application/sql",



"Content-Disposition":

`attachment; filename=${filename}`


}


}

);





}catch(error:any){



console.error(

"BACKUP ERROR",

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