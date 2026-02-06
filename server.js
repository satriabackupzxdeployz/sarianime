const Kurama = require('./anime.js');

module.exports = async (req, res) => {
  const scraper = new Kurama();
  
  try {
    const { pathname, searchParams } = new URL(req.url, `http://${req.headers.host}`);
    
    if (pathname === '/api/home') {
      const data = await scraper.ongoing(1);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.status(200).json(data);
      return;
    }
    
    if (pathname === '/api/search') {
      const query = searchParams.get('query');
      if (!query) {
        res.status(400).json({ error: 'Query parameter is required' });
        return;
      }
      const data = await scraper.search(query, 1);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.status(200).json(data);
      return;
    }
    
    if (pathname === '/api/detail') {
      const url = searchParams.get('url');
      if (!url) {
        res.status(400).json({ error: 'URL parameter is required' });
        return;
      }
      const data = await scraper.detail(url);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.status(200).json(data);
      return;
    }
    
    if (pathname === '/api/episode') {
      const url = searchParams.get('url');
      if (!url) {
        res.status(400).json({ error: 'URL parameter is required' });
        return;
      }
      const data = await scraper.episode(url);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.status(200).json(data);
      return;
    }
    
    if (pathname === '/api/schedule') {
      const day = searchParams.get('day');
      if (!day) {
        res.status(400).json({ error: 'Day parameter is required' });
        return;
      }
      const data = await scraper.schedule(day, 1);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.status(200).json(data);
      return;
    }
    
    if (pathname === '/api/movie') {
      const data = await scraper.movie(1);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.status(200).json(data);
      return;
    }
    
    if (pathname === '/api/ongoing') {
      const data = await scraper.ongoing(1);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.status(200).json(data);
      return;
    }
    
    res.status(404).json({ error: 'API endpoint not found' });
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
};
