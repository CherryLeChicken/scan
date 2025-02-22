import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { exec } from 'node:child_process';
dotenv.config(); // Load environment variables from .env file
console.log('PATH:', process.env.PATH);

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
  
    const prompt = `What are three Canadian-made alternatives for ${productName}? Give a short response.`;
    console.log('Prompt:', prompt); // Log the prompt
  
    try {
        const command = `/usr/local/bin/ollama run mistral "${prompt}"`;

      console.log('Running command:', command); // Log the command
      exec(command, { maxBuffer: 1024 * 1024, timeout: 90000 }, (error, stdout, stderr) => {
        console.log("Here")
        if (error) {
          console.log('Error running Ollama:', error.message);
          return res.status(500).json({ error: `Error: ${error.message}` });
        }
        if (stderr) {
          console.log('Ollama stderr:', stderr);
        }
        console.log('Raw stdout:', stdout.length > 0 ? stdout : 'No output received');
        res.json({ alternatives: stdout.trim() });
      });
      
    } catch (error) {
      console.log('Error:', error);
      res.status(500).json({ error: 'Unable to fetch alternatives.' });
    }
  });

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});