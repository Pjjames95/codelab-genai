import express from 'express';
const app = express();

import { genkit } from 'genkit';
import { googleAI } from "@genkit-ai/googleai";
import 'dotenv/config';

console.log('Environment variables check:');
console.log('GOOGLE_API_KEY exists:', !!process.env.GOOGLE_API_KEY);
console.log('GOOGLE_API_KEY length:', process.env.GOOGLE_API_KEY?.length);

const ai = genkit({
    plugins: [googleAI({ apiKey: process.env.GOOGLE_API_KEY })],
});

// Define your prompt template
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
        console.log('Request received for animal:', req.query.animal);
        const animal = req.query.animal || 'dog';
        
        console.log('Attempting to generate AI response...');
        const llmResponse = await animalFactsPrompt.generate({
            animal: animal
        });
        
        console.log('AI Response received successfully');
        const html = llmResponse.text;
        console.log('Response length:', html.length);
        
        res.send(html);
        
    } catch (error) {
        console.error('FULL ERROR DETAILS:');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Error code:', error.code);
        console.error('Error status:', error.status);
        
        res.status(500).send(`Internal Server Error: ${error.message}`);
    }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});