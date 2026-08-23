import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { admin } from '../config/firebaseAdmin';
import { sendResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

// POST /api/auth/sync
export const syncUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const firebaseUser = req.user; // Set by authMiddleware

  if (!firebaseUser || !firebaseUser.firebaseUid) {
    return sendResponse(res, 400, false, 'Invalid sync payload details.');
  }

  const db = admin.firestore();
  const userRef = db.collection('users').doc(firebaseUser.firebaseUid);
  const userDoc = await userRef.get();

  let finalUser: any;

  if (!userDoc.exists) {
    const intendedRole = req.body.role === 'faculty' ? 'faculty' : 'student';
    // 2. Provision new User document in Firestore
    finalUser = {
      firebaseUid: firebaseUser.firebaseUid,
      email: firebaseUser.email,
      name: firebaseUser.name,
      photoURL: firebaseUser.photoURL || '',
      role: intendedRole,
      profileCompleted: false,
      xp: 0,
      streak: 0,
      coursesCompleted: 0,
      certificatesCount: 0,
      projectsCount: 0,
      skills: [],
      collegeLocation: {
        city: '',
        state: '',
        country: ''
      },
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    };

    await userRef.set(finalUser);
    console.log(`New Firestore user account provisioned for Firebase ID: ${firebaseUser.firebaseUid}`);
  } else {
    finalUser = { id: userDoc.id, ...userDoc.data() };
    
    // Sync Google profile photo if Firestore photoURL is currently blank
    const updates: any = {};
    if (!finalUser.photoURL && firebaseUser.photoURL) {
      finalUser.photoURL = firebaseUser.photoURL;
      updates.photoURL = firebaseUser.photoURL;
    }
    
    const intendedRole = req.body.role;
    if (intendedRole && ['student', 'faculty'].includes(intendedRole) && finalUser.role !== intendedRole) {
      finalUser.role = intendedRole;
      updates.role = intendedRole;
    }

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = admin.firestore.Timestamp.now();
      await userRef.update(updates);
    }
  }

  return sendResponse(res, 200, true, 'User session synced successfully.', finalUser);
});

// GET /api/auth/me
export const getCurrentUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user; // Hydrated by authMiddleware
  
  if (!user || !user.firebaseUid) {
    return sendResponse(res, 404, false, 'User profile record not found.');
  }

  return sendResponse(res, 200, true, 'User profile retrieved successfully.', user);
});

// POST /api/auth/logout
export const logoutUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  return sendResponse(res, 200, true, 'Session logged out successfully.');
});
