
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, updateDoc, increment, onSnapshot, getDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const firebaseConfig = {
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

// Get current page filename as document ID
const pagePath = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
// User specified "document id: likes". 
// We use a collection named "likes" and the document ID as "likes" inside a subcollection of the article, 
// or just use "likes" as the collection and pagePath as the doc ID.
// To strictly follow "document id: likes", we'll use: doc(db, "likes", pagePath)
// Wait, if doc ID is "likes", then it should be doc(db, "articles", pagePath, "stats", "likes")
const likesDocRef = doc(db, "articles", pagePath, "stats", "likes");

const likeArticleBtn = document.getElementById('likeArticleBtn');
const dislikeArticleBtn = document.getElementById('dislikeArticleBtn');
const likeCountSpan = document.getElementById('likeCount');
const dislikeCountSpan = document.getElementById('dislikeCount');

const storageKey = `article_reactions_${pagePath}`;

async function ensureDocExists() {
    const docSnap = await getDoc(likesDocRef);
    if (!docSnap.exists()) {
        try {
            await setDoc(likesDocRef, { likes: 0, dislikes: 0 }, { merge: true });
        } catch (e) {
            console.error("Error creating likes document:", e);
        }
    }
}

function updateUI(likes, dislikes, userAction) {
    if (likeCountSpan) likeCountSpan.textContent = likes || 0;
    if (dislikeCountSpan) dislikeCountSpan.textContent = dislikes || 0;

    if (likeArticleBtn) {
        likeArticleBtn.style.color = userAction === 'like' ? '#2563eb' : '';
        likeArticleBtn.style.borderColor = userAction === 'like' ? '#2563eb' : '';
    }

    if (dislikeArticleBtn) {
        dislikeArticleBtn.style.color = userAction === 'dislike' ? '#ef4444' : '';
        dislikeArticleBtn.style.borderColor = userAction === 'dislike' ? '#ef4444' : '';
    }
}

function listenToLikes() {
    onSnapshot(likesDocRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            const reactions = JSON.parse(localStorage.getItem(storageKey) || '{"userAction": null}');
            updateUI(data.likes, data.dislikes, reactions.userAction);
        } else {
            const reactions = JSON.parse(localStorage.getItem(storageKey) || '{"userAction": null}');
            updateUI(0, 0, reactions.userAction);
        }
    });
}

if (likeArticleBtn && dislikeArticleBtn) {
    ensureDocExists();
    listenToLikes();

    likeArticleBtn.addEventListener('click', async () => {
        let reactions = JSON.parse(localStorage.getItem(storageKey) || '{"userAction": null}');
        const oldAction = reactions.userAction;

        try {
            if (oldAction === 'like') {
                // Remove like
                await updateDoc(likesDocRef, { likes: increment(-1) });
                reactions.userAction = null;
            } else if (oldAction === 'dislike') {
                // Switch from dislike to like
                await updateDoc(likesDocRef, { likes: increment(1), dislikes: increment(-1) });
                reactions.userAction = 'like';
                if (window.triggerConfetti) window.triggerConfetti(likeArticleBtn);
            } else {
                // Add like
                await updateDoc(likesDocRef, { likes: increment(1) });
                reactions.userAction = 'like';
                if (window.triggerConfetti) window.triggerConfetti(likeArticleBtn);
            }
            localStorage.setItem(storageKey, JSON.stringify(reactions));
            // UI will be updated by onSnapshot
        } catch (error) {
            console.error("Like error:", error);
        }
    });

    dislikeArticleBtn.addEventListener('click', async () => {
        let reactions = JSON.parse(localStorage.getItem(storageKey) || '{"userAction": null}');
        const oldAction = reactions.userAction;

        try {
            if (oldAction === 'dislike') {
                // Remove dislike
                await updateDoc(likesDocRef, { dislikes: increment(-1) });
                reactions.userAction = null;
            } else if (oldAction === 'like') {
                // Switch from like to dislike
                await updateDoc(likesDocRef, { likes: increment(-1), dislikes: increment(1) });
                reactions.userAction = 'dislike';
            } else {
                // Add dislike
                await updateDoc(likesDocRef, { dislikes: increment(1) });
                reactions.userAction = 'dislike';
            }
            localStorage.setItem(storageKey, JSON.stringify(reactions));
            // UI will be updated by onSnapshot
        } catch (error) {
            console.error("Dislike error:", error);
        }
    });
}
