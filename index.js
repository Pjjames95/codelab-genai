import express from 'express';
import { googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';
import 'dotenv/config';

const app = express();
const ai = genkit({
  plugins: [googleAI()],
});

// This will now work because the prompt file exists
const storyGeneratorPrompt = ai.prompt('story-generator');

app.get('/', async (req, res) => {
  try {
    const character = req.query.character || 'a friendly robot';
    const setting = req.query.setting || 'a magical library';
    
    console.log('Generating story with parameters:');
    console.log(`Character: ${character}`);
    console.log(`Setting: ${setting}`);

    const response = await storyGeneratorPrompt({
      character: character,
      setting: setting
    });

    const html = `
      <html>
        <head>
          <title>Story Generator</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .story { background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .form { margin: 20px 0; }
            input, button { padding: 10px; margin: 5px; }
          </style>
        </head>
        <body>
          <h1>AI Story Generator</h1>
          
          <div class="form">
            <form method="GET">
              <input type="text" name="character" placeholder="Character" value="${character}">
              <input type="text" name="setting" placeholder="Setting" value="${setting}">
              <button type="submit">Generate Story</button>
            </form>
          </div>

          <div class="story">
            <h2>Story: ${character} in ${setting}</h2>
            <p>${response.text.replace(/\n/g, '<br>')}</p>
          </div>

          <h3>Try these examples:</h3>
          <ul>
            <li><a href="/?character=a curious cat&setting=a space station">Curious Cat in Space Station</a></li>
            <li><a href="/?character=a young wizard&setting=a bustling marketplace">Young Wizard in Marketplace</a></li>
            <li><a href="/?character=a brave explorer&setting=an underwater city">Brave Explorer in Underwater City</a></li>
          </ul>
        </body>
      </html>
    `;

    res.send(html);

  } catch (error) {
    console.error('Error generating story:', error);
    res.status(500).send(`
      <html>
        <body>
          <h1>Error</h1>
          <p>${error.message}</p>
          <a href="/">Try Again</a>
        </body>
      </html>
    `);
  }
});

// API endpoint for JSON responses
app.get('/api/story', async (req, res) => {
  try {
    const { character = 'a friendly robot', setting = 'a magical library' } = req.query;

    const response = await storyGeneratorPrompt({
      character: character,
      setting: setting
    });

    res.json({
      success: true,
      character,
      setting,
      story: response.text
    });

  } catch (error) {
    console.error('Error generating story:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Batch stories endpoint
app.get('/api/batch-stories', async (req, res) => {
  try {
    const stories = [
      { character: 'a curious cat', setting: 'a space station' },
      { character: 'a young wizard', setting: 'a bustling marketplace' },
      { character: 'a brave explorer', setting: 'an underwater city' },
    ];

    const results = [];

    for (const story of stories) {
      const response = await storyGeneratorPrompt(story);
      results.push({
        ...story,
        story: response.text
      });
    }

    res.json({
      success: true,
      stories: results
    });

  } catch (error) {
    console.error('Error generating batch stories:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Story Generator Server running on http://localhost:${port}`);
  console.log(`Homepage: http://localhost:${port}/`);
  console.log(`API endpoint: http://localhost:${port}/api/story?character=a friendly robot&setting=a magical library`);
  console.log(`Batch stories: http://localhost:${port}/api/batch-stories`);
});