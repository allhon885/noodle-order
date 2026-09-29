import { NextResponse } from "next/server";
import { pool } from "@/lib/db";


// GET โต๊ะทั้งหมด
export async function GET(){

try{

const result = await pool.query(
`
SELECT
id,
table_number,
status

FROM restaurant_tables

ORDER BY id
`
);


return NextResponse.json(
result.rows
);


}catch(error:any){

console.error(
"GET TABLE ERROR",
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




// POST เพิ่มโต๊ะ

export async function POST(
request:Request
){

try{


const body =
await request.json();



const result =
await pool.query(
`
INSERT INTO restaurant_tables
(
table_number,
status
)

VALUES
(
$1,
'available'
)

RETURNING *
`,
[
body.table_number
]
);



return NextResponse.json(
result.rows[0]
);



}catch(error:any){

console.error(
"CREATE TABLE ERROR",
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




// PATCH เปลี่ยนสถานะโต๊ะ

export async function PATCH(
request:Request
){

try{


const body =
await request.json();



const result =
await pool.query(
`
UPDATE restaurant_tables

SET status=$1

WHERE id=$2

RETURNING *
`,
[
body.status,
body.id
]
);



return NextResponse.json(
result.rows[0]
);



}catch(error:any){

console.error(
"UPDATE TABLE ERROR",
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

export async function DELETE(
request:Request
){

try{


const body =
await request.json();



const result =
await pool.query(
`
DELETE FROM restaurant_tables

WHERE id=$1

RETURNING *
`,
[
body.id
]
);



return NextResponse.json(
result.rows[0]
);



}catch(error:any){


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