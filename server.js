import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
// import { exec } from 'node:child_process';
import ollama from 'ollama'
dotenv.config(); // Load environment variables from .env file
console.log('PATH:', process.env.PATH);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

import { spawn } from 'node:child_process';

app.post('/api/suggest-canadian-alternatives', async (req, res) => {
    console.log('Request received:', req.body);

    const { productName } = req.body;
    if (!productName) {
        return res.status(400).json({ error: 'Product name is required' });
    }
    console.log('running')
    const response = await ollama.chat({
        model: 'mistral',
        messages: [{ role: 'user', content: `Give 3 Canadian alternatives to ${productName}` }],
      })

    const message = response.message.content
    console.log(message)

    // const process = spawn('/usr/local/bin/ollama', ['run', 'mistral', prompt], { shell: true });

    // let output = '';
    // let errorOutput = '';

    // process.stdout.on('data', (data) => {
    //     console.log('Ollama stdout:', data.toString());
    //     output += data.toString();
    // });

    // process.stderr.on('data', (data) => {
    //     console.log('Ollama stderr:', data.toString());
    //     errorOutput += data.toString();
    // });

    res.json(message)

    // process.on('close', (code) => {
    //     console.log(`Ollama process exited with code ${code}`);
    //     if (code === 0) {
    //         res.json({ alternatives: output.trim() });
    //     } else {
    //         res.status(500).json({ error: `Ollama failed with code ${code}: ${errorOutput}` });
    //     }
    // });

    // process.on('error', (err) => {
    //     console.error('Failed to start Ollama:', err);
    //     res.status(500).json({ error: 'Failed to start Ollama' });
    // });
});




app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});