const API_BASE = '/api';
let currentAnimeId = '';
let currentEpisodeUrl = '';

const dom = {
    homeView: document.getElementById('home-view'),
    playerView: document.getElementById('player-view'),
    animeList: document.getElementById('anime-list'),
    loading: document.getElementById('loading'),
    content: document.getElementById('main-content'),
    episodeList: document.getElementById('episode-list'),
    episodeDrawer: document.getElementById('episode-drawer'),
    currentTitle: document.getElementById('current-title'),
    searchInput: document.getElementById('search-input'),
    searchBtn: document.getElementById('search-btn'),
    pageTitle: document.getElementById('page-title'),
    alert: document.getElementById('alert'),
    navHome: document.getElementById('nav-home'),
    ongoingBtn: document.getElementById('nav-ongoing'),
    movieBtn: document.getElementById('nav-movie'),
    scheduleBtn: document.getElementById('nav-schedule')
};

window.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    
    if (path.startsWith('/anime/')) {
        const animeId = path.split('/anime/')[1];
        if (animeId) {
            const episodeUrl = params.get('episode');
            if (episodeUrl) {
                openEpisodeFromUrl(episodeUrl);
            } else {
                openAnimeFromId(animeId);
            }
        }
    } else {
        loadHome();
    }
});

function showAlert(message, type = 'success') {
    dom.alert.textContent = message;
    dom.alert.className = `alert ${type} show`;
    setTimeout(() => {
        dom.alert.classList.remove('show');
    }, 3000);
}

dom.searchBtn.onclick = () => {
    const query = dom.searchInput.value.trim();
    if (query) {
        doSearch(query);
    } else {
        showAlert('Please enter search keywords', 'error');
    }
};

dom.searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = dom.searchInput.value.trim();
        if (query) {
            doSearch(query);
        } else {
            showAlert('Please enter search keywords', 'error');
        }
    }
});

dom.ongoingBtn.onclick = () => {
    loadOngoing();
};

dom.movieBtn.onclick = () => {
    loadMovies();
};

dom.scheduleBtn.onclick = () => {
    loadSchedule();
};

