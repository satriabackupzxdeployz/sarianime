const kurama = require('../anime.js');

module.exports = async (req, res) => {
    try {
        const scraper = new kurama();
        const data = await scraper.ongoing(1);
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.status(200).json(data);
    } catch (error) {
        console.error('Home endpoint error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};