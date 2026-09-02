"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { exampleMealTemplates, Meal } from "@/lib/meals";

type KitchenItem = { name: string };

const INVENTORY_KEY = "kaliber-kitchen-inventory";
const MEALS_KEY = "kaliber-kitchen-meals";

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

  const matches = useMemo(() => meals.map((meal) => {
    const required = meal.ingredients.filter((ingredient) => !ingredient.optional);
    const present = required.filter((ingredient) => hasIngredient(inventory, ingredient.name, ingredient.aliases));
    const missing = required.filter((ingredient) => !hasIngredient(inventory, ingredient.name, ingredient.aliases));
    const percent = required.length ? Math.round((present.length / required.length) * 100) : 100;
    return { meal, required, present, missing, percent };
  }).sort((a, b) => b.percent - a.percent), [inventory, meals]);

  const readyCount = matches.filter((match) => match.missing.length === 0).length;

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

  return (
    <section className="mealSection shell" id="meals">
      <div className="mealHeading">
        <div><p className="kicker">PRECISION MEALS</p><h2>What can I make?</h2></div>
        <div className="readinessSummary"><strong>{readyCount}</strong><span>meals ready now</span></div>
      </div>
      <p className="mealIntro">These meals belong to the user. The examples below are only starting points — customize them, remove them, or create your own household meals.</p>

      <div className="mealBuilder">
        <div>
          <small>{editingId ? "EDIT MY MEAL" : "CREATE MY MEAL"}</small>
          <h3>{editingId ? "Make it yours." : "Add a meal you actually eat."}</h3>
        </div>
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
    </section>
  );
}
