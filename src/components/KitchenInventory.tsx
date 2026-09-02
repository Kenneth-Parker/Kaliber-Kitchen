"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type StorageZone = "Pantry" | "Fridge" | "Freezer";

type KitchenItem = {
  id: string;
  name: string;
  quantity: string;
  zone: StorageZone;
  expiresOn?: string;
};

const STORAGE_KEY = "kaliber-kitchen-inventory";

function getUseSoonLabel(expiresOn?: string) {
  if (!expiresOn) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(`${expiresOn}T00:00:00`);
  const diff = Math.ceil((expiry.getTime() - today.getTime()) / 86400000);

  if (diff < 0) return "Expired";
  if (diff === 0) return "Use today";
  if (diff <= 3) return `Use in ${diff} day${diff === 1 ? "" : "s"}`;
  return null;
}

export default function KitchenInventory() {
  const [items, setItems] = useState<KitchenItem[]>([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [zone, setZone] = useState<StorageZone>("Pantry");
  const [expiresOn, setExpiresOn] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {
      setItems([]);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const useSoonCount = useMemo(
    () => items.filter((item) => getUseSoonLabel(item.expiresOn)).length,
    [items]
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    const nextItem: KitchenItem = {
      id: crypto.randomUUID(),
      name: cleanName,
      quantity: quantity.trim() || "1",
      zone,
      expiresOn: expiresOn || undefined,
    };

    setItems((current) => [nextItem, ...current]);
    setName("");
    setQuantity("1");
    setExpiresOn("");
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div className="inventoryApp">
      <form className="inventoryForm" onSubmit={handleSubmit}>
        <div className="formRow formRowWide">
          <label htmlFor="ingredient">Ingredient</label>
          <input
            id="ingredient"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Chicken breast, rice, spinach..."
          />
        </div>

        <div className="formRow">
          <label htmlFor="quantity">Quantity</label>
          <input
            id="quantity"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            placeholder="1"
          />
        </div>

        <div className="formRow">
          <label htmlFor="zone">Location</label>
          <select id="zone" value={zone} onChange={(event) => setZone(event.target.value as StorageZone)}>
            <option>Pantry</option>
            <option>Fridge</option>
            <option>Freezer</option>
          </select>
        </div>

        <div className="formRow">
          <label htmlFor="expires">Use by</label>
          <input
            id="expires"
            type="date"
            value={expiresOn}
            onChange={(event) => setExpiresOn(event.target.value)}
          />
        </div>

        <button className="inventoryAdd" type="submit">Add to Kitchen</button>
      </form>

      <div className="inventoryStats">
        <span><strong>{items.length}</strong> total items</span>
        <span><strong>{useSoonCount}</strong> use soon</span>
      </div>

      <div className="inventoryList">
        {!ready ? (
          <p className="inventoryEmpty">Loading your kitchen...</p>
        ) : items.length === 0 ? (
          <p className="inventoryEmpty">Your kitchen is empty. Add the first ingredient above.</p>
        ) : (
          items.map((item) => {
            const useSoon = getUseSoonLabel(item.expiresOn);
            return (
              <article className="inventoryItem" key={item.id}>
                <div>
                  <div className="inventoryItemTopline">
                    <h3>{item.name}</h3>
                    {useSoon && <span className="useSoonBadge">{useSoon}</span>}
                  </div>
                  <p>{item.quantity} · {item.zone}{item.expiresOn ? ` · ${item.expiresOn}` : ""}</p>
                </div>
                <button type="button" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}>
                  Remove
                </button>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
