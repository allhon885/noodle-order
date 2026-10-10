"use client";

import { useEffect, useState } from "react";

type OrderItem = {
  menuId: number;
  menuName: string;
  quantity: number;
  size: "normal" | "special";
  unitPrice: number;
  subtotal: number;
  noodle: string | null;
  vegetable: string | null;
  note: string | null;
};

type Order = {
  id: number;
  order_number: string;
  table_number: string;
  status: string;
  total_amount: string;
  payment_method: string | null;
  created_at: string;
  items: OrderItem[];
};

export default function OrdersPage() {

  const [orders, setOrders] = useState<Order[]>([]);

  const [orderFilter, setOrderFilter] =
  useState<"today" | "all">("today");
  
  const [statusFilter, setStatusFilter] = useState("all");

  const [editingOrder, setEditingOrder] =
  useState<Order | null>(null);

  const [editTable, setEditTable] = useState("");

  const [tables, setTables] = useState<any[]>([]);

  const [editItems, setEditItems] =
    useState<OrderItem[]>([]);

  const [menuList, setMenuList] =
    useState<any[]>([]);

  const [savingEdit, setSavingEdit] =
    useState(false);

  const loadOrders = async () => {

    try {

      const response =
        await fetch("/api/orders", {
          cache: "no-store",
        });

      const data =
        await response.json();

      if (response.ok) {

        setOrders(data);

      }

    } catch (error) {

      console.error(error);

    }

  };

  const loadTables = async () => {
  try {
    const response = await fetch("/api/settings/tables", {
      cache: "no-store",
    });

    const data = await response.json();

    if (response.ok) {
      setTables(data);
    }
  } catch (error) {
    console.error(error);
  }
};

  // ========================================
  // เปิดหน้าแก้ไข Order
  // ========================================



  const openEditOrder = async (order: Order) => {

    try {

      const response =
        await fetch("/api/menu");

      const menus =
        await response.json();


      if (!response.ok) {

        alert("ไม่สามารถโหลดเมนูได้");

        return;

      }


      setMenuList(menus);

      setEditingOrder(order);

      setEditTable(order.table_number);

      const mergedItems: OrderItem[] = [];

      for (const item of order.items) {

        const existingIndex = mergedItems.findIndex(
          x =>
            x.menuId === item.menuId &&
            x.size === item.size &&
            x.noodle === item.noodle &&
            x.vegetable === item.vegetable &&
            x.note === item.note
        );

        if (existingIndex !== -1) {

          const existing = mergedItems[existingIndex];

          const quantity =
            existing.quantity + item.quantity;

          mergedItems[existingIndex] = {
            ...existing,
            quantity,
            subtotal:
              existing.unitPrice * quantity
          };

        } else {

          mergedItems.push({
            ...item,
            subtotal:
              item.unitPrice * item.quantity
          });

        }
      }

      setEditItems(mergedItems);


    } catch (error) {

      console.error(error);

      alert("ไม่สามารถเปิดหน้าแก้ไขได้");

    }

  };


  // ========================================
  // เพิ่มรายการใน Order ที่กำลังแก้ไข
  // ========================================

  const addEditItem = (menu: any) => {

    setEditItems(prev => {

      const existingIndex =
        prev.findIndex(
          item =>
            item.menuId === Number(menu.id) &&
            item.size === "normal"
        );


      // ถ้ามีรายการเดิมอยู่แล้ว
      // ให้เพิ่มจำนวนแทนการสร้างรายการซ้ำ

      if (existingIndex !== -1) {

        const copy = [...prev];

        const item =
          copy[existingIndex];

        const quantity =
          item.quantity + 1;


        copy[existingIndex] = {

          ...item,

          quantity,

          subtotal:
            item.unitPrice * quantity

        };


        return copy;

      }


      // ถ้ายังไม่มีรายการ
      // ให้สร้างรายการใหม่

      const price =
        Number(menu.price_normal);


      const newItem: OrderItem = {

        menuId:
          Number(menu.id),

        menuName:
          menu.name,

        quantity:
          1,

        size:
          "normal",

        unitPrice:
          price,

        subtotal:
          price,

        noodle:
          null,

        vegetable:
          null,

        note:
          null

      };


      return [
        ...prev,
        newItem
      ];

    });

  };


  // ========================================
  // เพิ่ม / ลดจำนวน
  // ========================================

  const changeEditQuantity = (
    index: number,
    amount: number
  ) => {

    setEditItems(prev => {

      const copy = [...prev];

      const item =
        copy[index];


      if (!item) {

        return prev;

      }


      const quantity =
        item.quantity + amount;


      // ถ้าจำนวนเหลือ 0
      // ให้ลบรายการออก

      if (quantity <= 0) {

        copy.splice(index, 1);

        return copy;

      }


      copy[index] = {

        ...item,

        quantity,

        subtotal:
          item.unitPrice * quantity

      };


      return copy;

    });

  };


  // ========================================
  // เปลี่ยน ธรรมดา / พิเศษ
  // ========================================

  const changeEditSize = (
    index: number,
    size: "normal" | "special"
  ) => {

    setEditItems(prev => {

      const copy = [...prev];

      const item =
        copy[index];


      if (!item) {

        return prev;

      }


      const menu =
        menuList.find(
          m =>
            Number(m.id) ===
            item.menuId
        );


      if (!menu) {

        return prev;

      }


      let price =
        size === "special"
          ? Number(menu.price_special)
          : Number(menu.price_normal);


      // ถ้าไม่มีราคาพิเศษ
      // ให้ใช้ราคาธรรมดา

      if (
        size === "special" &&
        !price
      ) {

        price =
          Number(menu.price_normal);

      }


      copy[index] = {

        ...item,

        size,

        unitPrice:
          price,

        subtotal:
          price *
          item.quantity

      };


      return copy;

    });

  };

  // ========================================
  // เปลี่ยนเส้นก๋วยเตี๋ยว
  // ========================================

  const changeEditNoodle = (
    index: number,
    noodle: string
  ) => {

    setEditItems(prev => {

      const copy = [...prev];

      const item = copy[index];

      if (!item) {
        return prev;
      }

      copy[index] = {
        ...item,
        noodle
      };

      return copy;

    });

  };


  // ========================================
  // บันทึกการแก้ไข Order
  // ========================================

  const saveEditOrder = async () => {

    if (!editingOrder) {

      return;

    }


    if (editItems.length === 0) {

      alert(
        "ออเดอร์ต้องมีอย่างน้อย 1 รายการ"
      );

      return;

    }


    try {

      setSavingEdit(true);


      const response =
        await fetch(
          "/api/orders",
          {

            method: "PATCH",

            headers: {

              "Content-Type":
                "application/json"

            },

            body:
              JSON.stringify({

                id:
                  editingOrder.id,
                
                table_number: editTable,

                items:
                  editItems.map(
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

              })

          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        alert(
          data.error ||
          "แก้ไขออเดอร์ไม่สำเร็จ"
        );

        return;

      }


      alert(
        "แก้ไขออเดอร์เรียบร้อย"
      );


      setEditingOrder(null);

      setEditItems([]);


      await loadOrders();

      window.location.reload();


    } catch (error) {

      console.error(error);

      alert(
        "ระบบผิดพลาด"
      );


    } finally {

      setSavingEdit(false);

    }

  };


  const updateStatus = async (
  orderId: number,
  status: string
) => {
  const response = await fetch("/api/orders", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      orderId,
      status,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    alert(data.error || "เปลี่ยนสถานะไม่สำเร็จ");
    return;
  }

  setOrders((currentOrders) =>
    currentOrders.map((order) =>
      order.id === orderId
        ? { ...order, status: data.order.status }
        : order
    )
  );
};
  useEffect(() => {
    loadOrders();
    loadTables();
  }, []);


  // ========================================
  // FILTER ออเดอร์
  // ========================================

  const getLocalDate = (dateString: string) => {

    const date = new Date(dateString);

    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  };


  const [selectedDate, setSelectedDate] = useState(() => {

    const now = new Date();

    return [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");

  });


  const filteredOrders = orders.filter((order) => {

    // =========================
    // FILTER วันที่
    // =========================

    const dateMatch =
      orderFilter === "all"
        ? true
        : getLocalDate(order.created_at) === selectedDate;


    // =========================
    // FILTER สถานะ
    // =========================

    const statusMatch =
      statusFilter === "all"
        ? true
        : order.status === statusFilter;


    return dateMatch && statusMatch;

  });

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            📋 รายการออเดอร์
          </h1>

          <p className="mt-1 text-gray-500">
            คิวออเดอร์ทั้งหมด
          </p>

          <div className="mt-5 flex gap-3">

            <button
              onClick={() => setOrderFilter("today")}
              className={`
                rounded-xl
                px-5
                py-3
                font-bold
                transition
                ${
                  orderFilter === "today"
                    ? "bg-orange-500 text-white shadow"
                    : "bg-white text-gray-700 shadow"
                }
              `}
            >
              📅 วันนี้
            </button>

            <button
              onClick={() => setOrderFilter("all")}
              className={`
                rounded-xl
                px-5
                py-3
                font-bold
                transition
                ${
                  orderFilter === "all"
                    ? "bg-orange-500 text-white shadow"
                    : "bg-white text-gray-700 shadow"
                }
              `}
            >
              📋 ทั้งหมด
            </button>

          </div>
        </div>



        <div className="mt-5">

          <div className="mb-2 text-sm font-bold text-gray-600">
            สถานะออเดอร์
          </div>

          <div
            className="
              rounded-2xl
              bg-white
              p-2
              shadow
              border
              border-gray-100
            "
          >

            <div className="flex flex-wrap gap-2">

              {/* ทั้งหมด */}
              <button
                onClick={() => setStatusFilter("all")}
                className={`
                  rounded-xl
                  px-4
                  py-2
                  font-bold
                  transition
                  ${
                    statusFilter === "all"
                      ? "bg-orange-500 text-white shadow"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                📋 ทั้งหมด
              </button>


              {/* รอดำเนินการ */}
              <button
                onClick={() => setStatusFilter("pending")}
                className={`
                  rounded-xl
                  px-4
                  py-2
                  font-bold
                  transition
                  ${
                    statusFilter === "pending"
                      ? "bg-orange-500 text-white shadow"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                🕐 รอดำเนินการ
              </button>


              {/* กำลังทำ */}
              <button
                onClick={() => setStatusFilter("preparing")}
                className={`
                  rounded-xl
                  px-4
                  py-2
                  font-bold
                  transition
                  ${
                    statusFilter === "preparing"
                      ? "bg-orange-500 text-white shadow"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                👨‍🍳 กำลังทำ
              </button>


              {/* เสร็จแล้ว */}
              <button
                onClick={() => setStatusFilter("completed")}
                className={`
                  rounded-xl
                  px-4
                  py-2
                  font-bold
                  transition
                  ${
                    statusFilter === "completed"
                      ? "bg-orange-500 text-white shadow"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                ✅ เสร็จแล้ว
              </button>


              {/* ชำระเงินแล้ว */}
              <button
                onClick={() => setStatusFilter("paid")}
                className={`
                  rounded-xl
                  px-4
                  py-2
                  font-bold
                  transition
                  ${
                    statusFilter === "paid"
                      ? "bg-orange-500 text-white shadow"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                💰 ชำระเงินแล้ว
              </button>

            </div>

          </div>

        </div>

        <div className="grid gap-4">
          {filteredOrders.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-center text-gray-400 shadow">
              {orderFilter === "today"
                ? "วันนี้ยังไม่มีออเดอร์"
                : "ยังไม่มีออเดอร์"}
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl bg-white p-5 shadow"
              >
                {/* หัวออเดอร์ */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl font-bold">
                      {order.order_number}
                    </div>

                    <div className="mt-1 text-gray-600">
                      โต๊ะ {order.table_number}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-orange-500">
                      {order.total_amount} บาท
                    </div>

                  {order.status === "cancelled" ? (
                    <div className="mt-1 inline-block rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700">
                      ❌ ยกเลิก
                    </div>
                  ) : (
                    <button
                      onClick={() =>
                        updateStatus(
                          order.id,
                          order.status === "pending"
                            ? "preparing"
                            : "completed"
                        )
                      }
                      className={`mt-1 rounded-full px-3 py-1 text-sm font-bold ${
                        order.status === "pending"
                          ? "bg-gray-100 text-gray-700"
                          : order.status === "preparing"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {order.status === "pending"
                        ? "⏳ รอทำ • กดเพื่อเริ่มทำ"
                        : order.status === "preparing"
                          ? "👨‍🍳 กำลังทำ • กดเพื่อเสร็จ"
                          : "✅ เสร็จแล้ว"}
                    </button>
                  )}

                        {order.status !== "paid" &&
                          order.status !== "cancelled" &&
                          !order.payment_method && (

                          <div className="mt-2 flex gap-2 justify-end">

                            {/* ปุ่มแก้ไข */}
                            <button
                              onClick={() =>
                                openEditOrder(order)
                              }
                              className="
                                rounded-xl
                                bg-blue-500
                                px-4
                                py-2
                                text-sm
                                font-bold
                                text-white
                              "
                            >
                              ✏️ แก้ไขออเดอร์
                            </button>

                            {/* ปุ่มยกเลิก */}
                            <button
                              onClick={async () => {

                                const confirmed = window.confirm(
                                  `ต้องการยกเลิก ${order.order_number} ใช่หรือไม่?`
                                );

                                if (!confirmed) {
                                  return;
                                }

                                await updateStatus(
                                  order.id,
                                  "cancelled"
                                );

                              }}
                              className="
                                rounded-xl
                                bg-red-500
                                px-4
                                py-2
                                text-sm
                                font-bold
                                text-white
                              "
                            >
                              ❌ ยกเลิกบิล
                            </button>

                          </div>

                        )}
                  </div>
                </div>

                {/* รายการอาหาร */}
                <div className="mt-4 space-y-3">
                  {order.items.map((item, index) => (
                    <div
                      key={`${order.id}-${index}`}
                      className="rounded-lg bg-gray-50 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold">
                          {item.menuName}
                        </div>

                        <div className="font-bold">
                          {item.subtotal} บาท
                        </div>
                      </div>

                      <div className="mt-1 text-sm text-gray-600">
                        {item.size === "normal"
                          ? "ธรรมดา"
                          : "พิเศษ"}

                        {item.noodle &&
                          ` • ${item.noodle}`}

                        {item.vegetable &&
                          ` • ${item.vegetable}`}
                      </div>

                      <div className="mt-1 text-sm text-gray-600">
                        จำนวน {item.quantity}
                      </div>

                      {item.note && (
                        <div className="mt-1 text-sm text-red-500">
                          หมายเหตุ: {item.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* เวลา */}
                <div className="mt-4 border-t pt-3 text-sm text-gray-500">
                  {new Date(
                    order.created_at
                  ).toLocaleString("th-TH")}
                </div>
              </div>
            ))
          )}
        </div>
      </div>


      {editingOrder && (

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
      >

        <div
          className="
            w-full
            max-w-lg
            max-h-[90vh]
            overflow-y-auto
            rounded-2xl
            bg-white
            p-6
            shadow-2xl
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
              mb-5
            "
          >

        <div>

          <h2 className="text-2xl font-bold">
            ✏️ แก้ไขออเดอร์
          </h2>

          <p className="mt-1 text-gray-500">
            {editingOrder.order_number}
            {" • "}
            โต๊ะ {editTable || editingOrder.table_number}
          </p>

        </div>


        <button
          onClick={() => {
            setEditingOrder(null);
            setEditItems([]);
          }}
          className="
            text-2xl
            text-gray-400
          "
        >
          ✕
        </button>

      </div>

      {/* เลือกโต๊ะ */}

        <div className="mb-5">

          <label className="mb-2 block text-sm font-bold text-gray-700">
            🪑 โต๊ะ
          </label>

          <select
            value={editTable}
            onChange={(e) => setEditTable(e.target.value)}
            className="
              w-full
              rounded-xl
              border
              bg-white
              px-4
              py-3
              text-base
              font-bold
              outline-none
              focus:border-orange-500
            "
          >
            {tables
              .filter(
                (table) => table.table_number !== "กลับบ้าน"
              )
              .map((table) => (
                <option
                  key={table.id}
                  value={String(table.table_number)}
                  disabled={
                    table.status === "occupied" &&
                    String(table.table_number) !==
                      String(editingOrder?.table_number)
                  }
                >
                  โต๊ะ {table.table_number}
                  {table.status === "occupied"
                    ? " • ไม่ว่าง"
                    : " • ว่าง"}
                </option>
              ))}
          </select>

        </div>



      {/* รายการปัจจุบัน */}

      <div className="space-y-4">

        {editItems.map((item, index) => {

          const menu = menuList.find(
            m => Number(m.id) === Number(item.menuId)
          );

          const isNoodle =
            menu?.category === "ก๋วยเตี๋ยว";

          return (

            <div
              key={index}
              className="
                rounded-2xl
                bg-gray-50
                p-4
                shadow-sm
              "
            >

              {/* ชื่อเมนู + ลบ */}

              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-3
                "
              >

                <div className="min-w-0">

                  <div className="text-lg font-bold">
                    {item.menuName}
                  </div>

                  <div className="mt-1 text-sm text-gray-500">
                    {item.unitPrice.toLocaleString()} บาท
                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    changeEditQuantity(
                      index,
                      -item.quantity
                    )
                  }
                  className="
                    shrink-0
                    text-sm
                    font-bold
                    text-red-500
                  "
                >
                  ลบ
                </button>

              </div>


              {/* ตัวเลือก */}

              <div
                className="
                  mt-4
                  grid
                  grid-cols-1
                  gap-3
                  sm:grid-cols-2
                "
              >

                {/* ธรรมดา / พิเศษ */}

                <select
                  value={item.size || "normal"}
                  onChange={e =>
                    changeEditSize(
                      index,
                      e.target.value as
                        | "normal"
                        | "special"
                    )
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    bg-white
                    px-3
                    py-3
                    text-sm
                    outline-none
                  "
                >

                  <option value="normal">
                    ธรรมดา
                  </option>

                  <option value="special">
                    พิเศษ
                  </option>

                </select>


                {/* เลือกเส้นเฉพาะก๋วยเตี๋ยว */}

                {isNoodle ? (

                  <select
                    value={item.noodle || ""}
                    onChange={e =>
                      changeEditNoodle(
                        index,
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      bg-white
                      px-3
                      py-3
                      text-sm
                      outline-none
                    "
                  >

                    <option value="">
                      เลือกเส้น
                    </option>

                    <option value="เส้นเล็ก">
                      เส้นเล็ก
                    </option>

                    <option value="เส้นหมี่">
                      เส้นหมี่
                    </option>

                    <option value="บะหมี่">
                      บะหมี่
                    </option>

                    <option value="วุ้นเส้น">
                      วุ้นเส้น
                    </option>

                  </select>

                ) : (

                  <div className="hidden sm:block" />

                )}

              </div>


              {/* จำนวน + ราคา */}

              <div
                className="
                  mt-4
                  flex
                  items-center
                  justify-between
                  gap-4
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
                    type="button"
                    onClick={() =>
                      changeEditQuantity(
                        index,
                        -1
                      )
                    }
                    disabled={item.quantity <= 1}
                    className="
                      h-10
                      w-10
                      rounded-full
                      bg-gray-200
                      text-lg
                      font-bold
                      disabled:opacity-40
                    "
                  >
                    −
                  </button>


                  <span
                    className="
                      min-w-[24px]
                      text-center
                      font-bold
                    "
                  >
                    {item.quantity}
                  </span>


                  <button
                    type="button"
                    onClick={() =>
                      changeEditQuantity(
                        index,
                        1
                      )
                    }
                    className="
                      h-10
                      w-10
                      rounded-full
                      bg-green-500
                      text-lg
                      font-bold
                      text-white
                    "
                  >
                    +
                  </button>

                </div>


                <div
                  className="
                    text-right
                    text-lg
                    font-bold
                  "
                >
                  {item.subtotal.toLocaleString()}
                  {" บาท"}
                </div>

              </div>

            </div>

          );

        })}

      </div>


      {/* ยอดรวม */}

      <div
        className="
          mt-6
          border-t
          pt-4
          text-right
        "
      >

        <div className="text-gray-500">
          ยอดรวมใหม่
        </div>

        <div
          className="
            text-3xl
            font-bold
            text-orange-500
          "
        >

          {editItems
            .reduce(
              (sum, item) =>
                sum + item.subtotal,
              0
            )
            .toLocaleString()
          }

          {" บาท"}

        </div>

      </div>


      {/* ปุ่ม */}

      <div
        className="
          mt-5
          grid
          grid-cols-2
          gap-3
        "
      >

        <button
          onClick={() => {
            setEditingOrder(null);
            setEditItems([]);
          }}
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
          disabled={savingEdit}
          onClick={saveEditOrder}
          className="
            rounded-xl
            bg-green-500
            py-3
            font-bold
            text-white
          "
        >
          {savingEdit
            ? "กำลังบันทึก..."
            : "💾 บันทึก"}
        </button>

      </div>

    </div>

  </div>

)}
    </main>
  );
}