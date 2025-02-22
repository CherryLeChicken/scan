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
  console.log('Request received:', req.body); // Log the request body
  const { productName } = req.body;

  if (!productName) {
    return res.status(400).json({ error: 'Product name is required' });
  }

  const prompt = `List three Canadian-made alternatives for the product: ${productName}. Include brand names and avoid repeating the prompt.`;

  try {
    const apiUrl = 'https://api-inference.huggingface.co/models/google/flan-t5-large'; // Use a better model
    console.log('Sending request to Hugging Face API:', apiUrl); // Log the API URL

    let response; // Use 'let' instead of 'const' to allow reassignment
    let retries = 3; // Number of retries
    let delay = 10000; // Delay between retries (10 seconds)

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
            max_length: 50, // Shorter response
            temperature: 0.5, // More deterministic
            top_p: 0.9, // Less randomness
          },
        }),
      });

      if (response.status === 503) {
        // Model is still loading
        console.log('Model is loading. Retrying in 10 seconds...');
        await new Promise(resolve => setTimeout(resolve, delay)); // Wait 10 seconds
        retries--;
      } else if (!response.ok) {
        // Other errors
        const errorResponse = await response.text(); // Log the error response as text
        console.error('Hugging Face API error:', errorResponse);
        throw new Error(`Hugging Face API error: ${response.statusText}`);
      } else {
        // Success
        break;
      }
    }

    if (retries === 0) {
      throw new Error('Model is still loading after multiple retries.');
    }

    const data = await response.json();
    console.log('Hugging Face API response:', data); // Log the full response

    // Extract the generated text
    let alternatives = data[0].generated_text.trim();

    // Remove the prompt from the response
    alternatives = alternatives.replace(prompt, '').trim();

    // Remove repeated phrases
    alternatives = alternatives.split('.')[0]; // Take only the first sentence

    console.log('Generated alternatives:', alternatives); // Log the alternatives

    res.json({ alternatives });
  } catch (error) {
    console.error('Error fetching alternatives:', error);
    res.status(500).json({ error: 'Unable to fetch alternatives at this time.' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});