import * as admin from 'firebase-admin';

// Initialize Firebase Admin (adjust path to your service account or rely on existing config if it uses default credentials)
import { admin as myAdmin } from './src/config/firebaseAdmin';

async function checkUser() {
  const uid = 'mRmD1hJfyaSQDkj04G9dLP4MIc23'; // User's assumed UID
  try {
    const doc = await myAdmin.firestore().collection('users').doc(uid).get();
    if (doc.exists) {
      console.log('User Data:', JSON.stringify(doc.data(), null, 2));
    } else {
      console.log('User not found in Firestore.');
    }
  } catch (error) {
    console.error('Error fetching user:', error);
  }
  process.exit(0);
}

checkUser();
