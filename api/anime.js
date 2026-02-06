const axios = require("axios");
const cheerio = require("cheerio");

class Kurama {
  constructor() {
    this.baseURL = 'https://v8.kuramanime.tel';
    this.targetEnv = 'data-kk';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://v8.kuramanime.tel/',
        'Origin': 'https://v8.kuramanime.tel',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 15000
    });
  }

  async search(query, page = 1) {
    try {
      const response = await this.client.get('/anime', {
        params: {
          order_by: "latest",
          search: query,
          page: page,
          need_json: true
        }
      });

      if (!response.data || !response.data.animes) {
        throw new Error('Invalid response structure');
      }

      const result = {
        animes: response.data.animes.data.map(item => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          image: item.image,
          type: item.type,
          status: item.status,
          episode: item.episode,
          rating: item.rating,
          genres: item.genres,
          url: `${this.baseURL}/anime/${item.id}/${item.slug}`
        })),
        hasNextPage: !!response.data.animes.next_page_url,
        nextPage: response.data.animes.next_page_url ? response.data.animes.next_page_url.split('page=')[1] : null
      };

      return result;
    } catch (error) {
      console.error('Search error:', error.message);
      throw error;
    }
  }

  async detail(url, page = 0) {
    try {
      if (!url || !url.includes('kuramanime')) {
        throw new Error('Invalid URL');
      }

      const response = await this.client.get(url, {
        params: { page: page }
      });

      const $ = cheerio.load(response.data);

      if ($('h2.title-chapter').length === 0 && $('.anime__details__title').length === 0) {
        throw new Error('Anime not found');
      }

      const detail = {
        title: $('.anime__details__title h3').text().trim() || 'Unknown',
        alternativeTitle: $('.anime__details__title span').text().trim() || '',
        rating: $('.anime__details__pic__mobile .ep').text().trim() || '0',
        img: $('.anime__details__pic__mobile').attr('data-setbg') || '',
        sinopsis: $('#synopsisField').text().trim() || ''
      };

      $('.anime__details__widget ul li .row').each((_, element) => {
        const label = $(element).find('.col-3 span').text().replace(/:/, '').toLowerCase().trim();
        const valueElement = $(element).find('.col-9');
        
        if (valueElement.find('a').length >= 2) {
          const values = [];
          valueElement.find('a').each((_, a) => {
            values.push($(a).text().trim());
          });
          detail[label] = values;
        } else {
          detail[label] = valueElement.text().trim();
        }
      });

      const episodes = [];
      const episodeContent = $('#episodeLists').attr('data-content');
      if (episodeContent) {
        const episode$ = cheerio.load(episodeContent);
        episode$('.btn-danger').each((index, element) => {
          const title = $(element).text().trim();
          const link = $(element).attr('href');
          if (title && link) {
            episodes.push({
              index: index + 1,
              title: title,
              link: link
            });
          }
        });
      }

      episodes.reverse();

      const related = [];
      $('.anime__details__review .breadcrumb__links__v2 div a').each((_, element) => {
        const title = $(element).text().slice(2).trim();
        const url = $(element).attr('href');
        if (title && url) {
          related.push({ title, url });
        }
      });

      const tags = [];
      $('#tagSection .breadcrumb__links__v2__tags a').each((_, element) => {
        tags.push($(element).text().trim().replace(',', ''));
      });

      const nextPage = episodeContent ? episodeContent.match(/page=(\d+)/)?.[1] : null;

      return {
        id: $('input#animeId').attr('value') || '',
        detail: detail,
        episode: episodes,
        related: related,
        tags: tags,
        nextEpsode: !!nextPage,
        pageNextEpsode: nextPage
      };
    } catch (error) {
      console.error('Detail error:', error.message);
      throw error;
    }
  }

  async episode(url) {
    try {
      if (!url || !url.includes('kuramanime')) {
        throw new Error('Invalid URL');
      }

      const response = await this.client.get(url);
      const $ = cheerio.load(response.data);

      const result = {
        id: $('input#animeId').attr('value') || '',
        postId: $('input#postId').attr('value') || '',
        title: $('title').text().trim() || '',
        lastUpdated: $('.breadcrumb__links__v2 > span:nth-child(2)').text().split('\n')[0]?.trim() || '',
        batch: $('a.ep-button[type="batch"]').attr('href') || null,
        episode: [],
        download: [],
        video: []
      };

      $('a.ep-button[type="episode"]').each((_, element) => {
        const episodeText = $(element).text().trim();
        const episodeUrl = $(element).attr('href');
        if (episodeText && episodeUrl) {
          result.episode.push({
            episode: episodeText,
            url: episodeUrl
          });
        }
      });

      $('#animeDownloadLink').find('h6').each((_, element) => {
        const type = $(element).text().trim();
        const links = [];
        let next = $(element).next();
        
        while (next.length && !next.is('h6') && !next.is('br')) {
          if (next.is('a')) {
            links.push({
              name: next.text().trim(),
              url: next.attr('href'),
              recommended: next.find('i.fa-fire').length > 0
            });
          }
          next = next.next();
        }
        
        if (links.length > 0) {
          result.download.push({
            type: type,
            links: links
          });
        }
      });

      $('#player source').each((_, element) => {
        const quality = $(element).attr('size') || 'HD';
        const videoUrl = $(element).attr('src');
        if (videoUrl) {
          result.video.push({
            quality: quality,
            url: videoUrl
          });
        }
      });

      return result;
    } catch (error) {
      console.error('Episode error:', error.message);
      throw error;
    }
  }

  async ongoing(page = 1) {
    try {
      const response = await this.client.get('/', {
        params: {
          page: page,
          need_json: true
        }
      });

      if (!response.data || !response.data.ongoingAnimes) {
        throw new Error('Invalid response structure');
      }

      const result = {
        animes: response.data.ongoingAnimes.data.map(item => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          image: item.image,
          type: item.type,
          status: item.status,
          episode: item.episode,
          rating: item.rating,
          genres: item.genres,
          url: `${this.baseURL}/anime/${item.id}/${item.slug}`
        })),
        hasNextPage: !!response.data.ongoingAnimes.next_page_url,
        nextPage: response.data.ongoingAnimes.next_page_url ? response.data.ongoingAnimes.next_page_url.split('page=')[1] : null
      };

      return result;
    } catch (error) {
      console.error('Ongoing error:', error.message);
      throw error;
    }
  }

  async movie(page = 1) {
    try {
      const response = await this.client.get('/', {
        params: {
          page: page,
          need_json: true
        }
      });

      if (!response.data || !response.data.movieAnimes) {
        throw new Error('Invalid response structure');
      }

      const result = {
        animes: response.data.movieAnimes.data.map(item => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          image: item.image,
          type: item.type,
          status: item.status,
          episode: item.episode,
          rating: item.rating,
          genres: item.genres,
          url: `${this.baseURL}/anime/${item.id}/${item.slug}`
        })),
        hasNextPage: !!response.data.movieAnimes.next_page_url,
        nextPage: response.data.movieAnimes.next_page_url ? response.data.movieAnimes.next_page_url.split('page=')[1] : null
      };

      return result;
    } catch (error) {
      console.error('Movie error:', error.message);
      throw error;
    }
  }

  async schedule(day, page = 1) {
    try {
      const response = await this.client.get('/schedule', {
        params: {
          scheduled_day: day,
          page: page,
          need_json: true
        }
      });

      if (!response.data || !response.data.animes) {
        throw new Error('Invalid response structure');
      }

      const result = {
        animes: response.data.animes.data.map(item => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          image: item.image,
          type: item.type,
          status: item.status,
          episode: item.episode,
          rating: item.rating,
          genres: item.genres,
          url: `${this.baseURL}/anime/${item.id}/${item.slug}`
        })),
        hasNextPage: !!response.data.animes.next_page_url,
        nextPage: response.data.animes.next_page_url ? response.data.animes.next_page_url.split('page=')[1] : null
      };

      return result;
    } catch (error) {
      console.error('Schedule error:', error.message);
      throw error;
    }
  }
}

module.exports = Kurama;
