import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv'; // Import dotenv

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());



app.post('/api/suggest-canadian-alternatives', async (req, res) => {
    console.log('Request received:', req.body); // Log the request body
    console.log('OpenAI API Key:', process.env.OPENAI_API_KEY); // Log the API key
  
    const { productName } = req.body;
  
    if (!productName) {
      return res.status(400).json({ error: 'Product name is required' });
    }
  
    const prompt = `Suggest Canadian-made alternatives for the product: ${productName}.`;
  
    try {
      const apiUrl = 'https://api.openai.com/v1/chat/completions'; // Updated endpoint for chat models
      console.log('Sending request to OpenAI API:', apiUrl); // Log the API URL
  
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo', // Updated model
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 100,
          temperature: 0.7,
        }),
      });
  
      if (!response.ok) {
        const errorResponse = await response.json(); // Log the error response from OpenAI
        console.error('OpenAI API error:', errorResponse);
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }
  
      const data = await response.json();
      const alternatives = data.choices[0].message.content.trim(); // Updated response structure
  
      res.json({ alternatives });
    } catch (error) {
      console.error('Error fetching alternatives:', error);
      res.status(500).json({ error: 'Unable to fetch alternatives at this time.' });
    }
  });
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});