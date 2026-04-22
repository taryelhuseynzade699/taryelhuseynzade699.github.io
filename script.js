const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

// Menyunun açılıb-bağlanması
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Linkə kliklədikdə menyunun bağlanması
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Scroll zamanı elementlərin üzə çıxması
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

revealElements.forEach(el => {
    revealObserver.observe(el);
});

// Oxunma tərəqqi çubuğu funksionallığı
window.addEventListener('scroll', () => {
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + "%";
    }
});

// Mövzu (Theme) İdarəetməsi
const themeBtns = {
    light: document.getElementById('theme-light'),
    dark: document.getElementById('theme-dark'),
    system: document.getElementById('theme-system')
};

function applyTheme(theme) {
    document.body.classList.remove('dark-mode');
    
    let targetTheme = theme;
    if (theme === 'system') {
        targetTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    if (targetTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // Aktiv düyməni vizual olaraq fərqləndir
    Object.keys(themeBtns).forEach(key => {
        if (themeBtns[key]) {
            themeBtns[key].classList.toggle('theme-active', key === theme);
        }
    });

    localStorage.setItem('site-theme', theme);
}

// İlkin mövzunu yüklə
const savedTheme = localStorage.getItem('site-theme') || 'system';
applyTheme(savedTheme);

// Düymə kliklərini dinlə
if (themeBtns.light) {
    themeBtns.light.addEventListener('click', () => applyTheme('light'));
    themeBtns.dark.addEventListener('click', () => applyTheme('dark'));
    themeBtns.system.addEventListener('click', () => applyTheme('system'));
}

// Sistem tənzimləməsi dəyişdikdə avtomatik yenilə
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (localStorage.getItem('site-theme') === 'system') applyTheme('system');
});

// Paylaş düyməsi funksionallığı
const shareBtn = document.getElementById('shareBtn');
if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: document.title,
                    url: window.location.href
                });
            } else {
                await navigator.clipboard.writeText(window.location.href);
                alert('Məqalə linki kopyalandı!');
            }
        } catch (err) {
            console.log('Paylaşım zamanı xəta:', err);
        }
    });
}

// Məqalə dinləmə funksionallığı
const listenBtn = document.getElementById('listenBtn');
const articleAudio = document.getElementById('articleAudio');

