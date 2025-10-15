import express from 'express';
const app = express();

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { vertexAI } from '@genkit-ai/vertexai';

// Initialize Genkit with proper configuration
const ai = genkit({
  plugins: [
    // Choose one of these, not both
    vertexAI({ location: 'us-central1' }),
    // OR for Google AI:
    // googleAI({ apiKey: process.env.GOOGLE_API_KEY }),
  ],
  model: 'gemini-1.5-flash', // Specify the model directly
});

app.get('/', async (req, res) => {
  try {
    const animal = req.query.animal || 'dog';
    const prompt = `Give me 10 fun facts about ${animal}. Return this as html without backticks.`;
    
    const llmResponse = await ai.generate({
      model: 'gemini-1.5-flash', // Use string identifier
      prompt: prompt,
    });
    
    const html = llmResponse.text;
    res.send(html);
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).send('Error generating content');
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`codelab-genai: listening on port ${port}`);
});