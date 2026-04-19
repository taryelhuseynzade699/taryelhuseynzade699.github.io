import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, updateDoc, increment, onSnapshot, getDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDe6mS2vZydl_HqtUJknXRcmTclKXflSRo",
  authDomain: "taryel-huseynzade.firebaseapp.com",
  projectId: "taryel-huseynzade",
  storageBucket: "taryel-huseynzade.firebasestorage.app",
  messagingSenderId: "346312589052",
  appId: "1:346312589052:web:4a5ffe183df2d9c1efe179",
  measurementId: "G-C9LMR8KBL0"
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
        if (docSnap.exists()) {
            await updateDoc(ratingDocRef, {
                sum: increment(Number(value)),
                count: increment(1)
            });
        } else {
            await setDoc(ratingDocRef, {
                sum: Number(value),
                count: 1
            });
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