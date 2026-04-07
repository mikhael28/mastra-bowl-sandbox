import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const cookingTool = createTool({
  id: 'suggest-recipe',
  description:
    'Suggests a recipe based on available ingredients. Provides a recipe name, ingredients list, and step-by-step instructions.',
  inputSchema: z.object({
    ingredients: z
      .array(z.string())
      .describe('List of available ingredients'),
    cuisine: z
      .string()
      .optional()
      .describe('Preferred cuisine type (e.g. Italian, Mexican, Japanese)'),
    dietaryRestrictions: z
      .array(z.string())
      .optional()
      .describe('Dietary restrictions (e.g. vegetarian, gluten-free, dairy-free)'),
  }),
  outputSchema: z.object({
    recipeName: z.string(),
    servings: z.number(),
    prepTimeMinutes: z.number(),
    cookTimeMinutes: z.number(),
    ingredients: z.array(
      z.object({
        item: z.string(),
        amount: z.string(),
      }),
    ),
    instructions: z.array(z.string()),
    tips: z.string().optional(),
  }),
  execute: async ({ ingredients, cuisine, dietaryRestrictions }) => {
    // This is a deterministic recipe lookup for smoke-testing purposes.
    // In a real scenario, this could call a recipe API or database.
    const ingredientSet = new Set(
      ingredients.map((i) => i.toLowerCase()),
    );

    if (ingredientSet.has('pasta') || ingredientSet.has('spaghetti')) {
      return {
        recipeName: 'Simple Aglio e Olio',
        servings: 2,
        prepTimeMinutes: 5,
        cookTimeMinutes: 15,
        ingredients: [
          { item: 'spaghetti', amount: '200g' },
          { item: 'garlic', amount: '4 cloves, thinly sliced' },
          { item: 'olive oil', amount: '1/4 cup' },
          { item: 'red pepper flakes', amount: '1/2 tsp' },
          { item: 'parsley', amount: '2 tbsp, chopped' },
          { item: 'salt', amount: 'to taste' },
        ],
        instructions: [
          'Bring a large pot of salted water to boil and cook spaghetti according to package directions.',
          'While pasta cooks, heat olive oil in a large skillet over medium-low heat.',
          'Add sliced garlic and red pepper flakes, cook until garlic is golden (about 2 minutes).',
          'Reserve 1/2 cup pasta water, then drain the spaghetti.',
          'Add spaghetti to the skillet and toss with the garlic oil.',
          'Add pasta water a little at a time until the sauce coats the pasta.',
          'Garnish with fresh parsley and serve immediately.',
        ],
        tips: 'Do not burn the garlic - it should be golden, not brown. The pasta water is key to creating a silky sauce.',
      };
    }

    if (ingredientSet.has('rice')) {
      return {
        recipeName: 'Vegetable Fried Rice',
        servings: 3,
        prepTimeMinutes: 10,
        cookTimeMinutes: 10,
        ingredients: [
          { item: 'cooked rice', amount: '3 cups (day-old preferred)' },
          { item: 'soy sauce', amount: '2 tbsp' },
          { item: 'sesame oil', amount: '1 tsp' },
          { item: 'eggs', amount: '2, beaten' },
          { item: 'mixed vegetables', amount: '1 cup, diced' },
          { item: 'green onions', amount: '2, sliced' },
        ],
        instructions: [
          'Heat a wok or large skillet over high heat with a tablespoon of oil.',
          'Scramble the eggs, break into small pieces, and set aside.',
          'Add vegetables to the wok and stir-fry for 2-3 minutes.',
          'Add the rice and break up any clumps, stir-frying for 3-4 minutes.',
          'Add soy sauce and sesame oil, toss everything together.',
          'Return the eggs to the wok and mix through.',
          'Garnish with green onions and serve hot.',
        ],
        tips: 'Day-old rice works best because it is drier and fries better. Make sure the wok is very hot before adding ingredients.',
      };
    }

    // Default recipe
    return {
      recipeName: 'Simple Garden Salad',
      servings: 2,
      prepTimeMinutes: 10,
      cookTimeMinutes: 0,
      ingredients: [
        { item: 'mixed greens', amount: '4 cups' },
        { item: 'cherry tomatoes', amount: '1 cup, halved' },
        { item: 'cucumber', amount: '1, sliced' },
        { item: 'olive oil', amount: '2 tbsp' },
        { item: 'lemon juice', amount: '1 tbsp' },
        { item: 'salt and pepper', amount: 'to taste' },
      ],
      instructions: [
        'Wash and dry all vegetables.',
        'Combine greens, tomatoes, and cucumber in a large bowl.',
        'Whisk together olive oil, lemon juice, salt, and pepper.',
        'Drizzle dressing over salad and toss gently.',
        'Serve immediately.',
      ],
      tips: 'Add any available protein like grilled chicken or chickpeas to make it more filling.',
    };
  },
});
