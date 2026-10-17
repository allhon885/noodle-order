"use client";

import { useEffect, useState } from "react";

type Menu = {
  id: number;
  name: string;
  price_normal: number;
  price_special?: number;
};

type Ingredient = {
  id: number;
  name: string;
  unit: string;
  cost_per_unit: number;
  stock: number;
};

export default function RecipesPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  const [selectedMenu, setSelectedMenu] = useState<number | null>(null);
  const [selectedIngredient, setSelectedIngredient] = useState<number | null>(
    null
  );

  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [menuRes, ingredientRes] = await Promise.all([
        fetch("/api/menu/manage"),
        fetch("/api/ingredients"),
      ]);

      const menuData = await menuRes.json();
      const ingredientData = await ingredientRes.json();

      setMenus(Array.isArray(menuData) ? menuData : menuData.menus || []);
      setIngredients(
        Array.isArray(ingredientData)
          ? ingredientData
          : ingredientData.ingredients || []
      );
    } catch (error) {
      console.error(error);
    }
  }

  const menu = menus.find((item) => item.id === selectedMenu);
  const ingredient = ingredients.find(
    (item) => item.id === selectedIngredient
  );

  const estimatedCost =
    ingredient && quantity
      ? Number(quantity) * Number(ingredient.cost_per_unit)
      : 0;

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-800">
          🍜 จัดสูตรอาหาร
        </h1>

        <p className="mt-2 text-gray-500">
          กำหนดวัตถุดิบและปริมาณที่ใช้ในแต่ละเมนู
        </p>

        {/* เลือกเมนู */}
        <section className="mt-6 rounded-2xl bg-white p-5 shadow">
          <h2 className="text-xl font-bold">1. เลือกเมนู</h2>

          <select
            value={selectedMenu ?? ""}
            onChange={(e) =>
              setSelectedMenu(e.target.value ? Number(e.target.value) : null)
            }
            className="mt-3 w-full rounded-xl border border-gray-300 px-4 py-3"
          >
            <option value="">-- เลือกเมนู --</option>

            {menus.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} — {item.price_normal} บาท
              </option>
            ))}
          </select>
        </section>

        {/* เพิ่มวัตถุดิบ */}
        <section className="mt-5 rounded-2xl bg-white p-5 shadow">
          <h2 className="text-xl font-bold">2. เพิ่มวัตถุดิบ</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <select
              value={selectedIngredient ?? ""}
              onChange={(e) =>
                setSelectedIngredient(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="rounded-xl border border-gray-300 px-4 py-3"
            >
              <option value="">-- เลือกวัตถุดิบ --</option>

              {ingredients.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.unit})
                </option>
              ))}
            </select>

            <input
              type="number"
              min="0"
              step="0.001"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="ปริมาณที่ใช้"
              className="rounded-xl border border-gray-300 px-4 py-3"
            />

            <div className="rounded-xl bg-orange-50 px-4 py-3">
              <div className="text-sm text-gray-500">
                ต้นทุนโดยประมาณ
              </div>

              <div className="text-xl font-bold text-orange-600">
                {estimatedCost.toFixed(2)} บาท
              </div>
            </div>
          </div>

          {ingredient && (
            <div className="mt-3 text-sm text-gray-500">
              ต้นทุน {ingredient.cost_per_unit} บาท / {ingredient.unit}
            </div>
          )}

          <button
            disabled={!selectedMenu || !selectedIngredient || !quantity}
            className="mt-5 rounded-xl bg-orange-500 px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            ＋ เพิ่มวัตถุดิบในสูตร
          </button>
        </section>

        {/* สูตรอาหาร */}
        <section className="mt-5 rounded-2xl bg-white p-5 shadow">
          <h2 className="text-xl font-bold">
            3. สูตรอาหาร
          </h2>

          {!menu ? (
            <div className="mt-4 rounded-xl bg-gray-50 p-8 text-center text-gray-400">
              กรุณาเลือกเมนูก่อน
            </div>
          ) : (
            <>
              <div className="mt-4 rounded-xl bg-orange-50 p-4">
                <div className="text-sm text-gray-500">
                  เมนูที่กำลังจัดสูตร
                </div>

                <div className="text-2xl font-bold">
                  {menu.name}
                </div>

                <div className="mt-1 text-gray-600">
                  ราคาขาย {menu.price_normal} บาท
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-gray-50 p-6 text-center text-gray-400">
                ยังไม่มีวัตถุดิบในสูตร
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}