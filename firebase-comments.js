import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

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
// Firestore kolleksiya yolu: comments/{pagePath}/items
const commentsColRef = collection(db, "comments", pagePath, "items");

const commentForm = document.getElementById('commentForm');
const commentsList = document.getElementById('commentsList');
let replyToId = null;

if (commentForm && commentsList) {
    // Cavab verilən şəxs barədə məlumat paneli (dinamik yaradılır)
    const replyInfo = document.createElement('div');
    replyInfo.className = 'replying-to-info';
    replyInfo.innerHTML = `<span></span><span class="cancel-reply" title="Ləğv et">&times;</span>`;
    commentForm.insertBefore(replyInfo, commentForm.firstChild);

    const replyTextSpan = replyInfo.querySelector('span');
    const cancelReplyBtn = replyInfo.querySelector('.cancel-reply');

    cancelReplyBtn.addEventListener('click', () => {
        replyToId = null;
        replyInfo.classList.remove('active');
    });

    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const authorInput = document.getElementById('commentAuthor');
        const textInput = document.getElementById('commentText');

        try {
            await addDoc(commentsColRef, {
                author: authorInput.value,
                text: textInput.value,
                timestamp: serverTimestamp(),
                replyTo: replyToId
            });

            authorInput.value = '';
            textInput.value = '';
            replyToId = null;
            replyInfo.classList.remove('active');
        } catch (error) {
            console.error("Şərh göndərilərkən xəta:", error);
        }
    });

    function createCommentElement(id, data, isReply = false) {
        const date = data.timestamp ? data.timestamp.toDate().toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'İndi';
        const div = document.createElement('div');
        div.className = 'comment-item';
        div.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">${data.author}</span>
                <span class="comment-date">${date}</span>
            </div>
            <p class="comment-text">${data.text}</p>
            ${!isReply ? `<button class="reply-btn" data-id="${id}" data-author="${data.author}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path></svg>
                Cavab ver
            </button>` : ''}
        `;

        if (!isReply) {
            div.querySelector('.reply-btn').onclick = () => {
                replyToId = id;
                replyTextSpan.textContent = `Cavab verilir: ${data.author}`;
                replyInfo.classList.add('active');
                const textInput = document.getElementById('commentText');
                textInput.focus();
                textInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            };
        }
        return div;
    }

    const q = query(commentsColRef, orderBy("timestamp", "desc"));
    onSnapshot(q, (snapshot) => {
        commentsList.innerHTML = '';
        const allComments = [];
        const parents = allComme
            commentsList.appendC
            ement(child.id, chil