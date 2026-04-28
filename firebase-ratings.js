import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, setDoc, increment, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const env = import.meta.env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const pagePath = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
// Firestore document Id: rating (subcollection structure for organization)
const ratingDocRef = doc(db, "article_ratings", pagePath, "metrics", "rating");

const ratingStars = document.querySelectorAll('.rating-stars span');
const ratingMsg = document.getElementById('ratingMessage');

async function handleRatingClick(value) {
    if (localStorage.getItem(`rated_${pagePath}`)) {
        if (ratingMsg) {
            ratingMsg.textContent = "Siz artıq bu məqaləni qiymətləndirmisiniz.";
            ratingMsg.style.color = "#ef4444";
        }
        return;
    }

    try {
        const ratingNum = Number(value);
        const ratingKey = String(ratingNum);

        await setDoc(ratingDocRef, {
            sum: increment(ratingNum),
            count: increment(1),
            [ratingKey]: increment(1)
        }, { merge: true });

        localStorage.setItem(`rated_${pagePath}`, value);
        
        if (ratingMsg) {
            ratingMsg.textContent = "Qiymətləndirdiyiniz üçün təşəkkür edirik!";
            ratingMsg.style.color = document.body.classList.contains('dark-mode') ? '#34d399' : '#059669';
        }
        updateStarsUI(value);
    } catch (error) {
        console.error("Qiymətləndirmə xətası:", error);
    }
}

function updateStarsUI(value) {
    const val = parseInt(value);
    ratingStars.forEach(s => {
        const starVal = parseInt(s.getAttribute('data-rating'));
        if (starVal <= val) {
            s.classList.add('selected');
        } else {
            s.classList.remove('selected');
        }
    });
}

function listenToRatings() {
    onSnapshot(ratingDocRef, (doc) => {
        const avgDisplay = document.getElementById('avgRating');
        if (!avgDisplay) return;

        if (doc.exists()) {
            const data = doc.data();
            const avg = data.count > 0 ? (data.sum / data.count).toFixed(1) : 0;
            avgDisplay.innerHTML = `Cari reytinq: <strong>${avg}</strong> / 5 (${data.count || 0} səs)`;
        } else {
            avgDisplay.innerHTML = `Hələ qiymətləndirilməyib (0 səs)`;
        }
    });
}

if (ratingStars.length > 0) {
    const savedRating = localStorage.getItem(`rated_${pagePath}`);
    if (savedRating) updateStarsUI(savedRating);

    ratingStars.forEach(star => {
        star.addEventListener('click', () => {
            handleRatingClick(star.getAttribute('data-rating'));
        });
    });

    listenToRatings();
}