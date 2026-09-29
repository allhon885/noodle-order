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
  created_at: string;
  items: OrderItem[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const loadOrders = async () => {
   
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();

      if (response.ok) {
        setOrders(data);
      }
    } catch (error) {
      console.error(error);
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
  }, []);

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
        </div>

        <div className="grid gap-4">
          {orders.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-center text-gray-400 shadow">
              ยังไม่มีออเดอร์
            </div>
          ) : (
            orders.map((order) => (
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

                    <button
                        onClick={() =>
                            updateStatus(
                                order.id,
                                order.status === "pending" ? "preparing" : "completed"
                            )
                            }
                        className="mt-1 rounded-full bg-yellow-100 px-3 py-1 text-sm font-bold text-yellow-700"
                        >
                        {order.status === "pending"
                            ? "รอทำ • กดเพื่อเริ่มทำ"
                            : order.status === "preparing"
                                ? "กำลังทำ • กดเพื่อเสร็จ"
                                : "เสร็จแล้ว"}
                        </button>
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
    </main>
  );
}