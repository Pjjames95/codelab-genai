import express from 'express';
const app = express();

import { genkit } from 'genkit';
import { vertexAI } from '@genkit-ai/vertexai';

const ai = genkit({
    plugins: [
        vertexAI({ location: 'us-central1' }),
    ],
});

app.get('/', async (req, res) => {
    const animal = req.query.animal || 'dog';
    const animalPrompt = ai.prompt('animal-facts');
    const llmResponse = await animalPrompt({animal});
    const html = llmResponse.text;
    res.send(html);
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`codelab-genai: listening on port ${port}`);
});