import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const calculatorAdd = createTool({
  id: 'calculator-add',
  description: 'Adds two numbers together and returns the result.',
  inputSchema: z.object({
    a: z.number().describe('First number'),
    b: z.number().describe('Second number'),
  }),
  outputSchema: z.object({
    result: z.number(),
    expression: z.string(),
  }),
  execute: async ({ a, b }) => ({
    result: a + b,
    expression: `${a} + ${b} = ${a + b}`,
  }),
});

export const calculatorMultiply = createTool({
  id: 'calculator-multiply',
  description: 'Multiplies two numbers together and returns the result.',
  inputSchema: z.object({
    a: z.number().describe('First number'),
    b: z.number().describe('Second number'),
  }),
  outputSchema: z.object({
    result: z.number(),
    expression: z.string(),
  }),
  execute: async ({ a, b }) => ({
    result: a * b,
    expression: `${a} × ${b} = ${a * b}`,
  }),
});

export const calculatorDivide = createTool({
  id: 'calculator-divide',
  description:
    'Divides the first number by the second number and returns the result.',
  inputSchema: z.object({
    a: z.number().describe('Numerator (number to divide)'),
    b: z.number().describe('Denominator (number to divide by)'),
  }),
  outputSchema: z.object({
    result: z.number(),
    expression: z.string(),
  }),
  execute: async ({ a, b }) => {
    if (b === 0) {
      throw new Error('Cannot divide by zero');
    }
    return {
      result: a / b,
      expression: `${a} ÷ ${b} = ${a / b}`,
    };
  },
});

export const calculatorPower = createTool({
  id: 'calculator-power',
  description: 'Raises the base to the given exponent and returns the result.',
  inputSchema: z.object({
    base: z.number().describe('The base number'),
    exponent: z.number().describe('The exponent'),
  }),
  outputSchema: z.object({
    result: z.number(),
    expression: z.string(),
  }),
  execute: async ({ base, exponent }) => ({
    result: Math.pow(base, exponent),
    expression: `${base}^${exponent} = ${Math.pow(base, exponent)}`,
  }),
});
