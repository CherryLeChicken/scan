import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ollama from 'ollama';

// Load environment variables from .env file
dotenv.config();
console.log('PATH:', process.env.PATH);

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API endpoint to suggest Canadian alternatives
app.post('/api/suggest-canadian-alternatives', async (req, res) => {
    console.log('Request received:', req.body);

    const { productName } = req.body;
    if (!productName) {
        return res.status(400).json({ error: 'Product name is required' });
    }

    console.log('Running Ollama...');
    try {
        const response = await ollama.chat({
            model: 'mistral',
            messages: [{ role: 'user', content: `Give 3 Canadian alternatives to ${productName}` }],
        });

        const message = response.message.content;
        console.log('Ollama response:', message);

        // Send the response back to the client
        res.json({ alternatives: message });
    } catch (error) {
        console.error('Error calling Ollama:', error);
        res.status(500).json({ error: 'Failed to get alternatives from Ollama' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
