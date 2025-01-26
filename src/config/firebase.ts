import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyB4JkzPJ6D0usSs-Q-xLYt2DqNoqblfZ8Y",
  authDomain: "triple-a-b8605.firebaseapp.com",
  databaseURL: "https://triple-a-b8605-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "triple-a-b8605",
  storageBucket: "triple-a-b8605.firebasestorage.app",
  messagingSenderId: "182821274121",
  appId: "1:182821274121:web:bb3ec74d399a7ca05f2ed8",
  measurementId: "G-P317SYYJZK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics
export const analytics = getAnalytics(app);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Admin credentials
const adminEmail = "rawatneha9410549004@gmail.com";
const adminPassword = "7900696615@";

// Function to check if user is admin
export const checkAdminStatus = async () => {
  const user = auth.currentUser;
  if (!user) return false;

  try {
    const idTokenResult = await user.getIdTokenResult(true); // Force token refresh
    return !!idTokenResult.claims.admin;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

// Sign in as admin and verify admin status
const signInAsAdmin = async () => {
  try {
    // First try to sign in
    const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    console.log("Sign in successful, checking admin status...");
    
    // Force token refresh to get latest claims
    await userCredential.user.getIdToken(true);
    
    const isAdmin = await checkAdminStatus();
    if (isAdmin) {
      console.log("Admin signed in successfully with admin privileges");
    } else {
      console.warn("User signed in but does not have admin privileges. Please verify admin claims are set.");
    }
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      try {
        // If user doesn't exist, create it
        console.log("Admin user not found, creating new admin account...");
        await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
        console.log("Admin account created, please run the setInitialAdmin script to set admin claims");
      } catch (createError) {
        console.error("Error creating admin account:", createError);
      }
    } else {
      console.error("Admin auth error:", error);
    }
  }
};

// Listen for auth state changes
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Force token refresh when auth state changes
    await user.getIdToken(true);
    const isAdmin = await checkAdminStatus();
    console.log("Auth state changed:", isAdmin ? "Admin user with privileges" : "Non-admin user");
  } else {
    console.log("User signed out");
    // Try to sign in again if no user is present
    signInAsAdmin();
  }
});

// Initial sign in
signInAsAdmin();

export default app;
