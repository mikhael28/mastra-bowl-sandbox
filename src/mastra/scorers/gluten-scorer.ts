import { z } from 'zod';
import { createScorer } from '@mastra/core/evals';
import {
  getAssistantMessageFromRunOutput,
} from '@mastra/evals/scorers/utils';

const GLUTEN_INSTRUCTIONS =
  'You are a Chef that identifies if recipes contain gluten. You are thorough and check for all common gluten sources including wheat, barley, rye, flour, pasta, bread, couscous, and soy sauce.';

export const glutenCheckerScorer = createScorer({
  id: 'gluten-checker-scorer',
  name: 'Gluten Checker',
  description: 'Checks if the agent output contains any gluten-containing ingredients',
  type: 'agent',
  judge: {
    model: 'openai/gpt-5-mini',
    instructions: GLUTEN_INSTRUCTIONS,
  },
})
  .analyze({
    description: 'Analyze the output for gluten-containing ingredients',
    outputSchema: z.object({
      isGlutenFree: z.boolean(),
      glutenSources: z.array(z.string()),
    }),
    createPrompt: ({ run }) => {
      const output = getAssistantMessageFromRunOutput(run.output) || '';
      return `Check if this recipe is gluten-free.

Check for:
- Wheat
- Barley
- Rye
- Common sources like flour, pasta, bread, couscous, soy sauce, breadcrumbs

Example with gluten:
"Mix flour and water to make dough"
Response: {
  "isGlutenFree": false,
  "glutenSources": ["flour"]
}

Example gluten-free:
"Mix rice, beans, and vegetables"
Response: {
  "isGlutenFree": true,
  "glutenSources": []
}

Recipe to analyze:
${output}

Return your response in this format:
{
  "isGlutenFree": boolean,
  "glutenSources": ["list ingredients containing gluten"]
}`;
    },
  })
  .generateScore(({ results }) => {
    return results.analyzeStepResult.isGlutenFree ? 1 : 0;
  })
  .generateReason({
    description: 'Generate a reason for the gluten score',
    createPrompt: ({ results }) => {
      const { isGlutenFree, glutenSources } = results.analyzeStepResult;
      return `Explain why this recipe is${isGlutenFree ? '' : ' not'} gluten-free.

${glutenSources.length > 0 ? `Sources of gluten: ${glutenSources.join(', ')}` : 'No gluten-containing ingredients found'}

Return your response in this format:
"This recipe is [gluten-free/contains gluten] because [explanation]"`;
    },
  });
