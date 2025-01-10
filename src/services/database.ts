import { db } from '../config/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth } from '../config/firebase';

interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  joinDate: Date;
  lastUpdated: Date;
  personalInfo?: {
    age: number;
    dateOfBirth: string;
    gender: string;
    bloodType: string;
    medicalConditions: string;
  };
  measurements?: {
    weight: number;
    height: number;
  };
  preferences?: {
    dietary: string[];
    activityLevel: string;
    fitnessLevel: string;
  };
  goals?: string[];
}

interface WorkoutSession {
  date: Date;
  type: string;
  exercises: CompletedExercise[];
  duration: number;
  notes?: string;
}

interface CompletedExercise {
  name: string;
  sets: Array<{
    weight: number;
    reps: number;
  }>;
}

interface UserGoals {
  targetWeight?: number;
  weeklyWorkouts?: number;
  fitnessLevel?: string;
  specificGoals?: string[];
}

interface UserStats {
  weight?: number;
  height?: number;
  bodyFat?: number;
  lastUpdated: Date;
}

export const createUserProfile = async (userData: UserProfile) => {
  try {
    await setDoc(doc(db, 'users', userData.uid), {
      ...userData,
      joinDate: userData.joinDate.toISOString(),
      lastUpdated: userData.lastUpdated.toString()
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (uid: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (uid: string, updates: any) => {
  try {
    console.log('Starting database update...'); // Debug log
    const userRef = doc(db, 'users', uid);
    
    // First check if document exists
    const docSnap = await getDoc(userRef);
    
    const userData = {
      ...updates,
      updatedAt: new Date().toISOString(),
      path: `/databases/(default)/documents/users/${uid}` // Debug info
    };

    if (!docSnap.exists()) {
      console.log('Creating new user document at:', userData.path);
      await setDoc(userRef, {
        ...userData,
        createdAt: new Date().toISOString()
      });
    } else {
      console.log('Updating existing user document at:', userData.path);
      await updateDoc(userRef, userData);
    }
    
    // Verify the update
    const verifyDoc = await getDoc(userRef);
    console.log('Document data after update:', verifyDoc.data());
    
  } catch (error) {
    console.error('Database error:', error);
    console.error('Error code:', (error as any).code);
    console.error('Error message:', (error as any).message);
    throw error;
  }
};

export const addWorkoutSession = async (uid: string, workout: WorkoutSession) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const workoutHistory = userData.workoutHistory || [];
      
      await updateDoc(userRef, {
        workoutHistory: [...workoutHistory, {
          ...workout,
          date: workout.date.toISOString()
        }],
        lastUpdated: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error adding workout session:', error);
    throw error;
  }
};

export const updateUserStats = async (uid: string, stats: UserStats) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      stats: {
        ...stats,
        lastUpdated: stats.lastUpdated.toISOString()
      }
    });
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
};

export const setUserGoals = async (uid: string, goals: UserGoals) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      goals,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error setting user goals:', error);
    throw error;
  }
}; 