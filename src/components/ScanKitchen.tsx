"use client";

import { ChangeEvent, FormEvent, useState } from "react";

type StorageZone = "Pantry" | "Fridge" | "Freezer";
type KitchenItem = { id: string; name: string; quantity: string; zone: StorageZone };
const STORAGE_KEY = "kaliber-kitchen-inventory";

export default function ScanKitchen() {
  const [photoName, setPhotoName] = useState("");
  const [zone, setZone] = useState<StorageZone>("Fridge");
  const [draftItem, setDraftItem] = useState("");
  const [confirmedItems, setConfirmedItems] = useState<string[]>([]);
  const [savedCount, setSavedCount] = useState(0);

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoName(file.name || "Kitchen photo selected");
    setConfirmedItems([]);
    setSavedCount(0);
  }

  function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = draftItem.trim();
    if (!clean) return;
    setConfirmedItems((current) => current.some((item) => item.toLowerCase() === clean.toLowerCase()) ? current : [...current, clean]);
    setDraftItem("");
  }

  function saveToKitchen() {
    if (!confirmedItems.length) return;
    let current: KitchenItem[] = [];
    try { current = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]"); } catch { current = []; }
    const additions = confirmedItems.map((name) => ({ id: crypto.randomUUID(), name, quantity: "1", zone }));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...additions, ...current]));
    window.dispatchEvent(new Event("kaliber-inventory-updated"));
    setSavedCount(additions.length);
    setConfirmedItems([]);
  }

  return (
    <section className="scanSection shell" id="scan">
      <div className="scanIntro">
        <p className="kicker">SCAN KITCHEN</p>
        <h2>Point. Confirm. Cook.</h2>
        <p>Select a kitchen photo, confirm the foods you see, and add them directly to inventory. Automatic object detection will plug into this confirmation list next.</p>
      </div>
      <div className="scanWorkspace">
        <div className="scanCapture">
          <div className="scanPreview"><strong>{photoName || "No kitchen photo selected"}</strong><span>Fridge, pantry, and freezer photos are supported.</span></div>
          <label className="scanButton">Choose Kitchen Photo<input type="file" accept="image/*" onChange={handlePhoto} /></label>
          <label className="scanZone">Scanning<select value={zone} onChange={(event) => setZone(event.target.value as StorageZone)}><option>Fridge</option><option>Pantry</option><option>Freezer</option></select></label>
        </div>
        <div className="scanConfirm">
          <div className="scanConfirmHeader"><div><small>CONFIRM WHAT YOU SEE</small><h3>{photoName ? "Build the detected list." : "Choose a photo first."}</h3></div><span>{confirmedItems.length} items</span></div>
          <p className="scanNote">This foundation keeps the user in control before inventory changes. For now, confirm item names manually; automatic detection can populate this same list later.</p>
          <form className="scanItemForm" onSubmit={addItem}><input value={draftItem} onChange={(event) => setDraftItem(event.target.value)} placeholder="Milk, eggs, chicken..." disabled={!photoName} /><button type="submit" disabled={!photoName}>+ Add</button></form>
          <div className="scanChips">{confirmedItems.length === 0 ? <p>No confirmed items yet.</p> : confirmedItems.map((item) => <button key={item} type="button" onClick={() => setConfirmedItems((current) => current.filter((name) => name !== item))}>{item} ×</button>)}</div>
          <button className="scanSave" type="button" onClick={saveToKitchen} disabled={confirmedItems.length === 0}>Add confirmed items to My Kitchen</button>
          {savedCount > 0 && <p className="scanSuccess">Added {savedCount} item{savedCount === 1 ? "" : "s"} to your kitchen.</p>}
        </div>
      </div>
    </section>
  );
}
