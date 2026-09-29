"use client";


import {useEffect,useState} from "react";


type Table={

id:number;

table_number:string;

status:string;

}



export default function TablesPage(){


const [tables,setTables]=useState<Table[]>([]);

const [name,setName]=useState("");

const [loading,setLoading]=useState(false);





const loadTables=async()=>{


try{


const res =
await fetch("/api/settings/tables");


const data =
await res.json();



if(res.ok){

setTables(data);

}else{

console.error(data.error);

}


}catch(error){

console.error(error);

}


};






useEffect(()=>{

loadTables();

},[]);







const addTable=async()=>{


if(!name.trim()) return;


setLoading(true);



try{


await fetch(
"/api/settings/tables",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

table_number:name

})

}

);



setName("");

loadTables();



}finally{

setLoading(false);

}


}









const changeStatus=async(
table:Table
)=>{


const newStatus =

table.status==="available"

?

"busy"

:

"available";




await fetch(
"/api/settings/tables",
{

method:"PATCH",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

id:table.id,

status:newStatus

})

}

);



loadTables();


}








const deleteTable=async(id:number)=>{


const confirmDelete =
confirm(
"ต้องการลบโต๊ะนี้หรือไม่?"
);



if(!confirmDelete)
return;




await fetch(
"/api/settings/tables",
{

method:"DELETE",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

id

})

}

);



loadTables();


}









return (

<main
className="
min-h-screen
bg-gray-100
p-6
"
>


<div
className="
mx-auto
max-w-5xl
"
>


<h1
className="
text-3xl
font-bold
"
>

🪑 จัดการโต๊ะ

</h1>






<div
className="
mt-6
rounded-2xl
bg-white
p-6
shadow
"
>


<div
className="
flex
gap-3
"
>


<input

value={name}

onChange={
e=>setName(e.target.value)
}

placeholder="เช่น โต๊ะ 11"

className="
flex-1
rounded-xl
border
p-3
"

/>



<button

disabled={loading}

onClick={addTable}

className="
rounded-xl
bg-orange-500
px-5
font-bold
text-white
"

>

{
loading
?
"กำลังเพิ่ม..."
:
"+ เพิ่มโต๊ะ"
}

</button>


</div>


</div>








<div
className="
mt-6
grid
gap-5
md:grid-cols-3
"
>


{

tables.map(table=>(


<div

key={table.id}

className="
rounded-2xl
bg-white
p-5
shadow
"

>


<h2
className="
text-xl
font-bold
"
>

{table.table_number}

</h2>





<div
className="
mt-2
"
>

สถานะ:


{" "}



{

table.status==="available"


?

<span
className="
font-bold
text-green-600
"
>
🟢 ว่าง
</span>


:

<span
className="
font-bold
text-red-600
"
>
🔴 ไม่ว่าง
</span>


}



</div>







<div
className="
mt-4
flex
gap-2
"
>



<button

onClick={()=>
changeStatus(table)
}

className="
rounded-lg
bg-blue-500
px-3
py-2
text-white
"

>

เปลี่ยนสถานะ

</button>





<button

onClick={()=>
deleteTable(table.id)
}

className="
rounded-lg
bg-red-500
px-3
py-2
text-white
"

>

ลบ

</button>




</div>



</div>


))


}



</div>





</div>


</main>


)


}