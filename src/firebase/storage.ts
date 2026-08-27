import { doc, updateDoc } from 'firebase/firestore';
import { db } from './config';

export const uploadImage = async (path: string, file: File): Promise<string> => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid image format. Supported formats: JPG, JPEG, PNG, WebP');
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('Image file is too large. Maximum size allowed is 5 MB.');
  }

  try {
    const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
    if (!apiKey) throw new Error('ImgBB API key is missing in .env file');
    
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    if (data.success) {
      return data.data.url;
    } else {
      throw new Error(data.error?.message || 'ImgBB upload failed');
    }
  } catch (error: any) {
    console.error(`Error uploading image:`, error);
    throw new Error(error.message || 'Failed to upload image.');
  }
};

export const uploadEducatorAvatar = async (userId: string, file: File): Promise<string> => {
  const downloadUrl = await uploadImage(`users/${userId}/profile/avatar_${Date.now()}`, file);

  await updateDoc(doc(db, 'users', userId), {
    photoURL: downloadUrl,
    updatedAt: new Date().toISOString()
  });
  return downloadUrl;
};

export const uploadProfileImage = async (uid: string, file: File): Promise<string> => {
  return await uploadImage(`users/${uid}/profile/avatar`, file);
};

export const storageService = {
  uploadCertificatePdf: async (blob: Blob, path: string) => {
    console.log('[Storage Mock] Uploaded PDF to:', path);
    return `https://thenam-campus.vercel.app//assets/certificates/${path}`;
  },
  uploadProjectCover: async (projectId: string, file: File) => {
    return uploadImage(`projects/${projectId}/cover_${Date.now()}`, file);
  },
  uploadEventCover: async (eventId: string, file: File) => {
    return uploadImage(`events/${eventId}/cover_${Date.now()}`, file);
  },
  uploadPostImage: async (userId: string, file: File, index: number = 0) => {
    return uploadImage(`users/${userId}/posts/${Date.now()}_${index}`, file);
  },
  uploadProfileCover: async (userId: string, file: File) => {
    return uploadImage(`users/${userId}/profile/cover_${Date.now()}`, file);
  },
  uploadProfileImage,
  uploadEducatorAvatar
};
