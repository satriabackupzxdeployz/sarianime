const kurama = require('../anime.js');

module.exports = async (req, res) => {
    const { query } = req.query;
    
    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    try {
        const scraper = new kurama();
        const data = await scraper.search(query, 1);
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.status(200).json(data);
    } catch (error) {
        console.error('Search endpoint error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};