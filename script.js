import { updateViewCount, db, doc, getDoc } from './firebase.js';

console.log("Script loaded and running...");

// Menyunun açılıb-bağlanması
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
}

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

import { updateViewCount, db, doc, getDoc } from './firebase.js';

// İzləmə sayını Firebase ilə idarə edən funksiya
async function initViewCounter() {
    const viewDisplay = document.getElementById('viewCountValue');
    if (viewDisplay) {
        // Səhifənin unikal ID-si kimi pathname-i götürürük
        let path = window.location.pathname;
        let pageId = path.split('/').pop().replace('.html', '');
        
        // Əgər ana səhifədirsə (/)
        if (!pageId || pageId === 'index' || path === '/') {
            pageId = 'home';
        }
        
        const hasVisited = sessionStorage.getItem(`visited_${pageId}`);
        
        try {
            const docRef = doc(db, "views", pageId);
            
            // İlk baxışdırsa artır
            if (!hasVisited) {
                await updateViewCount(pageId);
                sessionStorage.setItem(`visited_${pageId}`, 'true');
            }

            // Sayı göstər
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                viewDisplay.textContent = docSnap.data().count.toLocaleString();
            } else {
                // Əgər sənəd hələ yoxdursa və yenicə yaradılıbsa 1 göstər
                viewDisplay.textContent = '1';
            }
        } catch (err) {
            console.error('Firebase izləmə sayı xətası:', err);
            viewDisplay.textContent = '0';
        }
    }
}

document.addEventListener('DOMContentLoaded', initViewCounter);