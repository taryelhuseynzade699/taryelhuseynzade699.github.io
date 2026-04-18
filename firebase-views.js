
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

// Get current page filename as document ID (e.g., paketlenmis_mehsullarin_zererleri)
const pagePath = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
const viewDocRef = doc(db, "views", pagePath);

async function incrementViewCount() {
    try {
        const docSnap = await getDoc(viewDocRef);
        if (docSnap.exists()) {
            await updateDoc(viewDocRef, {
                count: increment(1)
            });
        } else {
            await setDoc(viewDocRef, {
                count: 1
            });
        }
    } catch (error) {
        console.error("Baxış sayı artırılarkən xəta baş verdi:", error);
    }
}

function listenToViewCount() {
    const viewCountElement = document.getElementById('viewCount');
    if (!viewCountElement) return;

    onSnapshot(viewDocRef, (doc) => {
        if (doc.exists()) {
            viewCountElement.innerText = doc.data().count;
        } else {
            viewCountElement.innerText = "0";
        }
    });
}

// Run functions
incrementViewCount();
listenToViewCount();
