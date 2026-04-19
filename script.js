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

// Axtarış Funksionallığı
const searchBtnHeader = document.getElementById('searchBtnHeader');
const searchOverlay = document.getElementById('searchOverlay');
const closeSearch = document.getElementById('closeSearch');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

if (searchBtnHeader && searchOverlay) {
    searchBtnHeader.addEventListener('click', () => {
        searchOverlay.classList.add('active');
        setTimeout(() => searchInput.focus(), 100);
        document.body.style.overflow = 'hidden';
    });

    const closeSearchFunc = () => {
        searchOverlay.classList.remove('active');
        document.body.style.overflow = '';
        searchInput.value = '';
        searchResults.innerHTML = '';
    };

    closeSearch.addEventListener('click', closeSearchFunc);

    searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) closeSearchFunc();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
            closeSearchFunc();
        }
    });

    // Axtarış Məntiqi
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        if (query.length < 2) {
            searchResults.innerHTML = '';
            return;
        }

        // Bütün məqalə və video kartlarını topla
        const cards = Array.from(document.querySelectorAll('.project-card'));
        
        if (cards.length === 0) {
            // Əgər səhifədə kart yoxdursa (məsələn, məqalə səhifəsindəyik),
            // axtarış nəticələrini göstərmək üçün ana səhifəyə yönləndirmə təklif edə bilərik
            // və ya sadəcə "Ana səhifədə axtar" mesajı göstərə bilərik.
            searchResults.innerHTML = `<div style="text-align: center; padding: 20px;">
                <p style="color: var(--text-color); margin-bottom: 15px;">Axtarış üçün ana səhifəyə keçid edin.</p>
                <a href="${window.location.pathname.includes('/articles/') || window.location.pathname.includes('/videos/') ? '../index.html' : 'index.html'}?search=${encodeURIComponent(query)}" class="btn" style="opacity: 1; animation: none;">Ana səhifədə axtar</a>
            </div>`;
            return;
        }

        const results = cards.filter(card => {
            const title = card.querySelector('h3')?.innerText.toLowerCase() || '';
            const description = card.querySelector('p')?.innerText.toLowerCase() || '';
            return title.includes(query) || description.includes(query);
        });

        displayResults(results);
    });

    // Səhifə yükləndikdə URL-də axtarış sorğusu varmı yoxla
    window.addEventListener('load', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');
        if (searchQuery && searchBtnHeader) {
            searchBtnHeader.click();
            searchInput.value = searchQuery;
            // Input event-ini əllə tətiklə ki, axtarış başlasın
            searchInput.dispatchEvent(new Event('input'));
        }
    });

    function displayResults(results) {
        if (results.length === 0) {
            searchResults.innerHTML = '<p style="text-align: center; color: var(--text-color); opacity: 0.7;">Nəticə tapılmadı.</p>';
            return;
        }

        searchResults.innerHTML = '';
        results.forEach(result => {
            const clone = result.cloneNode(true);
            clone.classList.remove('reveal', 'active'); // Animasiya klasslarını təmizlə
            clone.style.opacity = '1';
            clone.style.transform = 'none';
            clone.style.animation = 'none';
            
            // Search overlay içində kliklədikdə overlay-i bağla
            clone.addEventListener('click', () => {
                searchOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
            
            searchResults.appendChild(clone);
        });
    }
}
