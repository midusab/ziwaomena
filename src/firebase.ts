import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Import your Firebase config
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Export Auth and Firestore (DEFAULT database)
export const auth = getAuth(app);
export const db = getFirestore(app);
// Validate Connection to Firestore
async function testConnection() {
  try {
    // Attempt to read a dummy doc to verify connection
    await getDocFromServer(doc(db, '_connection_test', 'initial'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
  }
}

testConnection();
