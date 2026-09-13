import KitchenInventory from "@/components/KitchenInventory";
import MealReadiness from "@/components/MealReadiness";
import ScanKitchen from "@/components/ScanKitchen";

const features = [
  { eyebrow: "Scan Kitchen", title: "Capture what is actually there.", copy: "Start with a fridge, pantry, or freezer photo, confirm the items, and feed them into your kitchen inventory." },
  { eyebrow: "Precision Meals", title: "Cook from what is already home.", copy: "Turn available ingredients into useful meal ideas instead of another forgotten grocery run." },
  { eyebrow: "Smart Shopping", title: "Buy what unlocks more meals.", copy: "See which missing ingredients matter most and build a shopping list around the meals you actually want." },
];

export default function Home() {
  return <main>
    <nav className="nav shell"><a className="brand" href="#top" aria-label="Kaliber Kitchen home"><span className="brandMark">K</span><span>KALIBER KITCHEN</span></a><div className="navLinks"><a href="#scan">Scan</a><a href="#kitchen">Kitchen</a><a href="#meals">Meals</a><a href="#shopping">Shop</a></div></nav>
    <section className="hero shell" id="top"><p className="kicker">COOKING WITH PRECISION.</p><h1>Your kitchen already knows what&apos;s for dinner.</h1><p className="heroCopy">Kaliber Kitchen helps you capture what you have, rescue what should be eaten next, and turn everyday ingredients into intentional meals.</p><div className="heroActions"><a className="primaryButton" href="#scan">Scan My Kitchen</a><a className="textLink" href="#meals">What can I make? →</a></div><div className="precisionLine" aria-hidden="true"><span /></div></section>
    <section className="featureGrid shell" id="how">{features.map((feature,index)=><article className="featureCard" key={feature.title}><div className="featureNumber">0{index+1}</div><p>{feature.eyebrow}</p><h2>{feature.title}</h2><span>{feature.copy}</span></article>)}</section>
    <ScanKitchen />
    <section className="kitchen shell" id="kitchen"><div className="kitchenIntro"><p className="kicker">YOUR KITCHEN</p><h2>Start with what&apos;s on hand.</h2><p>Scan or manually add ingredients, place them in the pantry, fridge, or freezer, and give them a use-by date when you know it. Kaliber uses that inventory to calculate which of your meals are ready and which missing ingredients create the most value.</p></div><KitchenInventory /></section>
    <MealReadiness />
    <footer className="shell footer"><span>Kaliber Kitchen</span><span>Scan → Know → Cook → Shop</span></footer>
  </main>;
}
