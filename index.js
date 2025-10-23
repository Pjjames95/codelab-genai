import express from 'express';
import { googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';
import 'dotenv/config';

const app = express();
const ai = genkit({
  plugins: [googleAI()],
});

// Use definePrompt instead of external prompt files for cloud deployment
const storyGeneratorPrompt = ai.definePrompt({
  name: 'story-generator',
  model: 'googleai/gemini-2.5-flash',
  input: {
    schema: {
      character: 'string',
      setting: 'string'
    }
  },
  prompt: `Write a short, fun story (2-3 paragraphs) about {{character}} in {{setting}}.
Keep it light-hearted and suitable for all ages.`
});

app.get('/', async (req, res) => {
  try {
    console.log('=== STARTING REQUEST ===');
    const character = req.query.character || 'a friendly robot';
    const setting = req.query.setting || 'a magical library';
    
    console.log('Environment check:');
    console.log('- GOOGLE_API_KEY exists:', !!process.env.GOOGLE_API_KEY);
    console.log('- GOOGLE_API_KEY length:', process.env.GOOGLE_API_KEY?.length);
    console.log('- Character:', character);
    console.log('- Setting:', setting);

    console.log('Calling storyGeneratorPrompt...');
    const response = await storyGeneratorPrompt({
      character: character,
      setting: setting
    });
    console.log('Successfully got response from AI');

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
    console.log('=== REQUEST COMPLETED SUCCESSFULLY ===');

  } catch (error) {
    console.error('=== FULL ERROR DETAILS ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error status:', error.status);
    console.error('Error stack:', error.stack);
    
    // Check for specific Genkit/Google AI errors
    if (error.details) {
      console.error('Error details:', error.details);
    }
    if (error.cause) {
      console.error('Error cause:', error.cause);
    }

    res.status(500).send(`
      <html>
        <body>
          <h1>Internal Server Error</h1>
          <p><strong>Error:</strong> ${error.message}</p>
          <p><strong>Code:</strong> ${error.code || 'N/A'}</p>
          <p>Check the cloud logs for full details.</p>
          <a href="/">Try Again</a>
        </body>
      </html>
    `);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint without AI
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Server is running',
    apiKeyExists: !!process.env.GOOGLE_API_KEY,
    apiKeyLength: process.env.GOOGLE_API_KEY?.length
  });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Story Generator Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`Test endpoint: http://localhost:${port}/test`);
});