// Firebase SDK-dan lazım olan funksiyaları import edin
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, doc, updateDoc, increment, getDoc, setDoc } from "firebase/firestore";

// Veb tətbiqinizin Firebase konfiqurasiyası
const firebaseConfig = {
  apiKey: "AIzaSyDtS4MS89SSIJqRdmJgXaIjvn2Mf1KDOfE",
  authDomain: "taryelhuseynzadewebsite.firebaseapp.com",
  projectId: "taryelhuseynzadewebsite",
  storageBucket: "taryelhuseynzadewebsite.firebasestorage.app",
  messagingSenderId: "693207980946",
  appId: "1:693207980946:web:074a2addbcb5f3340f3f4b",
  measurementId: "G-39XS3DDQRV"
};

// Firebase-i işə salın
const app = initializeApp(firebaseConfig);

// Firestore (verilənlər bazası) xidmətini işə salın
const db = getFirestore(app);

// Analytics yalnız brauzer mühitində dəstəklənir
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

/**
 * Səhifə və ya layihə üçün baxış sayını artırır
 * @param {string} pageId - Səhifənin və ya layihənin unikal ID-si
 */
export const updateViewCount = async (pageId) => {
  const docRef = doc(db, "views", pageId);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await updateDoc(docRef, { count: increment(1) });
    } else {
      await setDoc(docRef, { count: 1 });
    }
  } catch (error) {
    console.error("Baxış sayı yenilənərkən xəta:", error);
  }
};

export { app, analytics, db, doc, getDoc };
export default app;