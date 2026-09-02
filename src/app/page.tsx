const features = [
  {
    eyebrow: "Inventory",
    title: "Know what you have.",
    copy: "Keep your pantry, refrigerator, and freezer in one simple kitchen inventory.",
  },
  {
    eyebrow: "Precision Meals",
    title: "Cook from what is already home.",
    copy: "Turn available ingredients into useful meal ideas instead of another forgotten grocery run.",
  },
  {
    eyebrow: "Waste Less",
    title: "Use the right food first.",
    copy: "Prioritize ingredients that should be eaten soon and build meals around them.",
  },
];

export default function Home() {
  return (
    <main>
      <nav className="nav shell">
        <a className="brand" href="#top" aria-label="Kaliber Kitchen home">
          <span className="brandMark">K</span>
          <span>KALIBER KITCHEN</span>
        </a>
        <a className="navAction" href="#kitchen">Enter Kitchen</a>
      </nav>

      <section className="hero shell" id="top">
        <p className="kicker">COOKING WITH PRECISION.</p>
        <h1>Your kitchen already knows what&apos;s for dinner.</h1>
        <p className="heroCopy">
          Kaliber Kitchen helps you use what you have, rescue what should be eaten next,
          and turn everyday ingredients into intentional meals.
        </p>
        <div className="heroActions">
          <a className="primaryButton" href="#kitchen">Open My Kitchen</a>
          <a className="textLink" href="#how">See how it works →</a>
        </div>
        <div className="precisionLine" aria-hidden="true"><span /></div>
      </section>

      <section className="featureGrid shell" id="how">
        {features.map((feature, index) => (
          <article className="featureCard" key={feature.title}>
            <div className="featureNumber">0{index + 1}</div>
            <p>{feature.eyebrow}</p>
            <h2>{feature.title}</h2>
            <span>{feature.copy}</span>
          </article>
        ))}
      </section>

      <section className="kitchen shell" id="kitchen">
        <div>
          <p className="kicker">YOUR KITCHEN</p>
          <h2>Start with what&apos;s on hand.</h2>
          <p>Add ingredients manually today. Camera-assisted inventory and smarter expiration intelligence are on the roadmap.</p>
        </div>
        <div className="inventoryPreview">
          <div className="inventoryTop"><span>Kitchen Inventory</span><strong>0 items</strong></div>
          <button type="button">+ Add Ingredient</button>
          <p>Your pantry is ready for its first item.</p>
        </div>
      </section>

      <footer className="shell footer">
        <span>Kaliber Kitchen</span>
        <span>Use what you have. Waste less. Cook with precision.</span>
      </footer>
    </main>
  );
}
