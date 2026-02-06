const kurama = require('../anime.js');

module.exports = async (req, res) => {
    const { url } = req.query;
    
    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }
    
    try {
        const scraper = new kurama();
        const data = await scraper.episode(url);
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.status(200).json(data);
    } catch (error) {
        console.error('Episode endpoint error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};