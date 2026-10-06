"use client";

import { useEffect, useRef, useState } from "react";



type MenuItem = {

  id:number;

  name:string;

  category:string;

  description:string | null;

  price_normal:string | number;

  price_special:string | number | null;

  image_url:string | null;

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

const cartRef = useRef<CartItem[]>([]);

useEffect(() => {
  cartRef.current = cart;
}, [cart]);

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

useEffect(() => {

  if (!selectedTable) return;

  const loadCurrent = async () => {

    try {

      const res = await fetch(
        `/api/orders/current?table=${selectedTable}`
      );

      const data = await res.json();

      // =========================
      // มีออเดอร์เดิมของโต๊ะ
      // =========================

      if (data.id) {

        setEditingOrderId(Number(data.id));

      } else {

        setEditingOrderId(null);

      }


      // =========================
      // โต๊ะมีรายการเดิม
      // =========================

      if (data.items?.length) {

        // ถ้ามีรายการที่กำลังคีย์อยู่
        if (cartRef.current.length > 0) {

          const confirmLoad = window.confirm(
            "โต๊ะนี้มีออเดอร์เดิมอยู่แล้ว\n\n" +
            "ต้องการโหลดออเดอร์เดิมของโต๊ะหรือไม่?\n\n" +
            "OK = โหลดออเดอร์เดิม\n" +
            "Cancel = เก็บรายการที่กำลังคีย์ไว้"
          );

          // กด Cancel
          if (!confirmLoad) {

            return;

          }

        }


        // =========================
        // โหลดรายการเดิมของโต๊ะ
        // =========================

        setCart(

          data.items.map((item: any) => ({

            menuId: item.menu_item_id,

            menuName: item.name,

            category: item.category || "",

            quantity: Number(item.quantity),

            price: Number(item.unit_price),

            size: item.size || "normal",

            noodle: item.noodle || "",

            vegetable: item.vegetable || "ปกติ",

            note: item.note || null

          }))

        );


      } else {

        // =========================
        // โต๊ะยังไม่มีออเดอร์
        // =========================

        // สำคัญมาก:
        // ห้าม setCart([])
        // เพราะอาจเป็นรายการที่พนักงานคีย์ไว้ก่อนเลือกโต๊ะ

        console.log(
          "โต๊ะยังไม่มีออเดอร์เดิม - เก็บรายการปัจจุบันไว้"
        );

      }


    } catch (error) {

      console.error(error);

    }

  };


  loadCurrent();

}, [selectedTable]);



// กรองเมนู

const currentMenus = menus.filter(item => {
  return item.category === selectedCategory;
});


// =====================
// MENU SELECTED QTY
// =====================

const getMenuQty = (menuId: number) => {

  return cart
    .filter(item => item.menuId === menuId)
    .reduce(
      (sum, item) => sum + item.quantity,
      0
    );

};

// =====================
// ADD MENU
// =====================

const addMenu = (item: MenuItem) => {

  const isDrink =
    item.category.includes("เครื่อง");

  const isDessert =
    item.category === "ขนมหวาน";


  // =====================
  // PRICE
  // =====================

  let price = Number(item.price_normal);


  // เครื่องดื่ม
  if (isDrink) {

    price = Number(item.price_normal);

  }

  // ขนมหวาน
  else if (isDessert) {

    // ขนมหวานขายคู่ละ 10 บาท
    price = 10;

  }

  // ก๋วยเตี๋ยว / เกาเหลา
  else if (size === "special") {

    price = Number(
      item.price_special ||
      item.price_normal
    );

  }

  // ธรรมดา
  else {

    price = Number(
      item.price_normal
    );

  }


  // =====================
  // SIZE
  // =====================

  const itemSize =
    isDrink
      ? "normal"
      : size;


  // =====================
  // NOODLE
  // =====================

  const isLuiSuan =
  item.name === "ลุยสวน";

  const itemNoodle =
    isDrink || isDessert || isLuiSuan
      ? ""
      : noodle;


  // =====================
  // VEGETABLE
  // =====================

  const itemVegetable =
    isDrink || isDessert || isLuiSuan
      ? ""
      : vegetable;


  // =====================
  // FIND EXISTING
  // =====================

  const existing = cart.find((c) =>

    c.menuId === item.id &&

    c.size === itemSize &&

    c.noodle === itemNoodle &&

    c.vegetable === itemVegetable &&

    c.price === price

  );


  // =====================
  // EXISTING ITEM
  // =====================

  if (existing) {

    setCart(

      cart.map((c) =>

        c === existing

          ? {
              ...c,
              quantity: c.quantity + 1
            }

          : c

      )

    );

    return;
  }


  // =====================
  // NEW ITEM
  // =====================

  setCart([

    ...cart,

    {

      menuId: item.id,

      menuName: item.name,

      category: item.category,

      quantity: 1,

      price,

      size: itemSize,

      noodle: itemNoodle,

      vegetable: itemVegetable,

      note: null

    }

  ]);

};


// =====================
// CHANGE QTY
// =====================

const changeQty = (
  index: number,
  value: number
) => {

  const newCart = [...cart];

  newCart[index].quantity += value;


  if (newCart[index].quantity <= 0) {

    newCart.splice(index, 1);

  }


  setCart(newCart);

};


// =====================
// TOTAL
// =====================

const total = cart.reduce(

  (sum, item) =>
    sum + (item.price * item.quantity),

  0

);


// =====================
// SUBMIT ORDER
// =====================

const submitOrder = async () => {

  if (!selectedTable) {

    alert("กรุณาเลือกโต๊ะ");

    return;

  }


  if (cart.length === 0) {

    alert("ยังไม่มีรายการ");

    return;

  }


  try {

    setLoading(true);


    const isEditing =
      editingOrderId !== null;


    const response = await fetch(

      "/api/orders",

      {

        method:
          isEditing
            ? "PATCH"
            : "POST",

        headers: {

          "Content-Type":
            "application/json"

        },

        body: JSON.stringify(

          isEditing

            ? {

                id: editingOrderId,

                items: cart.map(
                  item => ({

                    menuId:
                      item.menuId,

                    quantity:
                      item.quantity,

                    size:
                      item.size,

                    noodle:
                      item.noodle,

                    vegetable:
                      item.vegetable,

                    note:
                      item.note

                  })
                )

              }

            : {

                tableNumber:
                  selectedTable,

                cart:
                  cart.map(
                    item => ({

                      menuId:
                        item.menuId,

                      quantity:
                        item.quantity,

                      unitPrice:
                        item.price,

                      size:
                        item.size,

                      noodle:
                        item.noodle,

                      vegetable:
                        item.vegetable,

                      note:
                        item.note

                    })
                  )

              }

        )

      }

    );


    const data =
      await response.json();


    if (!response.ok) {

      alert(
        data.error ||
        "ส่งออเดอร์ไม่สำเร็จ"
      );

      return;

    }


    alert(
      isEditing
        ? "✅ แก้ไขออเดอร์เรียบร้อย"
        : "✅ ส่งออเดอร์เข้าครัวแล้ว"
    );


    setCart([]);

    setNoodle("");

    setVegetable("ปกติ");

    setEditingOrderId(null);


  } catch (error) {

    console.error(error);

    alert("ระบบผิดพลาด");

  } finally {

    setLoading(false);

  }

};


// =====================
// RETURN
// =====================

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

      {/* ===================== */}
      {/* HEADER */}
      {/* ===================== */}

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

        {/* ===================== */}
        {/* LEFT */}
        {/* ===================== */}

        <div
          className="
            lg:col-span-2
            space-y-5
          "
        >

          {/* ===================== */}
          {/* TABLE */}
          {/* ===================== */}

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

              {tables.map(table => (

                <button
                  key={table.id}

                  onClick={() =>
                    setSelectedTable(
                      table.table_number
                    )
                  }

                  className={`
                    rounded-xl
                    py-4
                    font-bold

                    ${
                      selectedTable ===
                      table.table_number

                        ? "bg-orange-500 text-white"

                        : table.status === "busy"

                          ? "bg-red-100 text-red-600"

                          : "bg-green-100 text-green-700"
                    }
                  `}
                >

                  {table.status === "busy"
                    ? "🔴"
                    : "🟢"}

                  {table.table_number}

                </button>

              ))}

            </div>

          </div>


          {/* ===================== */}
          {/* CATEGORY */}
          {/* ===================== */}

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

              {categories.map(cat => (

                <button
                  key={cat}

                  onClick={() => {

                    setSelectedCategory(cat);

                    if (
                      cat !== "ก๋วยเตี๋ยว"
                    ) {

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
                      selectedCategory === cat

                        ? "bg-orange-500 text-white"

                        : "bg-gray-200"
                    }
                  `}
                >

                  {cat}

                </button>

              ))}

            </div>

          </div>


          {/* ===================== */}
          {/* OPTIONS */}
          {/* ===================== */}

          {(
            selectedCategory === "ก๋วยเตี๋ยว" ||
            selectedCategory === "เกาเหลา" ||
            selectedCategory === "ขนมหวาน"
          ) && (

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


              {/* ===================== */}
              {/* SIZE */}
              {/* ===================== */}

              <div
                className="
                  flex
                  gap-3
                  mb-4
                "
              >

                <button

                  onClick={() =>
                    setSize("normal")
                  }

                  className={`
                    px-5
                    py-3
                    rounded-xl
                    font-bold

                    ${
                      size === "normal"

                        ? "bg-green-500 text-white"

                        : "bg-gray-200"
                    }
                  `}
                >
                  ธรรมดา
                </button>


                <button

                  onClick={() =>
                    setSize("special")
                  }

                  className={`
                    px-5
                    py-3
                    rounded-xl
                    font-bold

                    ${
                      size === "special"

                        ? "bg-green-500 text-white"

                        : "bg-gray-200"
                    }
                  `}
                >
                  พิเศษ
                </button>

              </div>


              {/* ===================== */}
              {/* DESSERT PRICE */}
              {/* ===================== */}

              {selectedCategory === "ขนมหวาน" && (

                <div
                  className="
                    rounded-xl
                    bg-pink-50
                    p-4
                    text-pink-700
                    font-bold
                  "
                >
                  🍰 ขนมหวาน
                  <br />
                  ธรรมดา / พิเศษ
                  <br />
                  ราคา 10 บาท / คู่
                </div>

              )}


              {/* ===================== */}
              {/* NOODLE */}
              {/* ===================== */}

              {selectedCategory === "ก๋วยเตี๋ยว" && (

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

                    {[
                      {
                        name: "เส้นเล็ก",
                        image: "/noodles/senlek.jpg",
                      },
                      {
                        name: "หมี่ขาว",
                        image: "/noodles/senmee.jpg",
                      },
                      {
                        name: "เส้นใหญ่",
                        image: "/noodles/senyai.jpg",
                      },
                      {
                        name: "หมี่เหลือง",
                        image: "/noodles/bamee.jpg",
                      },
                      {
                        name: "มาม่า",
                        image: "/noodles/mama.jpg",
                      },
                      {
                        name: "วุ้นเส้น",
                        image: "/noodles/woonsen.jpg",
                      },
                    ].map((item) => (

                      <button
                        key={item.name}

                        onClick={() =>
                          setNoodle(item.name)
                        }

                        className={`
                          relative
                          overflow-hidden
                          rounded-xl
                          font-bold
                          transition-all
                          active:scale-95

                          ${
                            noodle === item.name
                              ? "bg-green-500 text-white ring-4 ring-green-200"
                              : "bg-gray-200 hover:bg-gray-300"
                          }
                        `}
                      >

                        {/* CHECK */}

                        {noodle === item.name && (

                          <div
                            className="
                              absolute
                              top-2
                              right-2
                              z-10
                              w-8
                              h-8
                              rounded-full
                              bg-white
                              text-green-600
                              flex
                              items-center
                              justify-center
                              font-bold
                              shadow
                            "
                          >
                            ✓
                          </div>

                        )}


                        {/* IMAGE */}

                        <img
                          src={item.image}
                          alt={item.name}
                          className="
                            w-full
                            h-28
                            object-cover
                          "
                        />


                        {/* NAME */}

                        <div
                          className="
                            p-3
                            text-center
                          "
                        >
                          {item.name}
                        </div>

                      </button>

                    ))}

                  </div>

                </>

              )}


              {/* ===================== */}
              {/* VEGETABLE */}
              {/* ===================== */}

              {selectedCategory !== "ขนมหวาน" && (

                <>

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

                    {[
                      "ปกติ",
                      "ไม่ผัก",
                      "เพิ่มผัก"
                    ].map(x => (

                      <button
                        key={x}

                        onClick={() =>
                          setVegetable(x)
                        }

                        className={`
                          px-4
                          py-3
                          rounded-xl

                          ${
                            vegetable === x

                              ? "bg-orange-500 text-white"

                              : "bg-gray-200"
                          }
                        `}
                      >
                        {x}
                      </button>

                    ))}

                  </div>

                </>

              )}

            </div>

          )}


          {/* ===================== */}
          {/* MENU LIST */}
          {/* ===================== */}

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
              md:grid-cols-3
              gap-3
              "
            >

              {currentMenus.map((item) => {

                const qty = getMenuQty(item.id);

                return (

                  <button
                    key={item.id}
                    onClick={() => addMenu(item)}

                    className={`
                      relative
                      overflow-hidden
                      rounded-xl
                      text-left
                      font-bold
                      transition-all
                      active:scale-95
                      ${
                        qty > 0
                          ? "bg-green-500 text-white ring-4 ring-green-200"
                          : "bg-orange-100 hover:bg-orange-200"
                      }
                    `}
                  >

                    {/* CHECK */}

                    {qty > 0 && (

                      <div
                        className="
                        absolute
                        top-2
                        right-2
                        z-10
                        w-7
                        h-7
                        rounded-full
                        bg-white
                        text-green-600
                        flex
                        items-center
                        justify-center
                        font-bold
                        shadow
                        "
                      >
                        ✓
                      </div>

                    )}


                    {/* SMALL IMAGE */}

                    <div
                      className="
                      w-full
                      h-20
                      flex
                      items-center
                      justify-center
                      pt-2
                      "
                    >

                      {item.image_url ? (

                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="
                          w-20
                          h-20
                          object-cover
                          rounded-lg
                          "
                        />

                      ) : (

                        <div
                          className="
                          w-20
                          h-20
                          rounded-lg
                          bg-orange-200
                          flex
                          items-center
                          justify-center
                          text-3xl
                          "
                        >
                          🍜
                        </div>

                      )}

                    </div>


                    {/* NAME + PRICE */}

                    <div
                      className="
                      p-3
                      pt-2
                      text-center
                      "
                    >

                      <div>
                        {item.name}
                      </div>


                      <div
                        className={`
                        text-sm
                        mt-1
                        ${
                          qty > 0
                            ? "text-white"
                            : "text-gray-600"
                        }
                        `}
                      >

                        {
                          size === "special"
                            ? Number(
                                item.price_special ||
                                item.price_normal
                              )
                            : Number(
                                item.price_normal
                              )
                        }

                        บาท

                      </div>


                      {/* QTY */}

                      {qty > 0 && (

                        <div
                          className="
                          mt-2
                          mx-auto
                          w-fit
                          rounded-full
                          bg-white
                          text-green-700
                          px-3
                          py-1
                          text-xs
                          font-bold
                          "
                        >
                          เลือกแล้ว {qty}
                        </div>

                      )}

                    </div>

                  </button>

                );

              })}

            </div>

          </div>
          </div>

        {/* ===================== */}
        {/* CART */}
        {/* ===================== */}

        <div
          className="
            bg-white
            rounded-2xl
            p-5
            shadow
            h-fit
            lg:sticky
            lg:top-5
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


          {selectedTable && (

            <div
              className="
                mt-2
                text-sm
                text-gray-500
              "
            >
              โต๊ะ {selectedTable}
            </div>

          )}


          <div className="mt-4">

            {cart.length === 0 ? (

              <div
                className="
                  py-8
                  text-center
                  text-gray-400
                "
              >
                ยังไม่มีรายการ
              </div>

            ) : (

              cart.map((item, index) => (

                <div
                  key={`${item.menuId}-${index}`}
                  className="
                    border-b
                    pb-4
                    mb-4
                  "
                >

                  <div
                    className="
                      font-bold
                    "
                  >
                    {item.menuName}
                  </div>


                  <div
                    className="
                      text-sm
                      text-gray-600
                      mt-1
                    "
                  >

                    {item.size === "special"
                      ? "⭐ พิเศษ"
                      : "⭐ ธรรมดา"}


                    {item.noodle && (

                      <div>
                        🍜 {item.noodle}
                      </div>

                    )}


                    {item.category !== "ขนมหวาน" &&
                      item.category.includes("เครื่อง") === false &&
                      item.vegetable && (

                        <div>
                          🥬 {item.vegetable}
                        </div>

                    )}

                  </div>


                  {item.category === "ขนมหวาน" && (

                    <div
                      className="
                        text-sm
                        text-pink-600
                        font-bold
                        mt-1
                      "
                    >
                      🍰 10 บาท / คู่
                    </div>

                  )}


                  <input

                    value={
                      item.note || ""
                    }

                    onChange={(e) => {

                      const newCart =
                        [...cart];

                      newCart[index].note =
                        e.target.value;

                      setCart(newCart);

                    }}

                    placeholder="
                      📝 หมายเหตุ
                    "

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


                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      mt-3
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        gap-3
                      "
                    >

                      <button
                        onClick={() =>
                          changeQty(
                            index,
                            -1
                          )
                        }

                        className="
                          bg-red-100
                          px-3
                          py-1
                          rounded-lg
                        "
                      >
                        -
                      </button>


                      <span
                        className="
                          font-bold
                        "
                      >
                        {item.quantity}
                      </span>


                      <button
                        onClick={() =>
                          changeQty(
                            index,
                            1
                          )
                        }

                        className="
                          bg-green-100
                          px-3
                          py-1
                          rounded-lg
                        "
                      >
                        +
                      </button>

                    </div>


                    <div
                      className="
                        font-bold
                      "
                    >
                      {item.price *
                        item.quantity}{" "}
                      บาท
                    </div>


                    <button

                      onClick={() => {

                        const newCart =
                          [...cart];

                        newCart.splice(
                          index,
                          1
                        );

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

            )}

          </div>


          {/* ===================== */}
          {/* SUMMARY */}
          {/* ===================== */}

          <div
            className="
              border-t
              mt-4
              pt-4
            "
          >

            <div
              className="
                font-bold
              "
            >
              จำนวน{" "}
              {cart.reduce(
                (sum, item) =>
                  sum + item.quantity,
                0
              )}{" "}
              รายการ
            </div>


            <div
              className="
                text-2xl
                font-bold
                mt-2
              "
            >
              รวม {total} บาท
            </div>

          </div>


          {/* ===================== */}
          {/* CLEAR */}
          {/* ===================== */}

          <button

            onClick={() =>
              setCart([])
            }

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


          {/* ===================== */}
          {/* SUBMIT */}
          {/* ===================== */}

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
              disabled:opacity-50
            "
          >
            {loading
              ? "กำลังส่ง..."
              : editingOrderId !== null
                ? "บันทึกการแก้ไข"
                : "ส่งออเดอร์เข้าครัว"}
          </button>

        </div>

      </div>

    </div>

  </main>

);

}