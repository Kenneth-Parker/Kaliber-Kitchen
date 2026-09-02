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
};

export const starterMeals: Meal[] = [
  {
    id: "pbj",
    name: "PB&J",
    description: "The always-ready classic.",
    favorite: true,
    ingredients: [
      { name: "Bread" },
      { name: "Peanut butter", aliases: ["peanutbutter"] },
      { name: "Jelly", aliases: ["jam", "grape jelly", "strawberry jelly"] },
    ],
  },
  {
    id: "chicken-parm",
    name: "Chicken Parmesan",
    description: "Crispy chicken, sauce, cheese and pasta.",
    favorite: true,
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
    description: "A full breakfast built from kitchen staples.",
    favorite: true,
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
    description: "Baked chicken with yellow rice, beans, onions and garlic.",
    favorite: true,
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
