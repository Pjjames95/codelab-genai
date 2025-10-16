import express from 'express';
const app = express();

import { genkit } from 'genkit';
import { googleAI } from "@genkit-ai/googleai";
import 'dotenv/config';

const ai = genkit({
    plugins: [googleAI({ apiKey: process.env.GOOGLE_API_KEY })],
});

// Define your prompt template FIRST
const animalFactsPrompt = ai.definePrompt({
    name: 'animal-facts',
    input: {
        schema: {
            animal: 'string'
        }
    },
    model: 'gemini-1.5-flash',
    prompt: (input) => `Give me 10 fun facts about ${input.animal}. Return this as HTML without backticks.`
});

app.get('/', async (req, res) => {
    try {
        const animal = req.query.animal || 'dog';
        
        // Use the defined prompt template
        const llmResponse = await animalFactsPrompt.generate({
            animal: animal
        });
        
        const html = llmResponse.text;
        res.send(html);
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(`Internal Server Error: ${error.message}`);
    }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});