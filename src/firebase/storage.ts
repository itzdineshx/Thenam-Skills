import { ref, uploadBytesResumable, getDownloadURL, uploadBytes } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { storage, db } from './config';

export const uploadEducatorAvatar = async (userId: string, file: File): Promise<string> => {
  const storageRef = ref(storage, `users/${userId}/profile/avatar_${Date.now()}`);
  const snapshot = await uploadBytes(storageRef, file, { contentType: file.type });
  const downloadUrl = await getDownloadURL(snapshot.ref);

  await updateDoc(doc(db, 'users', userId), {
    photoURL: downloadUrl,
    updatedAt: new Date().toISOString()
  });
  return downloadUrl;
};

export const uploadProfileImage = async (uid: string, file: File): Promise<string> => {
  // 1. Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid image format. Supported formats: JPG, JPEG, PNG, WebP');
  }

  // 2. Validate file size (5MB = 5 * 1024 * 1024 bytes)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('Image file is too large. Maximum size allowed is 5 MB.');
  }

  try {
    // 3. Upload to users/{uid}/profile/avatar
    const storageRef = ref(storage, `users/${uid}/profile/avatar`);
    const snapshot = await uploadBytes(storageRef, file);
    
    // 4. Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error: any) {
    console.error('Error uploading profile image:', error);
    throw new Error(error.message || 'Failed to upload profile image to cloud storage.');
  }
};

// Backwards compatibility layer
export const storageService = {
  uploadCertificatePdf: async (blob: Blob, path: string) => {
    console.log('[Storage Mock] Uploaded PDF to:', path);
    return `https://thenamskills.edu/assets/certificates/${path}`;
  },
  uploadProjectCover: async (file: File) => {
    console.log('[Storage Mock] Uploaded project cover');
    return 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800';
  },
  uploadProfileImage,
  uploadEducatorAvatar
};
