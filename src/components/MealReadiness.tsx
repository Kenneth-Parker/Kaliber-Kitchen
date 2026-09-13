"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { exampleMealTemplates, Meal } from "@/lib/meals";

type KitchenItem = { name: string };

type ShoppingItem = {
  name: string;
  unlocks: number;
  checked: boolean;
};

const INVENTORY_KEY = "kaliber-kitchen-inventory";
const MEALS_KEY = "kaliber-kitchen-meals";
const SHOPPING_KEY = "kaliber-kitchen-shopping";

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function hasIngredient(inventory: KitchenItem[], name: string, aliases: string[] = []) {
  const candidates = [name, ...aliases].map(normalize);
  return inventory.some((item) => {
    const itemName = normalize(item.name);
    return candidates.some((candidate) => itemName.includes(candidate) || candidate.includes(itemName));
  });
}

function parseIngredients(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean).map((name) => ({ name }));
}

export default function MealReadiness() {
  const [inventory, setInventory] = useState<KitchenItem[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [shopping, setShopping] = useState<ShoppingItem[]>([]);
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const syncInventory = () => {
      try { setInventory(JSON.parse(window.localStorage.getItem(INVENTORY_KEY) || "[]")); }
      catch { setInventory([]); }
    };
    syncInventory();
    window.addEventListener("kaliber-inventory-updated", syncInventory);
    window.addEventListener("storage", syncInventory);

    try {
      const savedMeals = window.localStorage.getItem(MEALS_KEY);
      if (savedMeals) setMeals(JSON.parse(savedMeals));
      else setMeals(exampleMealTemplates.map((meal) => ({ ...meal, id: `user-${meal.id}`, source: "user", favorite: true })));

      const savedShopping = window.localStorage.getItem(SHOPPING_KEY);
      if (savedShopping) setShopping(JSON.parse(savedShopping));
    } catch {
      setMeals(exampleMealTemplates.map((meal) => ({ ...meal, id: `user-${meal.id}`, source: "user", favorite: true })));
    } finally {
      setReady(true);
    }

    return () => {
      window.removeEventListener("kaliber-inventory-updated", syncInventory);
      window.removeEventListener("storage", syncInventory);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(MEALS_KEY, JSON.stringify(meals));
  }, [meals, ready]);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(SHOPPING_KEY, JSON.stringify(shopping));
  }, [shopping, ready]);

  const matches = useMemo(() => meals.map((meal) => {
    const required = meal.ingredients.filter((ingredient) => !ingredient.optional);
    const present = required.filter((ingredient) => hasIngredient(inventory, ingredient.name, ingredient.aliases));
    const missing = required.filter((ingredient) => !hasIngredient(inventory, ingredient.name, ingredient.aliases));
    const percent = required.length ? Math.round((present.length / required.length) * 100) : 100;
    return { meal, required, present, missing, percent };
  }).sort((a, b) => b.percent - a.percent), [inventory, meals]);

  const readyCount = matches.filter((match) => match.missing.length === 0).length;

  const smartShopping = useMemo(() => {
    const ingredientMap = new Map<string, { name: string; mealIds: Set<string> }>();

    matches.forEach(({ meal, missing }) => {
      missing.forEach((ingredient) => {
        const key = normalize(ingredient.name);
        const current = ingredientMap.get(key) || { name: ingredient.name, mealIds: new Set<string>() };
        current.mealIds.add(meal.id);
        ingredientMap.set(key, current);
      });
    });

    const ranked = Array.from(ingredientMap.values())
      .map((item) => ({ name: item.name, unlocks: item.mealIds.size }))
      .sort((a, b) => b.unlocks - a.unlocks || a.name.localeCompare(b.name));

    const top = ranked.slice(0, 5);
    const planned = new Set(top.map((item) => normalize(item.name)));
    const newlyReady = matches.filter(({ missing }) => missing.length > 0 && missing.every((ingredient) => planned.has(normalize(ingredient.name)))).length;

    return { ranked, top, newlyReady };
  }, [matches]);

  function submitMeal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    const parsed = parseIngredients(ingredients);
    if (!cleanName || parsed.length === 0) return;

    if (editingId) {
      setMeals((current) => current.map((meal) => meal.id === editingId ? { ...meal, name: cleanName, ingredients: parsed, source: "user" } : meal));
    } else {
      setMeals((current) => [...current, { id: crypto.randomUUID(), name: cleanName, description: "My custom meal", ingredients: parsed, favorite: true, source: "user" }]);
    }

    setName("");
    setIngredients("");
    setEditingId(null);
  }

  function editMeal(meal: Meal) {
    setEditingId(meal.id);
    setName(meal.name);
    setIngredients(meal.ingredients.filter((ingredient) => !ingredient.optional).map((ingredient) => ingredient.name).join(", "));
  }

  function addTemplate(template: Meal) {
    setMeals((current) => [...current, { ...template, id: crypto.randomUUID(), source: "user", favorite: true }]);
  }

  function addToShoppingList(item: { name: string; unlocks: number }) {
    setShopping((current) => {
      if (current.some((existing) => normalize(existing.name) === normalize(item.name))) return current;
      return [...current, { ...item, checked: false }];
    });
  }

  function addSmartBundle() {
    setShopping((current) => {
      const next = [...current];
      smartShopping.top.forEach((item) => {
        if (!next.some((existing) => normalize(existing.name) === normalize(item.name))) next.push({ ...item, checked: false });
      });
      return next;
    });
  }

  return (
    <section className="mealSection shell" id="meals">
      <div className="mealHeading">
        <div><p className="kicker">PRECISION MEALS</p><h2>What can I make?</h2></div>
        <div className="readinessSummary"><strong>{readyCount}</strong><span>meals ready now</span></div>
      </div>
      <p className="mealIntro">These meals belong to the user. The examples below are only starting points — customize them, remove them, or create your own household meals.</p>

      <div className="mealBuilder">
        <div><small>{editingId ? "EDIT MY MEAL" : "CREATE MY MEAL"}</small><h3>{editingId ? "Make it yours." : "Add a meal you actually eat."}</h3></div>
        <form onSubmit={submitMeal}>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Meal name" />
          <input value={ingredients} onChange={(event) => setIngredients(event.target.value)} placeholder="Ingredients, separated by commas" />
          <button type="submit">{editingId ? "Save Meal" : "Add Meal"}</button>
          {editingId && <button className="quietButton" type="button" onClick={() => { setEditingId(null); setName(""); setIngredients(""); }}>Cancel</button>}
        </form>
      </div>

      <div className="templateStrip">
        <div><small>START FROM AN EXAMPLE</small><p>Use one as a base, then edit it to match how your household cooks.</p></div>
        <div className="templateActions">{exampleMealTemplates.map((template) => <button key={template.id} type="button" onClick={() => addTemplate(template)}>+ {template.name}</button>)}</div>
      </div>

      <div className="mealGrid">
        {matches.map(({ meal, present, missing, required, percent }) => (
          <article className="mealCard" key={meal.id}>
            <div className="mealCardTop"><span>MY MEAL</span><strong>{percent}% READY</strong></div>
            <h3>{meal.name}</h3>
            <p>{meal.description}</p>
            <div className="readinessBar"><span style={{ width: `${percent}%` }} /></div>
            <div className="mealCounts"><span>{present.length}/{required.length} essentials on hand</span><span>{missing.length ? `${missing.length} missing` : "Ready to cook"}</span></div>
            {missing.length > 0 ? <div className="missingIngredients"><small>YOU STILL NEED</small><p>{missing.map((ingredient) => ingredient.name).join(" · ")}</p></div> : <div className="readyMessage">You have the essentials. Let&apos;s cook.</div>}
            <div className="mealCardActions"><button type="button" onClick={() => editMeal(meal)}>Edit</button><button type="button" onClick={() => setMeals((current) => current.filter((item) => item.id !== meal.id))}>Remove</button></div>
          </article>
        ))}
      </div>

      <section className="smartShop" id="shopping">
        <div className="smartShopHeading">
          <div><p className="kicker">SMART SHOPPING</p><h2>Buy with a purpose.</h2></div>
          {smartShopping.top.length > 0 && <button type="button" onClick={addSmartBundle}>Add smart bundle</button>}
        </div>
        {smartShopping.top.length === 0 ? (
          <div className="smartShopEmpty">Your current meals are fully covered. Nothing essential to add.</div>
        ) : (
          <>
            <div className="unlockCallout"><strong>Buy these {smartShopping.top.length} ingredients</strong><span>→ unlock {smartShopping.newlyReady} additional meal{smartShopping.newlyReady === 1 ? "" : "s"}</span></div>
            <div className="smartShopGrid">
              {smartShopping.ranked.map((item) => (
                <article key={item.name}>
                  <div><strong>{item.name}</strong><span>Needed by {item.unlocks} meal{item.unlocks === 1 ? "" : "s"}</span></div>
                  <button type="button" onClick={() => addToShoppingList(item)}>+ List</button>
                </article>
              ))}
            </div>
          </>
        )}

        <div className="shoppingList">
          <div><small>MY SHOPPING LIST</small><span>{shopping.filter((item) => !item.checked).length} remaining</span></div>
          {shopping.length === 0 ? <p>No items yet. Add missing ingredients above.</p> : shopping.map((item) => (
            <label key={item.name} className={item.checked ? "checked" : ""}>
              <input type="checkbox" checked={item.checked} onChange={() => setShopping((current) => current.map((entry) => normalize(entry.name) === normalize(item.name) ? { ...entry, checked: !entry.checked } : entry))} />
              <span>{item.name}</span>
              <button type="button" onClick={(event) => { event.preventDefault(); setShopping((current) => current.filter((entry) => normalize(entry.name) !== normalize(item.name))); }}>Remove</button>
            </label>
          ))}
        </div>
      </section>
    </section>
  );
}
