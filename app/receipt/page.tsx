"use client";

import { useEffect, useState } from "react";


type OrderItem = {

menuName:string;

quantity:number;

unitPrice:number;

subtotal:number;

noodle?:string|null;

vegetable?:string|null;

};



type Order = {

id:number;

order_number:string;

table_number:string;

status:string;

total_amount:string | number;

payment_method:string|null;

cash_received:string|null;

change_amount:string|null;

created_at:string;

items:OrderItem[];

};



type Shop={

shop_name:string;

phone:string;

address:string;

receipt_footer:string;

};





const money=(value:any)=>{


if(value===null || value===undefined){

return "0.00";

}


return Number(value).toLocaleString(
"th-TH",
{
minimumFractionDigits:2,
maximumFractionDigits:2
}
);


};






export default function ReceiptPage(){


const [orders,setOrders]=
useState<Order[]>([]);


const [shop,setShop]=
useState<Shop|null>(null);


const [selected,setSelected]=
useState<Order|null>(null);


  // =========================
  // วันที่ที่เลือกดูใบเสร็จ
  // =========================

  const [selectedDate, setSelectedDate] =
    useState(
      new Date().toISOString().split("T")[0]
    );


const loadData=async()=>{


try{


const orderRes =
await fetch("/api/orders");


const orderData =
await orderRes.json();



console.log(
"ORDERS",
orderData
);



if(orderRes.ok){


const fixedOrders =
orderData.map((order:any)=>({

...order,

items:

typeof order.items==="string"

?

JSON.parse(order.items)

:

order.items || []

}));


setOrders(fixedOrders);


}






const shopRes =
await fetch("/api/settings/shop");


const shopData =
await shopRes.json();



console.log(
"SHOP",
shopData
);



if(shopRes.ok){

setShop(shopData);

}



}catch(error){

console.error(
"RECEIPT ERROR",
error
);


}


};






useEffect(()=>{


loadData();


},[]);







  const paidOrders = orders.filter((order) => {

    if (order.status !== "paid") {
      return false;
    }

    const orderDate = new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Bangkok",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    ).format(new Date(order.created_at));

    return orderDate === selectedDate;

  });





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
max-w-4xl
mx-auto
"
>

<div className="mt-5 flex items-center gap-3">

  <input
    type="date"
    value={selectedDate}
    onChange={(e) => {
      setSelectedDate(e.target.value);
      setSelected(null);
    }}
    className="
      rounded-xl
      border
      bg-white
      px-4
      py-3
      font-bold
    "
  />

  <button
    onClick={() => {

      const now = new Date();

      setSelectedDate([
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0"),
      ].join("-"));

      setSelected(null);

    }}
    className="
      rounded-xl
      bg-orange-500
      px-5
      py-3
      font-bold
      text-white
    "
  >
    📅 วันนี้
  </button>

</div>


<h1
className="
text-3xl
font-bold
"
>

🧾 ใบเสร็จ

</h1>





{

paidOrders.length===0

?


<div
className="
mt-6
bg-white
rounded-xl
p-10
text-center
shadow
"
>

ยังไม่มีรายการชำระเงิน

</div>


:

paidOrders.map(order=>(


<div
key={order.id}
className="
mt-5
bg-white
rounded-xl
p-5
shadow
flex
justify-between
"
>


<div>

<div
className="
text-xl
font-bold
"
>

{order.order_number}

</div>


<div>

โต๊ะ {order.table_number}

</div>


</div>



<button

onClick={()=>setSelected(order)}

className="
bg-black
text-white
rounded-xl
px-5
py-2
font-bold
"
>

🧾 เปิดใบเสร็จ

</button>



</div>


))


}





{
  selected && (

    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/50
        p-4
      "
      onClick={() => setSelected(null)}
    >

      <div
        className="
          relative
          w-full
          max-w-md
          max-h-[90vh]
          overflow-y-auto
          rounded-2xl
          bg-white
          p-6
          shadow-2xl
        "
        onClick={(e) => e.stopPropagation()}
      >

        {/* ========================= */}
        {/* ปุ่มปิด */}
        {/* ========================= */}

        <button
          type="button"
          onClick={() => setSelected(null)}
          className="
            absolute
            right-4
            top-4
            h-9
            w-9
            rounded-full
            bg-gray-100
            text-xl
            font-bold
            text-gray-600
            hover:bg-gray-200
          "
        >
          ×
        </button>


        {/* ========================= */}
        {/* หัวใบเสร็จ */}
        {/* ========================= */}

        <div className="pr-10 text-center">

          <h2 className="text-2xl font-bold">
            {shop?.shop_name || "ก๋วยเตี๋ยวหอมตุ๋น"}
          </h2>

          {shop?.phone && (
            <div className="text-sm text-gray-500">
              โทร {shop.phone}
            </div>
          )}

          {shop?.address && (
            <div className="text-sm text-gray-500">
              {shop.address}
            </div>
          )}

          <div className="mt-2 font-bold">
            ใบเสร็จรับเงิน
          </div>

        </div>


        <hr className="my-4" />


        {/* ========================= */}
        {/* ข้อมูลออเดอร์ */}
        {/* ========================= */}

        <div className="space-y-1 text-sm">

          <div>
            เลขที่: {selected.order_number}
          </div>

          <div>
            โต๊ะ: {selected.table_number}
          </div>

          <div>
            วันที่:{" "}
            {new Date(
              selected.created_at
            ).toLocaleString("th-TH")}
          </div>

        </div>


        {/* ========================= */}
        {/* รายการอาหาร */}
        {/* ========================= */}

        <div className="mt-4">

          {
            selected.items.map(
              (item, index) => (

                <div
                  key={index}
                  className="
                    border-b
                    py-3
                  "
                >

                  <div
                    className="
                      flex
                      justify-between
                      gap-3
                      font-bold
                    "
                  >

                    <span>
                      {item.menuName} x{item.quantity}
                    </span>

                    <span className="whitespace-nowrap">
                      {money(item.subtotal)}
                    </span>

                  </div>


                  {
                    (
                      item.noodle ||
                      item.vegetable
                    ) && (

                      <div
                        className="
                          mt-1
                          text-sm
                          text-gray-500
                        "
                      >

                        {
                          item.noodle && (
                            <>
                              เส้น {item.noodle}
                            </>
                          )
                        }

                        {
                          item.noodle &&
                          item.vegetable &&
                          " • "
                        }

                        {
                          item.vegetable && (
                            <>
                              ผัก {item.vegetable}
                            </>
                          )
                        }

                      </div>

                    )
                  }

                </div>

              )
            )
          }

        </div>


        {/* ========================= */}
        {/* รวมเงิน */}
        {/* ========================= */}

        <div
          className="
            mt-5
            flex
            justify-between
            border-t-2
            pt-4
            text-xl
            font-bold
          "
        >

          <span>
            รวม
          </span>

          <span>
            {money(selected.total_amount)} บาท
          </span>

        </div>


        {/* ========================= */}
        {/* การชำระเงิน */}
        {/* ========================= */}

        <div className="mt-4">

          <div className="font-bold">
            ชำระโดย
          </div>

          <div className="mt-1">

            {
              selected.payment_method === "cash"
                ? "💵 เงินสด"
                : "📱 โอนเงิน"
            }

          </div>


          {
            selected.payment_method === "cash" && (

              <div className="mt-2 space-y-1">

                <div>
                  รับเงิน:{" "}
                  {money(selected.cash_received)} บาท
                </div>

                <div>
                  เงินทอน:{" "}
                  {money(selected.change_amount)} บาท
                </div>

              </div>

            )
          }

        </div>


        {/* ========================= */}
        {/* ข้อความท้ายใบเสร็จ */}
        {/* ========================= */}

        {
          shop?.receipt_footer && (

            <div
              className="
                mt-5
                border-t
                pt-4
                text-center
                text-sm
                text-gray-500
              "
            >
              {shop.receipt_footer}
            </div>

          )
        }


        {/* ========================= */}
        {/* ปุ่ม */}
        {/* ========================= */}

        <div
          className="
            mt-6
            grid
            grid-cols-2
            gap-3
          "
        >

          <button
            type="button"
            onClick={() => window.print()}
            className="
              rounded-xl
              bg-black
              py-3
              font-bold
              text-white
              hover:bg-gray-800
            "
          >
            🖨️ พิมพ์
          </button>


          <button
            type="button"
            onClick={() => setSelected(null)}
            className="
              rounded-xl
              bg-gray-200
              py-3
              font-bold
              text-gray-700
              hover:bg-gray-300
            "
          >
            ✕ ปิด
          </button>

        </div>


      </div>

    </div>

  )
}


</div>

</main>

);


}