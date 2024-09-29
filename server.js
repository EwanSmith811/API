// server.js
import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = 3000;

var OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Set your API key as an environment variable

// Use __filename and __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Add this line to parse JSON requests
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index', { response: '' });
});

app.post('/prompt', async (req, res) => {
    const userAilment = req.body.ailment; // Get the user input from the request
    const customPrompt = `The time perioyd is the wild west. A user has the following medical ailment: ${userAilment}.`;
    const responseText = await getGptResponse(customPrompt);
    res.json({ response: responseText }); // Send JSON response
});

async function getGptResponse(prompt) {
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',  // For GPT-4, replace with 'gpt-4'
            messages: [
                { role: 'system', content: 'You are a funny and useless medical advisor in the Wild West. Responses less than 5 sentences.' },
                { role: 'user', content: prompt },
            ],
            max_tokens: 150,
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        // In the chat completion response, use the 'content' field of 'message'
        return response.data.choices[0].message.content.trim();
    } catch (error) {
        if (error.response) {
            console.error('Error response from OpenAI:', error.response.data);
        } else {
            console.error('Error making GPT request:', error.message);
        }
        return 'Error fetching response from GPT.';
    }
}



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