async function doSearch(query) {
    if(!query) {
        showAlert('Please enter search keywords', 'error');
        return;
    }
    
    dom.loading.style.display = 'block';
    dom.animeList.innerHTML = '';
    dom.pageTitle.style.display = 'block';
    dom.pageTitle.textContent = `Search Results: "${query}"`;
    dom.navHome.classList.remove('active');
    dom.ongoingBtn.classList.remove('active');
    dom.movieBtn.classList.remove('active');
    dom.scheduleBtn.classList.remove('active');
    
    try {
        const res = await fetch(`${API_BASE}/search?query=${encodeURIComponent(query)}`);
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        dom.loading.style.display = 'none';
        
        if(!data.animes || data.animes.length === 0) {
            dom.animeList.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align:center; padding:60px 20px;">
                    <i class="fas fa-search" style="font-size:4rem; color:var(--cyan); margin-bottom:20px;"></i>
                    <h3>No results found for "${query}"</h3>
                    <p style="margin-top:10px; color:var(--text-muted);">Try different keywords</p>
                </div>
            `;
            showAlert(`No results found for "${query}"`, 'error');
        } else {
            renderList(data.animes);
            showAlert(`Found ${data.animes.length} results for "${query}"`);
        }
    } catch (e) {
        console.error('Search error:', e);
        dom.loading.style.display = 'none';
        dom.animeList.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align:center; padding:60px 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size:4rem; color:var(--warning); margin-bottom:20px;"></i>
                <h3>Search failed</h3>
                <p style="margin-top:10px; color:var(--text-muted);">${e.message}</p>
                <button class="nav-btn" onclick="loadHome()" style="margin-top:20px;">
                    <i class="fas fa-redo"></i> Back to Home
                </button>
            </div>
        `;
        showAlert('Search failed. Please try again.', 'error');
    }
}

async function loadHome() {
    dom.searchInput.value = '';
    dom.pageTitle.style.display = 'block';
    dom.pageTitle.textContent = 'Latest Anime';
    dom.loading.style.display = 'block';
    dom.animeList.innerHTML = '';
    dom.navHome.classList.add('active');
    dom.ongoingBtn.classList.remove('active');
    dom.movieBtn.classList.remove('active');
    dom.scheduleBtn.classList.remove('active');

    try {
        const res = await fetch(`${API_BASE}/home`);
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        dom.loading.style.display = 'none';
        if(data.animes && data.animes.length > 0) {
            renderList(data.animes);
        } else {
            throw new Error('No anime data received');
        }
    } catch (e) {
        console.error('Load home error:', e);
        dom.loading.style.display = 'none';
        dom.animeList.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align:center; padding:60px 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size:4rem; color:var(--warning); margin-bottom:20px;"></i>
                <h3>Failed to load content</h3>
                <p style="margin-top:10px; color:var(--text-muted);">${e.message}</p>
                <button class="nav-btn" onclick="loadHome()" style="margin-top:20px;">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

async function loadOngoing() {
    dom.searchInput.value = '';
    dom.pageTitle.style.display = 'block';
    dom.pageTitle.textContent = 'Ongoing Anime';
    dom.loading.style.display = 'block';
    dom.animeList.innerHTML = '';
    dom.navHome.classList.remove('active');
    dom.ongoingBtn.classList.add('active');
    dom.movieBtn.classList.remove('active');
    dom.scheduleBtn.classList.remove('active');

    try {
        const res = await fetch(`${API_BASE}/ongoing`);
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        dom.loading.style.display = 'none';
        if(data.animes && data.animes.length > 0) {
            renderList(data.animes);
        } else {
            throw new Error('No ongoing anime data');
        }
    } catch (e) {
        console.error('Load ongoing error:', e);
        dom.loading.style.display = 'none';
        dom.animeList.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align:center; padding:60px 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size:4rem; color:var(--warning); margin-bottom:20px;"></i>
                <h3>Failed to load content</h3>
                <p style="margin-top:10px; color:var(--text-muted);">${e.message}</p>
                <button class="nav-btn" onclick="loadOngoing()" style="margin-top:20px;">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

async function loadMovies() {
    dom.searchInput.value = '';
    dom.pageTitle.style.display = 'block';
    dom.pageTitle.textContent = 'Anime Movies';
    dom.loading.style.display = 'block';
    dom.animeList.innerHTML = '';
    dom.navHome.classList.remove('active');
    dom.ongoingBtn.classList.remove('active');
    dom.movieBtn.classList.add('active');
    dom.scheduleBtn.classList.remove('active');

    try {
        const res = await fetch(`${API_BASE}/movie`);
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        dom.loading.style.display = 'none';
        if(data.animes && data.animes.length > 0) {
            renderList(data.animes);
        } else {
            throw new Error('No movie data');
        }
    } catch (e) {
        console.error('Load movies error:', e);
        dom.loading.style.display = 'none';
        dom.animeList.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align:center; padding:60px 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size:4rem; color:var(--warning); margin-bottom:20px;"></i>
                <h3>Failed to load content</h3>
                <p style="margin-top:10px; color:var(--text-muted);">${e.message}</p>
                <button class="nav-btn" onclick="loadMovies()" style="margin-top:20px;">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

async function loadSchedule() {
    dom.searchInput.value = '';
    dom.pageTitle.style.display = 'block';
    dom.pageTitle.textContent = 'Today\'s Schedule';
    dom.loading.style.display = 'block';
    dom.animeList.innerHTML = '';
    dom.navHome.classList.remove('active');
    dom.ongoingBtn.classList.remove('active');
    dom.movieBtn.classList.remove('active');
    dom.scheduleBtn.classList.add('active');

    try {
        const today = new Date().getDay();
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = days[today];
        
        const res = await fetch(`${API_BASE}/schedule?day=${dayName}`);
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        dom.loading.style.display = 'none';
        if(data.animes && data.animes.length > 0) {
            renderList(data.animes);
        } else {
            throw new Error('No schedule data for today');
        }
    } catch (e) {
        console.error('Load schedule error:', e);
        dom.loading.style.display = 'none';
        dom.animeList.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align:center; padding:60px 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size:4rem; color:var(--warning); margin-bottom:20px;"></i>
                <h3>Failed to load content</h3>
                <p style="margin-top:10px; color:var(--text-muted);">${e.message}</p>
                <button class="nav-btn" onclick="loadSchedule()" style="margin-top:20px;">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

function renderList(data) {
    if(!data || !Array.isArray(data)) {
        console.error('Invalid data for renderList:', data);
        return;
    }
    
    dom.animeList.innerHTML = '';
    data.forEach(item => {
        if(!item || !item.url) return;
        
        const card = document.createElement('div');
        card.className = 'anime-card';
        const animeId = btoa(encodeURIComponent(item.url)).replace(/=/g, '');
        const imageUrl = item.image || 'https://via.placeholder.com/280x400/1a1a1a/ffffff?text=No+Image';
        
        card.innerHTML = `
            <div class="anime-card-inner">
                <div class="anime-poster">
                    <img src="${imageUrl}" loading="lazy" alt="${item.title || 'Anime'}"
                         onerror="this.src='https://via.placeholder.com/280x400/1a1a1a/ffffff?text=No+Image'">
                    ${item.type ? `<div class="anime-type">${item.type}</div>` : ''}
                    ${item.episode ? `<div class="anime-episode">EP ${item.episode}</div>` : ''}
                    ${item.rating ? `<div class="anime-rating">⭐ ${item.rating}</div>` : ''}
                </div>
                <div class="anime-info">
                    <div class="anime-title">${item.title || 'Unknown Title'}</div>
                    <div class="anime-meta">
                        ${item.status ? `<span class="anime-status">${item.status}</span>` : ''}
                        ${item.genres ? `<span class="anime-genre">${Array.isArray(item.genres) ? item.genres[0] : item.genres}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
        card.onclick = () => {
            window.history.pushState({}, '', `/anime/${animeId}`);
            openAnimeDetail(item.url, animeId);
        };
        dom.animeList.appendChild(card);
    });
}

async function openAnimeFromId(animeId) {
    try {
        const url = decodeURIComponent(atob(animeId));
        openAnimeDetail(url, animeId);
    } catch (e) {
        console.error('Invalid anime ID:', e);
        showAlert('Invalid anime link', 'error');
        setTimeout(() => {
            window.history.pushState({}, '', '/');
            loadHome();
        }, 1500);
    }
}

async function openAnimeDetail(url, animeId) {
    currentAnimeId = animeId;
    dom.playerView.classList.add('active');
    dom.content.innerHTML = '<div class="loader" style="margin:40px auto;"></div>';
    dom.episodeList.innerHTML = '<div class="loader" style="grid-column:1/-1; margin:40px auto;"></div>';
    dom.currentTitle.textContent = 'Loading anime...';
    dom.episodeDrawer.classList.remove('show');

    try {
        const res = await fetch(`${API_BASE}/detail?url=${encodeURIComponent(url)}`);
        
        if (!res.ok) {
            const errorData = await res.text();
            throw new Error(`HTTP error! status: ${res.status}, ${errorData}`);
        }
        
        const data = await res.json();
        
        if(!data || !data.detail) {
            throw new Error('Invalid anime data received');
        }
        
        dom.currentTitle.textContent = data.detail.title || 'Unknown Anime';
        renderAnimeDetail(data);
        renderEpisodes(data.episode || [], url);
        
        if (data.episode && data.episode.length > 0) {
            openEpisode(data.episode[0].link, data.episode[0].title);
        } else {
            dom.episodeList.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:40px; color:#666;">No episodes found.</p>';
        }

    } catch (e) {
        console.error('Open anime error:', e);
        dom.currentTitle.textContent = 'Error loading anime';
        showAlert('Failed to load anime details: ' + e.message, 'error');
    }
}

function renderAnimeDetail(data) {
    if(!data || !data.detail) return;
    
    const detail = data.detail;
    dom.content.innerHTML = `
        <div class="anime-detail">
            <div class="anime-header">
                <img src="${detail.img || 'https://via.placeholder.com/300x450/1a1a1a/ffffff?text=No+Poster'}" alt="${detail.title || 'Anime'}" class="anime-poster-img" 
                     onerror="this.src='https://via.placeholder.com/300x450/1a1a1a/ffffff?text=No+Poster'">
                <div class="anime-header-info">
                    <h1>${detail.title || 'Unknown Anime'}</h1>
                    <p class="anime-alt">${detail.alternativeTitle || ''}</p>
                    
                    <div class="anime-meta-grid">
                        ${detail.rating ? `
                        <div class="meta-item">
                            <strong>Rating:</strong>
                            <span>${detail.rating}</span>
                        </div>
                        ` : ''}
                        ${detail.tipe || detail.type ? `
                        <div class="meta-item">
                            <strong>Type:</strong>
                            <span>${detail.tipe || detail.type}</span>
                        </div>
                        ` : ''}
                        ${detail.status ? `
                        <div class="meta-item">
                            <strong>Status:</strong>
                            <span>${detail.status}</span>
                        </div>
                        ` : ''}
                        ${detail.total_episode ? `
                        <div class="meta-item">
                            <strong>Episodes:</strong>
                            <span>${detail.total_episode}</span>
                        </div>
                        ` : ''}
                        ${detail.tayang ? `
                        <div class="meta-item">
                            <strong>Aired:</strong>
                            <span>${detail.tayang}</span>
                        </div>
                        ` : ''}
                        ${detail.studio ? `
                        <div class="meta-item">
                            <strong>Studio:</strong>
                            <span>${detail.studio}</span>
                        </div>
                        ` : ''}
                        ${detail.durasi ? `
                        <div class="meta-item">
                            <strong>Duration:</strong>
                            <span>${detail.durasi}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    ${data.tags && data.tags.length > 0 ? `
                    <div class="anime-tags">
                        ${data.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    ` : ''}
                </div>
            </div>
            
            ${detail.sinopsis ? `
            <div class="anime-synopsis">
                <h3>Synopsis</h3>
                <p>${detail.sinopsis}</p>
            </div>
            ` : ''}
            
            ${data.related && data.related.length > 0 ? `
            <div class="anime-related">
                <h3>Related Anime</h3>
                <div class="related-grid">
                    ${data.related.map(rel => {
                        const relId = btoa(encodeURIComponent(rel.url)).replace(/=/g, '');
                        return `<div class="related-item" onclick="openAnimeDetail('${rel.url}', '${relId}')">${rel.title || 'Related'}</div>`;
                    }).join('')}
                </div>
            </div>
            ` : ''}
        </div>
    `;
}

function renderEpisodes(episodes, animeUrl) {
    if(!episodes || !Array.isArray(episodes)) return;
    
    dom.episodeList.innerHTML = '';
    episodes.forEach((episode, index) => {
        if(!episode || !episode.link) return;
        
        const btn = document.createElement('button');
        btn.className = 'episode-btn';
        const episodeTitle = episode.title || `Episode ${index + 1}`;
        btn.textContent = `Ep. ${episode.index || index + 1}: ${episodeTitle.substring(0, 30)}${episodeTitle.length > 30 ? '...' : ''}`;
        btn.title = episodeTitle;
        const encodedEpisode = btoa(encodeURIComponent(episode.link)).replace(/=/g, '');
        btn.onclick = () => {
            window.history.pushState({}, '', `/anime/${currentAnimeId}?episode=${encodedEpisode}`);
            openEpisode(episode.link, episodeTitle);
        };
        dom.episodeList.appendChild(btn);
    });
}

async function openEpisodeFromUrl(encodedUrl) {
    try {
        const episodeUrl = decodeURIComponent(atob(encodedUrl));
        openEpisode(episodeUrl, 'Loading episode...');
    } catch (e) {
        console.error('Invalid episode URL:', e);
        showAlert('Invalid episode link', 'error');
    }
}

async function openEpisode(episodeUrl, episodeTitle) {
    if(!episodeUrl) {
        showAlert('Invalid episode URL', 'error');
        return;
    }
    
    currentEpisodeUrl = episodeUrl;
    document.querySelectorAll('.episode-btn').forEach(b => {
        b.classList.remove('active');
    });
    
    dom.content.innerHTML = '<div class="loader" style="margin:40px auto;"></div>';
    
    try {
        const res = await fetch(`${API_BASE}/episode?url=${encodeURIComponent(episodeUrl)}`);
        
        if (!res.ok) {
            const errorData = await res.text();
            throw new Error(`HTTP error! status: ${res.status}, ${errorData}`);
        }
        
        const data = await res.json();
        
        if(!data) {
            throw new Error('No episode data received');
        }
        
        let contentHTML = `
            <div class="episode-content">
                <h2 class="episode-title">${data.title || episodeTitle}</h2>
                
                ${data.video && data.video.length > 0 ? `
                <div class="video-player">
                    <video id="anime-player" controls playsinline style="width:100%; height:auto; border:3px solid var(--border-color);">
                        <source src="${data.video[0].url}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                    <div class="video-quality-selector">
                        ${data.video.map((video, index) => `
                            <button class="quality-btn ${index === 0 ? 'active' : ''}" onclick="changeQuality('${video.url}')">
                                ${video.quality || 'HD'}
                            </button>
                        `).join('')}
                    </div>
                </div>
                ` : '<p class="video-error">No video available</p>'}
                
                <div class="episode-meta">
                    <span class="episode-nav">
                        <button class="btn btn-secondary btn-small" onclick="toggleDrawer()">
                            <i class="fas fa-list"></i> Episodes
                        </button>
                        
                        ${data.episode && data.episode.length > 0 ? `
                        <div class="episode-selector">
                            <select class="episode-dropdown" onchange="changeEpisode(this.value)">
                                <option value="">Select Episode</option>
                                ${data.episode.map(ep => `
                                    <option value="${ep.url}">${ep.episode}</option>
                                `).join('')}
                            </select>
                        </div>
                        ` : ''}
                    </span>
                </div>
                
                ${data.download && data.download.length > 0 ? `
                <div class="download-section">
                    <h3><i class="fas fa-download"></i> Download Links</h3>
                    <div class="download-grid">
                        ${data.download.map(dl => `
                            <div class="download-quality">
                                <h4>${dl.type}</h4>
                                <div class="download-links">
                                    ${dl.links.map(link => `
                                        <a href="${link.url}" class="download-link ${link.recommended ? 'recommended' : ''}" target="_blank">
                                            ${link.name} ${link.recommended ? '<i class="fas fa-fire"></i>' : ''}
                                        </a>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                <div class="episode-footer">
                    <div class="episode-actions">
                        <button class="btn btn-primary" onclick="window.scrollTo({top: 0, behavior: 'smooth'})">
                            <i class="fas fa-arrow-up"></i> Back to Top
                        </button>
                        <button class="btn btn-secondary" onclick="toggleDrawer()">
                            <i class="fas fa-play-circle"></i> Episode List
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        dom.content.innerHTML = contentHTML;
        showAlert(`Loading Episode: ${episodeTitle.substring(0, 50)}...`);
        
    } catch (e) {
        console.error('Open episode error:', e);
        dom.content.innerHTML = `
            <div class="episode-error">
                <i class="fas fa-exclamation-circle" style="font-size:3rem; color:var(--error);"></i>
                <h3>Failed to load episode</h3>
                <p>${e.message}</p>
                <button class="btn btn-primary" onclick="openEpisode('${episodeUrl}', '${episodeTitle}')">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

function changeQuality(videoUrl) {
    const video = document.getElementById('anime-player');
    if (video) {
        video.src = videoUrl;
        video.load();
    }
}

function changeEpisode(url) {
    if (url) {
        const encodedEpisode = btoa(encodeURIComponent(url)).replace(/=/g, '');
        window.history.pushState({}, '', `/anime/${currentAnimeId}?episode=${encodedEpisode}`);
        openEpisode(url, 'Loading...');
    }
}

function closeAnimeDetail() {
    dom.playerView.classList.remove('active');
    dom.content.innerHTML = '';
    window.history.pushState({}, '', '/');
}

function toggleDrawer() {
    dom.episodeDrawer.classList.toggle('show');
    
    const toggleIcon = document.querySelector('.episodes-toggle i');
    if (dom.episodeDrawer.classList.contains('show')) {
        toggleIcon.className = 'fas fa-chevron-down';
    } else {
        toggleIcon.className = 'fas fa-chevron-up';
    }
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && dom.playerView.classList.contains('active')) {
        closeAnimeDetail();
    }
});

window.addEventListener('popstate', function(e) {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    
    if (path === '/' || path === '') {
        dom.playerView.classList.remove('active');
        dom.content.innerHTML = '';
        loadHome();
    } else if (path.startsWith('/anime/')) {
        const animeId = path.split('/anime/')[1];
        if (animeId) {
            const episodeUrl = params.get('episode');
            if (episodeUrl) {
                openEpisodeFromUrl(episodeUrl);
            } else {
                openAnimeFromId(animeId);
            }
        }
    }
});
