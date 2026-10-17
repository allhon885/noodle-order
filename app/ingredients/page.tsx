"use client";

import { useEffect, useState } from "react";

type Ingredient = {
  id: number;
  name: string;
  unit: string;
  cost_per_unit: number | string;
  stock: number | string;
};

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [cost, setCost] = useState("");
  const [stock, setStock] = useState("");

  const loadIngredients = async () => {
    try {
      const response = await fetch("/api/ingredients", {
        cache: "no-store",
      });

      const data = await response.json();

      if (response.ok) {
        setIngredients(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIngredients();
  }, []);

  const addIngredient = async () => {
    if (!name.trim()) {
      alert("กรุณากรอกชื่อวัตถุดิบ");
      return;
    }

    if (!unit.trim()) {
      alert("กรุณากรอกหน่วย");
      return;
    }

    if (!cost) {
      alert("กรุณากรอกต้นทุน");
      return;
    }

    try {
      const response = await fetch("/api/ingredients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          unit,
          cost_per_unit: Number(cost),
          stock: Number(stock || 0),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "เพิ่มวัตถุดิบไม่สำเร็จ");
        return;
      }

      setName("");
      setUnit("");
      setCost("");
      setStock("");
      setShowForm(false);

      await loadIngredients();

      alert("เพิ่มวัตถุดิบเรียบร้อย");
    } catch (error) {
      console.error(error);
      alert("ระบบผิดพลาด");
    }
  };

  const totalStockValue = ingredients.reduce(
    (sum, item) =>
      sum +
      Number(item.cost_per_unit) *
        Number(item.stock),
    0
  );

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">

      {/* HEADER */}
      <div className="mx-auto max-w-6xl">

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">
            🥬 จัดการวัตถุดิบ
          </h1>

          <p className="mt-1 text-gray-500">
            จัดการต้นทุนและจำนวนวัตถุดิบในร้าน
          </p>
        </div>


        {/* SUMMARY */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-2xl bg-white p-5 shadow">
            <div className="text-sm text-gray-500">
              จำนวนวัตถุดิบ
            </div>

            <div className="mt-2 text-3xl font-bold">
              {ingredients.length}
            </div>

            <div className="text-sm text-gray-500">
              รายการ
            </div>
          </div>


          <div className="rounded-2xl bg-white p-5 shadow">
            <div className="text-sm text-gray-500">
              มูลค่าสต็อก
            </div>

            <div className="mt-2 text-3xl font-bold text-orange-500">
              {totalStockValue.toLocaleString()}
            </div>

            <div className="text-sm text-gray-500">
              บาท
            </div>
          </div>


          <div className="flex items-center justify-center rounded-2xl bg-orange-500 p-5 shadow">
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full rounded-xl bg-white px-5 py-3 font-bold text-orange-600 hover:bg-orange-50"
            >
              ＋ เพิ่มวัตถุดิบ
            </button>
          </div>

        </div>


        {/* ADD FORM */}
        {showForm && (
          <div className="mb-6 rounded-2xl bg-white p-5 shadow">

            <h2 className="mb-4 text-xl font-bold">
              ➕ เพิ่มวัตถุดิบ
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div>
                <label className="mb-1 block text-sm font-bold">
                  ชื่อวัตถุดิบ
                </label>

                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="เช่น หมูสด"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>


              <div>
                <label className="mb-1 block text-sm font-bold">
                  หน่วย
                </label>

                <input
                  value={unit}
                  onChange={(e) =>
                    setUnit(e.target.value)
                  }
                  placeholder="เช่น กก."
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>


              <div>
                <label className="mb-1 block text-sm font-bold">
                  ต้นทุนต่อหน่วย
                </label>

                <input
                  type="number"
                  value={cost}
                  onChange={(e) =>
                    setCost(e.target.value)
                  }
                  placeholder="เช่น 120"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>


              <div>
                <label className="mb-1 block text-sm font-bold">
                  จำนวนสต็อก
                </label>

                <input
                  type="number"
                  value={stock}
                  onChange={(e) =>
                    setStock(e.target.value)
                  }
                  placeholder="เช่น 10"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>

            </div>


            <div className="mt-5 flex gap-3">

              <button
                onClick={() => setShowForm(false)}
                className="rounded-xl bg-gray-200 px-5 py-3 font-bold"
              >
                ยกเลิก
              </button>

              <button
                onClick={addIngredient}
                className="rounded-xl bg-green-500 px-6 py-3 font-bold text-white"
              >
                💾 บันทึก
              </button>

            </div>

          </div>
        )}


        {/* INGREDIENT LIST */}
        <div className="rounded-2xl bg-white p-5 shadow">

          <div className="mb-5 flex items-center justify-between">

            <h2 className="text-xl font-bold">
              📦 รายการวัตถุดิบ
            </h2>

            <span className="text-sm text-gray-500">
              {ingredients.length} รายการ
            </span>

          </div>


          {loading ? (

            <div className="py-10 text-center text-gray-400">
              กำลังโหลด...
            </div>

          ) : ingredients.length === 0 ? (

            <div className="rounded-xl bg-gray-50 py-10 text-center text-gray-400">
              ยังไม่มีข้อมูลวัตถุดิบ
            </div>

          ) : (

            <div className="space-y-3">

              {ingredients.map((item) => {

                const stockValue =
                  Number(item.cost_per_unit) *
                  Number(item.stock);

                return (
                  <div
                    key={item.id}
                    className="rounded-xl bg-gray-50 p-4"
                  >

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                      {/* NAME */}
                      <div className="min-w-0">

                        <div className="text-lg font-bold">
                          {item.name}
                        </div>

                        <div className="mt-1 text-sm text-gray-500">
                          หน่วย: {item.unit}
                        </div>

                      </div>


                      {/* COST */}
                      <div>
                        <div className="text-xs text-gray-500">
                          ต้นทุน / หน่วย
                        </div>

                        <div className="font-bold">
                          {Number(
                            item.cost_per_unit
                          ).toLocaleString()}{" "}
                          บาท
                        </div>
                      </div>


                      {/* STOCK */}
                      <div>
                        <div className="text-xs text-gray-500">
                          สต็อก
                        </div>

                        <div className="font-bold">
                          {Number(
                            item.stock
                          ).toLocaleString()}{" "}
                          {item.unit}
                        </div>
                      </div>


                      {/* STOCK VALUE */}
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          มูลค่าสต็อก
                        </div>

                        <div className="font-bold text-orange-500">
                          {stockValue.toLocaleString()}{" "}
                          บาท
                        </div>
                      </div>

                    </div>

                  </div>
                );

              })}

            </div>

          )}

        </div>

      </div>

    </main>
  );
}