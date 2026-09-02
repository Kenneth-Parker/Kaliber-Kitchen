export type MealIngredient = {
  name: string;
  aliases?: string[];
  optional?: boolean;
};

export type Meal = {
  id: string;
  name: string;
  description: string;
  ingredients: MealIngredient[];
  favorite?: boolean;
  source?: "template" | "user";
};

export const exampleMealTemplates: Meal[] = [
  {
    id: "pbj",
    name: "PB&J",
    description: "A simple example of an always-ready favorite.",
    source: "template",
    ingredients: [
      { name: "Bread" },
      { name: "Peanut butter", aliases: ["peanutbutter"] },
      { name: "Jelly", aliases: ["jam", "grape jelly", "strawberry jelly"] },
    ],
  },
  {
    id: "chicken-parm",
    name: "Chicken Parmesan",
    description: "Example meal with protein, sauce, cheese and pasta.",
    source: "template",
    ingredients: [
      { name: "Chicken breast", aliases: ["chicken", "chicken breasts"] },
      { name: "Eggs", aliases: ["egg"] },
      { name: "Breadcrumbs", aliases: ["bread crumbs", "panko"] },
      { name: "Tomato sauce", aliases: ["marinara", "pasta sauce"] },
      { name: "Mozzarella", aliases: ["mozzarella cheese"] },
      { name: "Parmesan", aliases: ["parmesan cheese"] },
      { name: "Pasta", aliases: ["spaghetti", "linguine", "penne"] },
    ],
  },
  {
    id: "french-toast-breakfast",
    name: "French Toast, Bacon & Eggs",
    description: "Example breakfast that can be customized to your household.",
    source: "template",
    ingredients: [
      { name: "Bread" },
      { name: "Eggs", aliases: ["egg"] },
      { name: "Milk" },
      { name: "Cinnamon", optional: true },
      { name: "Vanilla", aliases: ["vanilla extract"], optional: true },
      { name: "Bacon" },
      { name: "Syrup", aliases: ["maple syrup"], optional: true },
    ],
  },
  {
    id: "baked-chicken-rice-beans",
    name: "Baked Chicken, Yellow Rice & Beans",
    description: "Example dinner template with flexible chicken and bean choices.",
    source: "template",
    ingredients: [
      { name: "Chicken", aliases: ["chicken thighs", "chicken legs", "chicken breast"] },
      { name: "Yellow rice" },
      { name: "Beans", aliases: ["pink beans", "pinto beans", "black beans", "kidney beans"] },
      { name: "Onion", aliases: ["onions"] },
      { name: "Garlic" },
      { name: "Oil", aliases: ["olive oil", "vegetable oil"], optional: true },
    ],
  },
];
