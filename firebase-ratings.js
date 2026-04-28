import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, updateDoc, increment, onSnapshot, getDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
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
        const docSnap = await getDoc(ratingDocRef);
        const ratingKey = String(value); // 1, 2, 3, 4, 5 sahələri üçün

        if (docSnap.exists()) {
            await updateDoc(ratingDocRef, {
                sum: increment(Number(value)),
                count: increment(1),
                [ratingKey]: increment(1)
            });
        } else {
            const initialData = {
                sum: Number(value),
                count: 1,
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0
            };
            initialData[ratingKey] = 1;
            await setDoc(ratingDocRef, initialData);
        }
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
    ratingStars.forEach(s => {
        const starVal = parseInt(s.getAttribute('data-rating'));
        if (starVal <= value) {
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
            const avg = (data.sum / data.count).toFixed(1);
            avgDisplay.innerHTML = `Cari reytinq: <strong>${avg}</strong> / 5 (${data.count} səs)`;
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