const kurama = require('../anime.js');

module.exports = async (req, res) => {
    const { day } = req.query;
    
    if (!day) {
        return res.status(400).json({ error: 'Day parameter is required' });
    }
    
    try {
        const scraper = new kurama();
        const data = await scraper.schedule(day, 1);
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.status(200).json(data);
    } catch (error) {
        console.error('Schedule endpoint error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};