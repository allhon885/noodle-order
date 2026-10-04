"use client";

import { useEffect, useState } from "react";


type MenuItem = {

  id:number;

  name:string;

  category:string;

  description:string | null;

  price_normal:string | number;

  price_special:string | number | null;

};



type Table = {

  id:number;

  table_number:string;

  status:string;

};



type CartItem = {

  menuId:number;

  menuName:string;

  category:string;

  quantity:number;

  price:number;

  size:string;

  noodle:string;

  vegetable:string;

  note:string | null;

};



export default function Home(){


const [menus,setMenus] =
useState<MenuItem[]>([]);


const [categories,setCategories] = useState<string[]>([]);

const [tables,setTables] =
useState<Table[]>([]);



const [selectedTable,setSelectedTable] =
useState("");


const [editingOrderId, setEditingOrderId] =
useState<number | null>(null);

const [selectedCategory,setSelectedCategory] =
useState("ก๋วยเตี๋ยว");



const [cart,setCart] =
useState<CartItem[]>([]);



const [size,setSize] =
useState("normal");


const [noodle,setNoodle] =
useState("");



const [vegetable,setVegetable] =
useState("ปกติ");



const [loading,setLoading] =
useState(false);






// โหลดเมนูและโต๊ะ

useEffect(()=>{


const loadData = async()=>{


try{


const menuRes =
await fetch("/api/menu");


const menuData = await menuRes.json();

setMenus(menuData);


const categoryList = [
  ...new Set(
    menuData.map(
      (item:MenuItem)=>item.category
    )
  )
];


const cats: string[] = Array.from(
  new Set(
    menuData.map(
      (item: MenuItem) => item.category
    )
  )
);

setCategories(cats);



const tableRes =
await fetch("/api/settings/tables");


const tableData =
await tableRes.json();


setTables(tableData);



}catch(error){

console.error(error);

}


};


loadData();


},[]);



// โหลดบิลเดิมเมื่อเลือกโต๊ะ

useEffect(()=>{


if(!selectedTable) return;



const loadCurrent = async()=>{


try{


const res = await fetch(

`/api/orders/current?table=${selectedTable}`

);



const data = await res.json();

if(data.id){
  setEditingOrderId(Number(data.id));
}else{
  setEditingOrderId(null);
}

if(data.items?.length){


setCart(

data.items.map((item:any)=>({

menuId:item.menu_item_id,

menuName:item.name,

category:item.category || "",

quantity:Number(item.quantity),

price:Number(item.unit_price),

size:item.size || "normal",

noodle:item.noodle || "",

vegetable:item.vegetable || "ปกติ",

note:item.note || null

}))

);


}else{


setCart([]);


}



}catch(error){

console.error(error);

}


};


loadCurrent();


},[selectedTable]);



// กรองเมนู

const currentMenus = menus.filter(item => {
  return item.category === selectedCategory;
});

// =====================
// ADD MENU
// =====================

const addMenu = (item:MenuItem)=>{


const isDrink =
item.category.includes("เครื่อง");



const price =

isDrink

?

Number(item.price_normal)

:

size==="special"

?

Number(item.price_special || item.price_normal)

:

Number(item.price_normal);



const existing = cart.find(c=>

c.menuId===item.id &&

c.size===size &&

c.noodle===noodle &&

c.vegetable===vegetable &&

c.price===price

);



if(existing){


setCart(

cart.map(c=>

c===existing

?

{

...c,

quantity:c.quantity+1

}

:

c

)

);


return;

}



setCart([

...cart,

{

menuId:item.id,

menuName:item.name,

category:item.category,

quantity:1,

price,

size:isDrink ? "normal" : size,

noodle:isDrink ? "" : noodle,

vegetable:isDrink ? "" : vegetable,

note:null

}

]);


};




// =====================
// CHANGE QTY
// =====================

const changeQty = (

index:number,

value:number

)=>{


const newCart=[...cart];


newCart[index].quantity += value;



if(newCart[index].quantity<=0){

newCart.splice(index,1);

}



setCart(newCart);


};





// =====================
// TOTAL
// =====================

const total = cart.reduce(

(sum,item)=>

sum + (item.price * item.quantity)

,0);






// =====================
// SUBMIT ORDER
// =====================

const submitOrder = async()=>{


if(!selectedTable){

alert("กรุณาเลือกโต๊ะ");

return;

}



if(cart.length===0){

alert("ยังไม่มีรายการ");

return;

}



try{


setLoading(true);



const isEditing = editingOrderId !== null;

const response = await fetch(
  "/api/orders",
  {
    method: isEditing ? "PATCH" : "POST",

    headers:{
      "Content-Type":"application/json"
    },

    body: JSON.stringify(
      isEditing
        ? {
            id: editingOrderId,

            items: cart.map(item=>({
              menuId:item.menuId,
              quantity:item.quantity,
              size:item.size,
              noodle:item.noodle,
              vegetable:item.vegetable,
              note:item.note
            }))
          }
        : {
            tableNumber:selectedTable,

            cart:cart.map(item=>({
              menuId:item.menuId,
              quantity:item.quantity,
              unitPrice:item.price,
              size:item.size,
              noodle:item.noodle,
              vegetable:item.vegetable,
              note:item.note
            }))
          }
    )
  }
);



const data = await response.json();



if(!response.ok){

alert(data.error || "ส่งออเดอร์ไม่สำเร็จ");

return;

}



alert("✅ ส่งออเดอร์เข้าครัวแล้ว");


// ล้างเฉพาะรายการ
// โต๊ะยังอยู่ เพื่อสั่งเพิ่ม

setCart([]);

setEditingOrderId(null);

setNoodle("");

setVegetable("ปกติ");



}catch(error){


console.error(error);


}finally{


setLoading(false);


}


};

return (

<main
className="
min-h-screen
bg-gray-100
p-5
"
>

<div
className="
max-w-7xl
mx-auto
"
>


<h1
className="
text-3xl
font-bold
mb-5
"
>
🍜 รับออเดอร์
</h1>


<div
className="
grid
lg:grid-cols-3
gap-5
"
>


<div
className="
lg:col-span-2
space-y-5
"
>


<div
className="
bg-white
rounded-2xl
p-5
shadow
"
>


<h2
className="
text-xl
font-bold
mb-4
"
>
🪑 เลือกโต๊ะ
</h2>


<div
className="
grid
grid-cols-3
md:grid-cols-6
gap-3
"
>


{

tables.map(table=>(

<button

key={table.id}

onClick={()=>setSelectedTable(table.table_number)}

className={`

rounded-xl

py-4

font-bold


${
selectedTable===table.table_number

?

"bg-orange-500 text-white"

:

table.status==="busy"

?

"bg-red-100 text-red-600"

:

"bg-green-100 text-green-700"

}

`}

>


{table.status==="busy" ? "🔴" : "🟢"}

{table.table_number}


</button>

))

}


</div>


</div>




<div
className="
bg-white
rounded-2xl
p-5
shadow
"
>


<h2
className="
text-xl
font-bold
mb-4
"
>
📋 หมวดเมนู
</h2>


<div
className="
flex
gap-3
overflow-x-auto
"
>


{

categories.map(cat=>(


<button

key={cat}

onClick={()=>{

setSelectedCategory(cat);

if(cat!=="ก๋วยเตี๋ยว"){

setNoodle("");

}

}}


className={`

px-5

py-3

rounded-xl

font-bold

whitespace-nowrap


${
selectedCategory===cat

?

"bg-orange-500 text-white"

:

"bg-gray-200"

}

`}

>


{cat}


</button>


))


}


</div>


</div>


</div>

{/* OPTION */}

{
(
selectedCategory==="ก๋วยเตี๋ยว" ||
selectedCategory==="เกาเหลา"
)
&&

<div
className="
bg-white
rounded-2xl
p-5
shadow
"
>


<h2
className="
text-xl
font-bold
mb-4
"
>
⚙️ ตัวเลือก
</h2>



{/* SIZE */}

<div
className="
flex
gap-3
mb-4
"
>


<button

onClick={()=>setSize("normal")}

className={

size==="normal"

?

"bg-green-500 text-white px-4 py-3 rounded-xl"

:

"bg-gray-200 px-4 py-3 rounded-xl"

}

>

ธรรมดา

</button>



<button

onClick={()=>setSize("special")}

className={

size==="special"

?

"bg-green-500 text-white px-4 py-3 rounded-xl"

:

"bg-gray-200 px-4 py-3 rounded-xl"

}

>

พิเศษ

</button>


</div>





{/* NOODLE เฉพาะก๋วยเตี๋ยว */}

{

selectedCategory==="ก๋วยเตี๋ยว"

&&

<>

<h3
className="
font-bold
mb-2
"
>
เลือกเส้น
</h3>


<div
className="
flex
gap-2
flex-wrap
mb-4
"
>


{

[
"เส้นเล็ก",
"เส้นหมี่ขาว",
"เส้นใหญ่",
"บะหมี่",
"มาม่า",
"วุ้นเส้น",
]

.map(x=>(


<button

key={x}

onClick={()=>setNoodle(x)}

className={

noodle===x

?

"bg-orange-500 text-white px-4 py-3 rounded-xl"

:

"bg-gray-200 px-4 py-3 rounded-xl"

}

>

{x}

</button>


))


}


</div>

</>

}





{/* VEGETABLE */}

<h3
className="
font-bold
mb-2
"
>
ผัก
</h3>


<div
className="
flex
gap-2
"
>


{

[
"ปกติ",
"ไม่ผัก",
"เพิ่มผัก"
]

.map(x=>(


<button

key={x}

onClick={()=>setVegetable(x)}

className={

vegetable===x

?

"bg-orange-500 text-white px-4 py-3 rounded-xl"

:

"bg-gray-200 px-4 py-3 rounded-xl"

}

>

{x}

</button>


))


}


</div>



</div>

}

{/* MENU LIST */}
<div
className="
bg-white
rounded-2xl
p-5
shadow
mt-4
"
>

<h2
className="
text-xl
font-bold
mb-4
"
>
🍜 รายการอาหาร
</h2>


<div
className="
grid
grid-cols-2
gap-3
"
>

{
currentMenus.map((item)=>(
<button

key={item.id}

onClick={()=>addMenu(item)}

className="
p-4
rounded-xl
bg-orange-100
hover:bg-orange-200
text-left
font-bold
"

>

<div>
{item.name}
</div>


<div
className="
text-sm
text-gray-600
mt-1
"
>
{
size==="special"
?
Number(item.price_special || item.price_normal)
:
Number(item.price_normal)
}
บาท
</div>


</button>
))

}

</div>

</div>


<div
className="
bg-white
rounded-2xl
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
🛒 รายการ
</h2>
{

cart.map((item,index)=>(

<div
key={index}
className="
border-b
pb-3
mb-3
"
>

<div className="font-bold">
{item.menuName}
</div>

<div className="font-bold">
{item.menuName}
</div>

<div className="text-sm text-gray-600">

{item.size==="special" && (
<div>
⭐ พิเศษ
</div>
)}

{item.size==="normal" && (
<div>
⭐ ธรรมดา
</div>
)}

{item.noodle && (
<div>
🍜 {item.noodle}
</div>
)}

<div>
🥬 {item.vegetable}
</div>

<input

value={item.note || ""}

onChange={(e)=>{

const newCart=[...cart];

newCart[index].note=e.target.value;

setCart(newCart);

}}

placeholder="📝 หมายเหตุ"

className="
mt-2
w-full
border
rounded-lg
px-3
py-2
text-sm
"

/>

{item.note && (
<div>
📝 {item.note}
</div>
)}


</div>


<div className="mt-2">
{item.price} บาท
</div>


<div
className="
flex
items-center
gap-3
mt-2
"
>

<button
onClick={()=>changeQty(index,-1)}
className="
bg-red-100
px-3
py-1
rounded-lg
"
>
-
</button>


<span>
{item.quantity}
</span>


<button
onClick={()=>changeQty(index,1)}
className="
bg-green-100
px-3
py-1
rounded-lg
"
>
+
</button>

<button

onClick={()=>{

const newCart=[...cart];

newCart.splice(index,1);

setCart(newCart);

}}

className="
bg-red-100
px-3
py-1
rounded-lg
"
>
🗑
</button>


</div>


</div>

))
}

<div
className="
border-t
mt-4
pt-4
font-bold
text-xl
"
>
รวม {total} บาท

<div
className="
border-t
mt-4
pt-4
font-bold
"
>

<div>
จำนวน {cart.length} รายการ
</div>


<div
className="
text-xl
mt-2
"
>
รวม {total} บาท
</div>


</div>

<button

onClick={()=>setCart([])}

className="
mt-4
w-full
bg-red-100
text-red-600
py-3
rounded-xl
font-bold
"
>
🗑 ล้างรายการทั้งหมด
</button>

<button
onClick={submitOrder}
disabled={loading}
className="
mt-4
w-full
bg-orange-500
text-white
py-3
rounded-xl
font-bold
"
>
{loading ? "กำลังส่ง..." : "ส่งออเดอร์เข้าครัว"}
</button>

</div>

</div>


</div>


</div>


</main>

);
}

