import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post('/api/suggest-canadian-alternatives', async (req, res) => {
    console.log('Request received:', req.body);
    const { productName } = req.body;
  
    if (!productName) {
      return res.status(400).json({ error: 'Product name is required' });
    }
  
    const prompt = `Provide three Canadian-made alternatives for the product "${productName}". Each alternative should include a brand name and a brief description. Ensure the alternatives are distinctly Canadian and avoid repeating the same product. Format the response as:
    1. [Brand Name] - [Description]
    2. [Brand Name] - [Description]
    3. [Brand Name] - [Description]`;
  
    try {
      const apiUrl = 'https://api-inference.huggingface.co/models/EleutherAI/gpt-neox-20b';
      console.log('Sending request to Hugging Face API:', apiUrl);
  
      let response;
      let retries = 3;
      let delay = 10000;
  
      while (retries > 0) {
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_length: 100,
              temperature: 0.7,
              top_p: 0.95,
              num_return_sequences: 1,
            },
          }),
        });
  
        if (response.status === 503) {
          console.log('Model is loading. Retrying in 10 seconds...');
          await new Promise(resolve => setTimeout(resolve, delay));
          retries--;
        } else if (!response.ok) {
          const errorResponse = await response.text();
          console.error('Hugging Face API error:', errorResponse);
          throw new Error(`Hugging Face API error: ${response.statusText}`);
        } else {
          break;
        }
      }
  
      if (retries === 0) {
        throw new Error('Model is still loading after multiple retries.');
      }
  
      const data = await response.json();
      console.log('Hugging Face API response:', data);
  
      let alternatives = data[0].generated_text.trim();
      alternatives = alternatives.replace(prompt, '').trim();
  
      // Check if the response contains valid alternatives
      if (!alternatives || alternatives.includes('*') || alternatives.includes('not made in Canada')) {
        throw new Error('No valid Canadian alternatives found.');
      }
  
      // Format the response
      alternatives = alternatives
        .split('\n')
        .filter(line => line.trim().length > 0) // Remove empty lines
        .slice(0, 3) // Take only the first 3 alternatives
        .join('\n'); // Join into a single string
  
      console.log('Generated alternatives:', alternatives);
  
      res.json({ alternatives });
    } catch (error) {
      console.error('Error fetching alternatives:', error);
      res.status(500).json({
        error: 'Unable to fetch alternatives at this time.',
        fallback: 'Here are some general Canadian brands you might consider: [Brand 1], [Brand 2], [Brand 3]',
      });
    }
  });

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});