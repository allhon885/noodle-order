"use client";

import { useEffect, useState } from "react";
import { categories as menuCategories } from "./categories";


type MenuItem = {

  id:number;

  name:string;

  category:string;

  description:string | null;

  price_normal:string;

  price_special:string | null;

  is_active:boolean;

};





export default function MenuPage(){


  const [menus,setMenus] =
    useState<MenuItem[]>([]);
  




  const [search,setSearch] =
    useState("");



  const [category,setCategory] =
    useState("ทั้งหมด");



  // Modal เพิ่ม

  const [showAdd,setShowAdd] =
    useState(false);



  // Modal แก้ไข

  const [showEdit,setShowEdit] =
    useState(false);



  const [editMenu,setEditMenu] =
    useState<MenuItem | null>(null);




  // Form เพิ่ม

  const [form,setForm] =
    useState({

      name:"",
      category:"",
      description:"",
      priceNormal:"",
      priceSpecial:""

    });





  // ======================
  // โหลดเมนู
  // ======================

  const loadMenu = async()=>{


    try{


      const response =
        await fetch("/api/menu/manage");



      const data =
        await response.json();



      if(response.ok){

        setMenus(data);

      }



    }catch(error){

      console.error(error);

    }


  };






  useEffect(()=>{

    loadMenu();

  },[]);






  // ======================
  // เปิด/ปิดขาย
  // ======================


  const toggleMenu = async(
    id:number,
    status:boolean
  )=>{


    await fetch(
      "/api/menu/manage",
      {

        method:"PATCH",

        headers:{
          "Content-Type":"application/json"
        },


        body:JSON.stringify({

          id,

          isActive:!status

        })


      }
    );



    loadMenu();


  };







  // ======================
  // เพิ่มเมนู
  // ======================


  const addMenu = async()=>{


    if(
      !form.name ||
      !form.category ||
      !form.priceNormal
    ){

      alert("กรุณากรอกข้อมูลให้ครบ");

      return;

    }





    const response =
      await fetch(
        "/api/menu/manage",
        {

          method:"POST",

          headers:{
            "Content-Type":"application/json"
          },


          body:JSON.stringify({

            name:form.name,

            category:form.category,

            description:
              form.description || null,


            priceNormal:
              Number(form.priceNormal),


            priceSpecial:
              form.priceSpecial
              ?
              Number(form.priceSpecial)
              :
              null


          })


        }
      );





    const data =
      await response.json();





    if(!response.ok){


      alert(
        data.error ||
        "เพิ่มเมนูไม่สำเร็จ"
      );


      return;

    }






    setShowAdd(false);




    setForm({

      name:"",
      category:"",
      description:"",
      priceNormal:"",
      priceSpecial:""

    });




    loadMenu();



  };









  // ======================
  // เปิด Modal แก้ไข
  // ======================


  const openEdit = (
    menu:MenuItem
  )=>{


    setEditMenu(menu);

    setShowEdit(true);


  };







  // ======================
  // แก้ไขเมนู
  // ======================


  const updateMenu = async()=>{


    if(!editMenu)
      return;




    const response =
      await fetch(
        "/api/menu/manage",
        {


          method:"PATCH",


          headers:{
            "Content-Type":"application/json"
          },



          body:JSON.stringify({


            id:editMenu.id,


            name:editMenu.name,


            category:editMenu.category,


            description:
              editMenu.description,



            priceNormal:
              Number(
                editMenu.price_normal
              ),



            priceSpecial:
              editMenu.price_special
              ?
              Number(
                editMenu.price_special
              )
              :
              null



          })


        }
      );





    const data =
      await response.json();




    if(!response.ok){


      alert(
        data.error ||
        "แก้ไขไม่สำเร็จ"
      );


      return;

    }





    setShowEdit(false);


    setEditMenu(null);



    loadMenu();



  };







  // ======================
  // หมวดหมู่
  // ======================


  const filterCategories = [
    "ทั้งหมด",
    ...menuCategories
  ];






  // ======================
  // Filter
  // ======================


  const filteredMenus =

    menus.filter(menu=>{


      const matchSearch =

        menu.name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        );




      const matchCategory =

        category==="ทั้งหมด"
        ||
        menu.category===category;





      return (

        matchSearch &&
        matchCategory

      );



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
        mx-auto
        max-w-6xl
        "
      >


        <div className="
        flex
        items-center
        justify-between
        "
        >

          <h1
            className="
            text-3xl
            font-bold
            "
          >
            📋 จัดการเมนูอาหาร
          </h1>



          <button

            onClick={()=>{
              setShowAdd(true);
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

            ➕ เพิ่มเมนู

          </button>


        </div>





        {/* Search / Filter */}

        <div
          className="
          mt-6
          rounded-xl
          bg-white
          p-5
          shadow
          "
        >


          <div
            className="
            grid
            gap-4
            md:grid-cols-2
            "
          >


            <select
              value={form.category}
              onChange={(e)=>setForm({
                ...form,
                category:e.target.value
              })}
            >
              <option value="">
                เลือกหมวดหมู่
              </option>

              {menuCategories.map((cat)=>(
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}

            </select>



            <select

              value={category}

              onChange={
                e=>setCategory(e.target.value)
              }

              className="
              rounded-xl
              border
              px-4
              py-3
              "

            >

              {
                filterCategories.map(item=>(

                  <option
                    key={item}
                    value={item}
                  >

                    {item}

                  </option>

                ))
              }


            </select>


          </div>


        </div>








        {/* Menu Card */}

        <div
          className="
          mt-6
          grid
          gap-5
          md:grid-cols-2
          "
        >


        {

          filteredMenus.map(menu=>(


            <div

              key={menu.id}

              className="
              rounded-2xl
              bg-white
              p-5
              shadow
              "

            >


              <div
                className="
                flex
                justify-between
                "
              >


                <div>


                  <h2
                    className="
                    text-xl
                    font-bold
                    "
                  >

                    {menu.name}

                  </h2>


                  <p
                    className="
                    text-gray-500
                    "
                  >

                    หมวด: {menu.category}

                  </p>


                </div>




                {
                  menu.is_active

                  ?

                  <span
                    className="
                    rounded-full
                    bg-green-100
                    px-3
                    py-1
                    text-green-700
                    "
                  >

                    🟢 เปิดขาย

                  </span>


                  :

                  <span
                    className="
                    rounded-full
                    bg-red-100
                    px-3
                    py-1
                    text-red-700
                    "
                  >

                    🔴 ปิดขาย

                  </span>


                }


              </div>





              <div
                className="
                mt-4
                "
              >

                <div>

                  ธรรมดา :

                  <b>
                    {" "}
                    {menu.price_normal}
                    บาท
                  </b>

                </div>



                {
                  menu.price_special &&

                  <div>

                    พิเศษ :

                    <b>
                      {" "}
                      {menu.price_special}
                      บาท
                    </b>

                  </div>

                }


              </div>






              <div
                className="
                mt-5
                grid
                grid-cols-2
                gap-3
                "
              >


                <button

                  onClick={()=>
                    openEdit(menu)
                  }

                  className="
                  rounded-xl
                  bg-blue-100
                  py-3
                  font-bold
                  text-blue-700
                  "
                >

                  ✏️ แก้ไข

                </button>





                <button

                  onClick={()=>
                    toggleMenu(
                      menu.id,
                      menu.is_active
                    )
                  }


                  className={`
                  rounded-xl
                  py-3
                  font-bold

                  ${
                    menu.is_active

                    ?

                    "bg-red-100 text-red-700"

                    :

                    "bg-green-100 text-green-700"

                  }

                  `}
                >

                  {
                    menu.is_active
                    ?
                    "ปิดขาย"
                    :
                    "เปิดขาย"
                  }


                </button>


              </div>


            </div>


          ))

        }


        </div>


      </div>








      {/* Modal เพิ่มเมนู */}


      {
      showAdd && (

        <div
          className="
          fixed
          inset-0
          flex
          items-center
          justify-center
          bg-black/40
          "
        >


          <div
            className="
            w-full
            max-w-md
            rounded-2xl
            bg-white
            p-6
            "
          >


            <h2
              className="
              text-2xl
              font-bold
              "
            >

              ➕ เพิ่มเมนูใหม่

            </h2>



            <input

              placeholder="ชื่อเมนู"

              value={form.name}

              onChange={
                e=>
                setForm({
                  ...form,
                  name:e.target.value
                })
              }

              className="
              mt-4
              w-full
              rounded-xl
              border
              p-3
              "

            />



            <select
              value={form.category}
              onChange={(e)=>setForm({
                ...form,
                category:e.target.value
              })}
              className="w-full border rounded-xl px-4 py-3"
            >

            <option value="">
              เลือกหมวดหมู่
            </option>

            <option value="ก๋วยเตี๋ยว">
              ก๋วยเตี๋ยว
            </option>

            <option value="เกาเหลา">
              เกาเหลา
            </option>

            <option value="ของลวก">
              ของลวก
            </option>

            <option value="เครื่องดื่ม">
              เครื่องดื่ม
            </option>

            <option value="ขนม">
              ขนมหวาน
            </option>

            </select>



            <input

              placeholder="รายละเอียด"

              value={form.description}

              onChange={
                e=>
                setForm({
                  ...form,
                  description:e.target.value
                })
              }

              className="
              mt-3
              w-full
              rounded-xl
              border
              p-3
              "

            />



            <input

              type="number"

              placeholder="ราคาธรรมดา"

              value={form.priceNormal}

              onChange={
                e=>
                setForm({
                  ...form,
                  priceNormal:e.target.value
                })
              }

              className="
              mt-3
              w-full
              rounded-xl
              border
              p-3
              "

            />



            <input

              type="number"

              placeholder="ราคาพิเศษ"

              value={form.priceSpecial}

              onChange={
                e=>
                setForm({
                  ...form,
                  priceSpecial:e.target.value
                })
              }

              className="
              mt-3
              w-full
              rounded-xl
              border
              p-3
              "

            />




            <div
              className="
              mt-5
              grid
              grid-cols-2
              gap-3
              "
            >


              <button

                onClick={()=>
                  setShowAdd(false)
                }

                className="
                rounded-xl
                bg-gray-200
                py-3
                font-bold
                "
              >

                ยกเลิก

              </button>




              <button

                onClick={addMenu}

                className="
                rounded-xl
                bg-green-500
                py-3
                font-bold
                text-white
                "
              >

                บันทึก

              </button>


            </div>



          </div>


        </div>

      )
      }








      {/* Modal แก้ไขเมนู */}


      {
      showEdit && editMenu && (

        <div
          className="
          fixed
          inset-0
          flex
          items-center
          justify-center
          bg-black/40
          "
        >


          <div
            className="
            w-full
            max-w-md
            rounded-2xl
            bg-white
            p-6
            "
          >


            <h2
              className="
              text-2xl
              font-bold
              "
            >

              ✏️ แก้ไขเมนู

            </h2>




            <input

              value={editMenu.name}

              onChange={
                e=>
                setEditMenu({

                  ...editMenu,

                  name:e.target.value

                })
              }


              className="
              mt-4
              w-full
              rounded-xl
              border
              p-3
              "

            />



            <input

              type="number"

              value={editMenu.price_normal}

              onChange={
                e=>
                setEditMenu({

                  ...editMenu,

                  price_normal:e.target.value

                })
              }


              className="
              mt-3
              w-full
              rounded-xl
              border
              p-3
              "

            />




            <button

              onClick={updateMenu}

              className="
              mt-5
              w-full
              rounded-xl
              bg-green-500
              py-3
              font-bold
              text-white
              "

            >

              บันทึกการแก้ไข

            </button>



          </div>


        </div>


      )
      }



    </main>


  );

}   



