"use client";

import { useEffect, useState } from "react";


type Shop = {

  id:number;
  shop_name:string;
  phone:string;
  address:string;
  receipt_footer:string;

};



export default function ShopPage(){


  const [shop,setShop] = useState<Shop | null>(null);

  const [edit,setEdit] = useState(false);



  // =====================
  // โหลดข้อมูลร้าน
  // =====================

  const loadShop = async()=>{


    try{


      const res = await fetch(
        "/api/settings/shop"
      );


      const data = await res.json();


      setShop(data);



    }catch(error){

      console.error(
        error
      );

    }


  };





  // =====================
  // บันทึกข้อมูลร้าน
  // =====================

  const saveShop = async()=>{


    try{


      const res = await fetch(

        "/api/settings/shop",

        {

          method:"PATCH",

          headers:{

            "Content-Type":
            "application/json"

          },

          body:JSON.stringify(shop)

        }

      );



      const data = await res.json();



      setShop(data);

      setEdit(false);



      alert(
        "บันทึกข้อมูลร้านแล้ว"
      );



    }catch(error){

      console.error(error);

    }


  };





  useEffect(()=>{


    loadShop();


  },[]);






  if(!shop){


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
        text-xl
        font-bold
        "
        >

        กำลังโหลดข้อมูลร้าน...

        </div>


      </main>

    );

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
      max-w-3xl
      "
      >



        <h1
        className="
        text-3xl
        font-bold
        "
        >

        🏪 ข้อมูลร้าน

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



        <div className="space-y-5">



        {/* ชื่อร้าน */}

        <Field

        label="ชื่อร้าน"

        value={shop.shop_name}

        edit={edit}

        onChange={(value)=>
          setShop({
            ...shop,
            shop_name:value
          })
        }

        />




        {/* เบอร์โทร */}

        <Field

        label="เบอร์โทร"

        value={shop.phone}

        edit={edit}

        onChange={(value)=>
          setShop({
            ...shop,
            phone:value
          })
        }

        />





        {/* ที่อยู่ */}

        <Field

        label="ที่อยู่"

        value={shop.address}

        edit={edit}

        onChange={(value)=>
          setShop({
            ...shop,
            address:value
          })
        }

        />





        {/* Footer */}

        <Field

        label="ข้อความท้ายใบเสร็จ"

        value={shop.receipt_footer}

        edit={edit}

        onChange={(value)=>
          setShop({
            ...shop,
            receipt_footer:value
          })
        }

        multiline

        />




        </div>



        <div
        className="
        mt-6
        "
        >


        {
        edit ?


        <button

        onClick={saveShop}

        className="
        rounded-xl
        bg-green-500
        px-6
        py-3
        font-bold
        text-white
        "

        >

        💾 บันทึก

        </button>



        :



        <button

        onClick={()=>setEdit(true)}

        className="
        rounded-xl
        bg-orange-500
        px-6
        py-3
        font-bold
        text-white
        "

        >

        ✏️ แก้ไขข้อมูล

        </button>


        }


        </div>



        </div>


      </div>


    </main>

  );

}





// =====================
// Component ช่องข้อมูล
// =====================


function Field({

label,

value,

edit,

onChange,

multiline=false

}:{

label:string;

value:string;

edit:boolean;

onChange:(value:string)=>void;

multiline?:boolean;

}){


return (

<div>


<label
className="
font-bold
"
>

{label}

</label>



{

edit ?


multiline ?


<textarea

value={value || ""}

onChange={(e)=>
onChange(e.target.value)
}

className="
mt-2
w-full
rounded-xl
border
p-3
"

rows={3}

/>


:



<input

value={value || ""}

onChange={(e)=>
onChange(e.target.value)
}

className="
mt-2
w-full
rounded-xl
border
p-3
"

/>



:



<div

className="
mt-2
rounded-xl
bg-gray-100
p-3
"

>

{value}

</div>



}


</div>

);


}