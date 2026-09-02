"use client";

import { useEffect, useMemo, useState } from "react";
import { starterMeals } from "@/lib/meals";

type KitchenItem = { name: string };

const STORAGE_KEY = "kaliber-kitchen-inventory";

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

export default function MealReadiness() {
  const [inventory, setInventory] = useState<KitchenItem[]>([]);

  useEffect(() => {
    const sync = () => {
      try {
        setInventory(JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]"));
      } catch {
        setInventory([]);
      }
    };
    sync();
    window.addEventListener("kaliber-inventory-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("kaliber-inventory-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const matches = useMemo(() => starterMeals.map((meal) => {
    const required = meal.ingredients.filter((ingredient) => !ingredient.optional);
    const present = required.filter((ingredient) => hasIngredient(inventory, ingredient.name, ingredient.aliases));
    const missing = required.filter((ingredient) => !hasIngredient(inventory, ingredient.name, ingredient.aliases));
    const percent = required.length ? Math.round((present.length / required.length) * 100) : 100;
    return { meal, required, present, missing, percent };
  }).sort((a, b) => b.percent - a.percent), [inventory]);

  const readyCount = matches.filter((match) => match.missing.length === 0).length;

  return (
    <section className="mealSection shell" id="meals">
      <div className="mealHeading">
        <div>
          <p className="kicker">PRECISION MEALS</p>
          <h2>What can I make?</h2>
        </div>
        <div className="readinessSummary"><strong>{readyCount}</strong><span>favorites ready now</span></div>
      </div>
      <p className="mealIntro">Kaliber compares what is in your kitchen against meals you actually care about. Add ingredients above and readiness updates automatically.</p>
      <div className="mealGrid">
        {matches.map(({ meal, present, missing, required, percent }) => (
          <article className="mealCard" key={meal.id}>
            <div className="mealCardTop"><span>FAVORITE</span><strong>{percent}% READY</strong></div>
            <h3>{meal.name}</h3>
            <p>{meal.description}</p>
            <div className="readinessBar"><span style={{ width: `${percent}%` }} /></div>
            <div className="mealCounts"><span>{present.length}/{required.length} essentials on hand</span><span>{missing.length ? `${missing.length} missing` : "Ready to cook"}</span></div>
            {missing.length > 0 ? (
              <div className="missingIngredients"><small>YOU STILL NEED</small><p>{missing.map((ingredient) => ingredient.name).join(" · ")}</p></div>
            ) : (
              <div className="readyMessage">You have the essentials. Let&apos;s cook.</div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
