import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const app = express();
const PORT = 3001; // Use a port other than the Vite default (5173)

app.get('/scrape', async (req, res) => {
    try {
        // Fetch HTML content from external URL
        const response = await axios.get('https://uitpaulineskeuken.nl/recept/strawberry-shortcake');
        const html = response.data;

        // Use cheerio to load the HTML
        const $ = cheerio.load(html);

        // Find the <script> tag with JSON-LD
        const scriptElement = $('script[type="application/ld+json"]').first();

        if (scriptElement.length > 0) {
            // Extract and parse JSON-LD content
            const jsonLdText = scriptElement.html();
            const jsonLdData = JSON.parse(jsonLdText || '{}');

            // Send the parsed data as the response
            res.json(jsonLdData);
        } else {
            res.status(404).json({ message: 'JSON-LD script not found.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error fetching recipe data.', body: error });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
