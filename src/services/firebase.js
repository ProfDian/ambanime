// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  setDoc,
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyChN40bgg07K2mu-_eO86RhB3gUah_FVjo",
  authDomain: "ambanime-pbo.firebaseapp.com",
  projectId: "ambanime-pbo",
  storageBucket: "ambanime-pbo.firebasestorage.app",
  messagingSenderId: "244665639243",
  appId: "1:244665639243:web:0762b949a1916874b088ce",
  measurementId: "G-RWZMGNQ1GH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Auth Functions
export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      role: 'user',
      favorites: [],
      watchlist: [],
      reviews: [],
      createdAt: new Date().toISOString()
    });
    
    return userCredential.user;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      lastLogin: new Date().toISOString()
    }, { merge: true });
    
    return userCredential.user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

// User Functions
export const getUserRole = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data().role;
    }
    return null;
  } catch (error) {
    console.error("Get user role error:", error);
    return null;
  }
};

export const checkUserExists = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists();
  } catch (error) {
    console.error("Check user exists error:", error);
    return false;
  }
};

// Favorites and Watchlist Functions
export const toggleFavorite = async (userId, animeId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const favorites = userDoc.data().favorites || [];

    if (favorites.includes(animeId)) {
      await updateDoc(userRef, {
        favorites: arrayRemove(animeId)
      });
    } else {
      await updateDoc(userRef, {
        favorites: arrayUnion(animeId)
      });
    }
  } catch (error) {
    console.error("Toggle favorite error:", error);
    throw error;
  }
};

export const toggleWatchlist = async (userId, animeId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const watchlist = userDoc.data().watchlist || [];

    if (watchlist.includes(animeId)) {
      await updateDoc(userRef, {
        watchlist: arrayRemove(animeId)
      });
    } else {
      await updateDoc(userRef, {
        watchlist: arrayUnion(animeId)
      });
    }
  } catch (error) {
    console.error("Toggle watchlist error:", error);
    throw error;
  }
};

// Review Functions
export const addReview = async (userId, animeId, content) => {
  try {
    const reviewRef = doc(collection(db, 'reviews'));
    await setDoc(reviewRef, {
      userId,
      animeId,
      content,
      createdAt: new Date().toISOString()
    });
    return reviewRef.id;
  } catch (error) {
    console.error("Add review error:", error);
    throw error;
  }
};

export const getAnimeReviews = async (animeId) => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(reviewsRef, where('animeId', '==', animeId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Get reviews error:", error);
    throw error;
  }
};

// Admin Functions
export const getAllUsers = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    return usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Get all users error:", error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    // Delete user reviews
    const reviewsRef = collection(db, 'reviews');
    const q = query(reviewsRef, where('userId', '==', userId));
    const reviewsSnapshot = await getDocs(q);
    const deletePromises = reviewsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Delete user document
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    console.error("Delete user error:", error);
    throw error;
  }
};

export const getUserStats = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
    
    return {
      totalUsers: usersSnapshot.size,
      totalReviews: reviewsSnapshot.size
    };
  } catch (error) {
    console.error("Get stats error:", error);
    throw error;
  }
};

export { auth, db };