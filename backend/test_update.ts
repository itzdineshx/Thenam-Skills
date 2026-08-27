import * as admin from 'firebase-admin';
import { admin as myAdmin } from './src/config/firebaseAdmin';

async function testUpdate() {
  const uid = 'mRmD1hJfyaSQDkj04G9dLP4MIc23';
  try {
    const db = myAdmin.firestore();
    const userRef = db.collection('users').doc(uid);
    
    // Simulate what the backend does
    const updates = {
      coverImage: 'https://i.ibb.co/tMZndYjj/ai-tss.png',
      dateOfBirth: '2000-01-01',
      updatedAt: admin.firestore.Timestamp.now()
    };

    await userRef.update(updates);
    const finalDoc = await userRef.get();
    console.log('Update Successful:', finalDoc.data()?.coverImage === updates.coverImage);
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

testUpdate();