if (listenBtn && articleAudio) {
    // Pleyer panelini yarat
    const playerUI = document.createElement('div');
    playerUI.className = 'audio-player-panel';
    playerUI.innerHTML = `
        <div class="audio-player-container">
            <div class="audio-controls">
                <button class="skip-btn" id="skipBack" title="10 saniyə geri">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>
                </button>
                <button class="play-pause-btn" id="panelPlayPause">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </button>
                <button class="skip-btn" id="skipForward" title="10 saniyə irəli">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14l5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13"/></svg>
                </button>
                <button class="speed-btn" id="panelSpeed">1x</button>
                <div class="time-display" id="timeDisplay">00:00 / 00:00</div>
            </div>
            <div class="audio-progress" id="audioProgress">
                <div class="audio-progress-fill" id="audioProgressFill"></div>
            </div>
        </div>
    `;
    document.body.appendChild(playerUI);

    const panelBtn = document.getElementById('panelPlayPause');
    const panelSpeed = document.getElementById('panelSpeed');
    const skipBackBtn = document.getElementById('skipBack');
    const skipForwardBtn = document.getElementById('skipForward');
    const progressContainer = document.getElementById('audioProgress');
    const progressFill = document.getElementById('audioProgressFill');
    const timeDisplay = document.getElementById('timeDisplay');

    const speeds = [0.5, 1, 1.5, 2];
    let speedIndex = 1; // Başlanğıc sürət 1x

    panelSpeed.addEventListener('click', () => {
        speedIndex = (speedIndex + 1) % speeds.length;
        const newSpeed = speeds[speedIndex];
        articleAudio.playbackRate = newSpeed;
        panelSpeed.textContent = newSpeed + 'x';
    });

    skipBackBtn.addEventListener('click', () => {
        articleAudio.currentTime = Math.max(0, articleAudio.currentTime - 10);
    });

    skipForwardBtn.addEventListener('click', () => {
        articleAudio.currentTime = Math.min(articleAudio.duration, articleAudio.currentTime + 10);
    });

    const formatTime = (time) => {
        if (isNaN(time)) return "00:00";
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    const updateUI = () => {
        const isPaused = articleAudio.paused;
        panelBtn.innerHTML = isPaused 
            ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>'
            : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
        
        if (!isPaused) {
            playerUI.classList.add('active');
            listenBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg> Dayandır`;
        } else {
            playerUI.classList.remove('active');
            listenBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg> Davam etdir`;
        }
    };

    listenBtn.addEventListener('click', () => {
        if (articleAudio.paused) articleAudio.play();
        else articleAudio.pause();
    });

    panelBtn.addEventListener('click', () => {
        if (articleAudio.paused) articleAudio.play();
        else articleAudio.pause();
    });

    articleAudio.addEventListener('play', updateUI);
    articleAudio.addEventListener('pause', updateUI);
    articleAudio.addEventListener('timeupdate', () => {
        const percent = (articleAudio.currentTime / articleAudio.duration) * 100;
        progressFill.style.width = percent + '%';
        timeDisplay.textContent = `${formatTime(articleAudio.currentTime)} / ${formatTime(articleAudio.duration)}`;
    });

    progressContainer.addEventListener('click', (e) => {
        const width = progressContainer.clientWidth;
        const clickX = e.offsetX;
        articleAudio.currentTime = (clickX / width) * articleAudio.duration;
    });

    articleAudio.addEventListener('ended', () => {
        playerUI.classList.remove('active');
        listenBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg> Bu məqaləni dinləyin`;
    });
}

// Axtarış Overlay funksionallığı
const searchIcon = document.querySelector('.search-icon');
const searchOverlay = document.getElementById('searchOverlay');
const closeSearch = document.getElementById('closeSearch');
const searchInput = document.getElementById('searchInput');
const clearSearch = document.getElementById('clearSearch');
const searchBox = document.querySelector('.search-box');
const searchResults = document.getElementById('searchResults');
const trendingSearches = document.getElementById('trendingSearches');
const trendingTags = document.querySelectorAll('.trending-tag');
const recentSearches = document.getElementById('recentSearches');
const recentTags = document.querySelector('.recent-tags');
const clearHistory = document.getElementById('clearHistory');
const voiceSearchBtn = document.getElementById('voiceSearch');
let searchTimeout;

// Axtarış üçün məlumat bazası
const siteContent = [
    {
        title: "Uşaqların düzgün qidalanması necə olmalıdır?",
        desc: "Uşaqların sağlam böyüməsi və inkişafı üçün düzgün qidalanmanın əhəmiyyəti və faydalı tövsiyələr.",
        url: "articles/usaqlarin_duzgun_qidalanmasi_nece_olmalidir.html",
        img: "images/usaqlarin_duzgun_qidalanmasi_nece_olmalidir.jpg",
        type: "Məqalə",
        readTime: "5 dəq"
    },
    {
        title: "Uşaqların düzgün yuxu rejimi necə olmalıdır?",
        desc: "Uşaqların fiziki və zehni inkişafı üçün yuxunun əhəmiyyəti və düzgün rejim qurma yolları.",
        url: "articles/usaqlarin_duzgun_yuxu_rejimi_nece_olmalidir.html",
        img: "images/usaqlarin_duzgun_yuxu_rejimi_nece_olmalidir.jpg",
        type: "Məqalə",
        readTime: "4 dəq"
    },
    {
        title: "Uşaqların beyin inkişafı üçün nə etmək lazımdır?",
        desc: "Erkən yaşda beyin inkişafını dəstəkləyən ən effektiv üsullar və tövsiyələr.",
        url: "articles/usaqlarin_beyin_inkisafi_ucun_ne_etmek_lazimdir.html",
        img: "images/usaqlarin_beyin_inkisafi_ucun_ne_etmek_lazimdir.jpg",
        type: "Məqalə",
        readTime: "3 dəq"
    },
    {
        title: "Uşağı danışdırmaq üçün nə etməliyik?",
        desc: "Uşaqların nitq inkişafı və valideynlərin bu prosesdəki rolu haqqında ətraflı məqalə.",
        url: "articles/usagi_danisdirmaq_ucun_ne_etmeliyik.html",
        img: "images/valideyn.jpg",
        type: "Məqalə",
        readTime: "3 dəq"
    },
    {
        title: "Paketlənmiş məhsulların zərərləri",
        desc: "Müasir dövrün ən böyük problemlərindən biri olan emal olunmuş qidaların sağlamlığımıza təsiri haqqında.",
        url: "articles/paketlenmis_mehsullarin_zererleri.html",
        img: "images/paketlenmis_mehsullarin_zererleri.jpg",
        type: "Məqalə",
        readTime: "6 dəq"
    },
    {
        title: "Paketlənmiş məhsulların zərərləri (Video)",
        desc: "Emal olunmuş qidaların sağlamlığımıza təsiri haqqında maarifləndirici video icmal.",
        url: "videos/paketlenmis_mehsullarin_zererleri.html",
        img: "https://i.ytimg.com/vi_webp/PP5BympxEUQ/mqdefault.webp",
        type: "Video"
    },
    {
        title: "Bayatı kürd muğamı",
        desc: "Azərbaycan muğam sənətinin incilərindən olan Bayatı kürd muğamının ifası.",
        url: "videos/bayati_kurd_mugami.html",
        img: "https://i.ytimg.com/vi/9kLzT0T1mxM/mqdefault.jpg?sqp=-oaymwEmCMACELQB8quKqQMa8AEB-AHOBYACgAqKAgwIABABGGUgVChGMA8=&rs=AOn4CLBel09-_L2np6GrrPPX7Se3zL8bCA",
        type: "Video"
    }
];

if (searchIcon && searchOverlay) {
    searchIcon.addEventListener('click', (e) => {
        e.preventDefault();
        searchOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Scroll-u bağla
        displayRecentSearches();
        if (searchInput) {
            setTimeout(() => searchInput.focus(), 300);
        }
    });

    if (closeSearch) {
        closeSearch.addEventListener('click', () => {
            searchOverlay.classList.remove('active');
            document.body.style.overflow = ''; // Scroll-u qaytar
        });
    }

    searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) {
            searchOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

if (searchInput && clearSearch && searchBox) {
    searchInput.addEventListener('input', () => {
        const query = searchInput.value;
        searchBox.classList.toggle('has-text', query.length > 0);

        if (voiceSearchBtn) {
            voiceSearchBtn.style.display = query.length > 0 ? 'none' : 'flex';
        }

        clearTimeout(searchTimeout);

        if (query.trim() === '') {
            if (searchResults) searchResults.innerHTML = '';
            displayRecentSearches();
            if (trendingSearches) trendingSearches.style.display = 'block';
            return;
        }

        if (recentSearches) recentSearches.style.display = 'none';
        if (trendingSearches) trendingSearches.style.display = 'none';
        showSkeletons();

        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 500); // Animasiyanın görünməsi üçün 0.5 saniyəlik gecikmə
    });

    clearSearch.addEventListener('click', () => {
        searchInput.value = '';
        searchBox.classList.remove('has-text');
        if (voiceSearchBtn) voiceSearchBtn.style.display = 'flex';
        if (searchResults) searchResults.innerHTML = '';
        displayRecentSearches();
        if (trendingSearches) trendingSearches.style.display = 'block';
        searchInput.focus();
    });
}

if (voiceSearchBtn && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'az-AZ';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    voiceSearchBtn.addEventListener('click', () => {
        if (voiceSearchBtn.classList.contains('listening')) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });

    recognition.onstart = () => {
        voiceSearchBtn.classList.add('listening');
        searchInput.placeholder = "Danışın...";
    };

    recognition.onend = () => {
        voiceSearchBtn.classList.remove('listening');
        searchInput.placeholder = "Məqalə və ya video axtar...";
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        searchInput.value = transcript;
        searchBox.classList.add('has-text');
        if (trendingSearches) trendingSearches.style.display = 'none';
        if (recentSearches) recentSearches.style.display = 'none';
        showSkeletons();
        setTimeout(() => performSearch(transcript), 500);
    };
} else if (voiceSearchBtn) {
    voiceSearchBtn.style.display = 'none';
}

if (clearHistory) {
    clearHistory.addEventListener('click', () => {
        localStorage.removeItem('recent-searches');
        displayRecentSearches();
    });
}

if (trendingTags.length > 0) {
    trendingTags.forEach(tag => {
        tag.addEventListener('click', () => {
            searchInput.value = tag.textContent;
            searchBox.classList.add('has-text');
            
            // Animasiyalı keçid məntiqi
            if (trendingSearches) trendingSearches.classList.add('fade-out');
            if (recentSearches) recentSearches.classList.add('fade-out');
            if (voiceSearchBtn) voiceSearchBtn.style.display = 'none';

            setTimeout(() => {
                if (trendingSearches) {
                    trendingSearches.style.display = 'none';
                    trendingSearches.classList.remove('fade-out');
                }
                if (recentSearches) {
                    recentSearches.style.display = 'none';
                    recentSearches.classList.remove('fade-out');
                }
                showSkeletons();
                setTimeout(() => performSearch(tag.textContent), 300);
            }, 300);
        });
    });
}

function getRecentSearches() {
    try {
        return JSON.parse(localStorage.getItem('recent-searches') || '[]');
    } catch (e) {
        return [];
    }
}

function saveSearch(term) {
    const query = term.toLowerCase().trim();
    if (!query) return;
    
    let searches = getRecentSearches();
    searches = searches.filter(s => s.toLowerCase() !== query);
    searches.unshift(term.trim());
    searches = searches.slice(0, 5);
    localStorage.setItem('recent-searches', JSON.stringify(searches));
}

function displayRecentSearches() {
    if (!recentSearches || !recentTags) return;
    
    const searches = getRecentSearches();
    if (searches.length > 0) {
        recentSearches.style.display = 'block';
        recentTags.innerHTML = searches.map(s => `<span class="recent-tag">${s}</span>`).join('');
        
        recentTags.querySelectorAll('.recent-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                searchInput.value = tag.textContent;
                searchBox.classList.add('has-text');
                
                // Animasiyalı keçid məntiqi
                if (trendingSearches) trendingSearches.classList.add('fade-out');
                if (recentSearches) recentSearches.classList.add('fade-out');
                if (voiceSearchBtn) voiceSearchBtn.style.display = 'none';

                setTimeout(() => {
                    if (trendingSearches) {
                        trendingSearches.style.display = 'none';
                        trendingSearches.classList.remove('fade-out');
                    }
                    if (recentSearches) {
                        recentSearches.style.display = 'none';
                        recentSearches.classList.remove('fade-out');
                    }
                    showSkeletons();
                    setTimeout(() => performSearch(tag.textContent), 300);
                }, 300);
            });
        });
    } else {
        recentSearches.style.display = 'none';
    }
}

function showSkeletons() {
    if (!searchResults) return;
    const skeletonHTML = `
        <div class="skeleton-card">
            <div class="skeleton skeleton-img"></div>
            <div class="skeleton-content">
                <div class="card-tags">
                    <div class="skeleton" style="width: 50px; height: 14px; border-radius: 4px;"></div>
                </div>
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text" style="width: 60%;"></div>
            </div>
        </div>
    `;
    searchResults.innerHTML = skeletonHTML.repeat(3);
}

function performSearch(query) {
    if (!searchResults) return;
    
    const term = query.trim();
    if (term === '') {
        searchResults.innerHTML = '';
        return;
    }

    const lowerSearchTerm = term.toLowerCase();
    const isSubPage = window.location.pathname.includes('/articles/') || window.location.pathname.includes('/videos/');
    const pathPrefix = isSubPage ? '../' : '';

    const results = siteContent.filter(item => 
        item.title.toLowerCase().includes(lowerSearchTerm) || 
        item.desc.toLowerCase().includes(lowerSearchTerm)
    );

    if (results.length > 0) {
        // Nəticə tapıldıqda axtarış tarixçəsinə əlavə et
        saveSearch(query);

        // Açar sözü vurğulamaq üçün regex (xüsusi simvolları qaçıraraq)
        const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');

        searchResults.innerHTML = results.map((item, index) => {
            let imgSrc = item.img;
            if (!imgSrc.startsWith('http') && isSubPage) imgSrc = '../' + imgSrc;
            
            const highlightedTitle = item.title.replace(regex, '<strong>$1</strong>');
            const highlightedDesc = item.desc.replace(regex, '<strong>$1</strong>');

            return `
                <a href="${pathPrefix + item.url}" class="project-card" style="animation-delay: ${index * 0.1}s">
                    <div class="img-placeholder">
                        <img src="${imgSrc}" alt="${item.title}" class="card-image" loading="lazy" onload="this.classList.add('loaded')">
                    </div>
                    <div>
                        <div class="card-tags">
                            <span class="result-type-tag">${item.type}</span>
                            ${item.type === "Məqalə" ? `<span class="read-time-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 3px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>${item.readTime}</span>` : ''}
                        </div>
                        <h3>${highlightedTitle}</h3>
                        <p>${highlightedDesc}</p>
                    </div>
                </a>
            `;
        }).join('');
    } else {
        // Nəticə tapılmadıqda göstərilən mesaj
        searchResults.innerHTML = `
            <div class="no-results">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                <p>Təəssüf ki, axtarışınıza uyğun nəticə tapılmadı.</p>
                <button id="viewTrendingBtn" class="btn" style="margin-top: 20px; opacity: 1; animation: none;">Trend olan mövzulara bax</button>
            </div>
        `;

        document.getElementById('viewTrendingBtn')?.addEventListener('click', () => {
            searchInput.value = '';
            searchBox.classList.remove('has-text');
            if (voiceSearchBtn) voiceSearchBtn.style.display = 'flex';
            searchResults.innerHTML = '';
            displayRecentSearches();
            if (trendingSearches) {
                trendingSearches.style.display = 'block';
            }
            searchInput.focus();
        });
    }
}

// Yuxarı sürüşdürmə düyməsi (Scroll to top) funksionallığı
const scrollTopBtn = document.createElement('button');
scrollTopBtn.className = 'scroll-top-btn';
scrollTopBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>';
scrollTopBtn.setAttribute('title', 'Yuxarı qalx');
document.body.appendChild(scrollTopBtn);

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});
