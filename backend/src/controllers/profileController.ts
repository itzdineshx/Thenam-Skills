import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { admin } from '../config/firebaseAdmin';
import { sendResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

// Local Helpers for populating references in Firestore
async function populateTechnologies(projects: any[]) {
  const skillIds = Array.from(new Set(
    projects.flatMap((p: any) => p.technologies || [])
  )).filter(Boolean);

  if (skillIds.length === 0) return projects;

  const db = admin.firestore();
  const skillRefs = skillIds.map(id => db.collection('skills').doc(id));
  const skillDocs = await db.getAll(...skillRefs);
  const skillMap: Record<string, any> = {};
  skillDocs.forEach(doc => {
    if (doc.exists) {
      skillMap[doc.id] = { id: doc.id, ...doc.data() };
    }
  });

  return projects.map((p: any) => ({
    ...p,
    technologies: (p.technologies || []).map((id: string) => skillMap[id] || { id, name: id })
  }));
}

async function populateCourse(certificates: any[]) {
  const courseIds = Array.from(new Set(
    certificates.map((c: any) => c.course).filter(Boolean)
  ));
  if (courseIds.length === 0) return certificates;

  const db = admin.firestore();
  const courseRefs = courseIds.map(id => db.collection('courses').doc(id));
  const courseDocs = await db.getAll(...courseRefs);
  const courseMap: Record<string, any> = {};
  courseDocs.forEach(doc => {
    if (doc.exists) {
      courseMap[doc.id] = { id: doc.id, ...doc.data() };
    }
  });

  return certificates.map((c: any) => ({
    ...c,
    course: courseMap[c.course] || { id: c.course, title: c.course }
  }));
}

// POST /api/profile
export const createProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const firebaseUser = req.user;

  if (!firebaseUser || !firebaseUser.firebaseUid) {
    return sendResponse(res, 400, false, 'User must be authenticated.');
  }

  const db = admin.firestore();
  const userRef = db.collection('users').doc(firebaseUser.firebaseUid);
  const userDoc = await userRef.get();
  if (!userDoc.exists) {
    return sendResponse(res, 404, false, 'User record not found in system.');
  }

  const {
    name,
    department,
    year,
    collegeName,
    dateOfBirth,
    phoneNumber,
    skills,
    collegeLocation,
    linkedinURL,
    githubURL,
    photoURL
  } = req.body;

  // Verify all selected skills exist and are active in Firestore
  // Temporary bypass for new database instances where the skills collection is empty.
  /*
  if (skills && skills.length > 0) {
    const skillRefs = skills.map((slug: string) => db.collection('skills').doc(slug));
    const skillDocs = await db.getAll(...skillRefs);
    const activeSkillsCount = skillDocs.filter(doc => doc.exists && doc.data()?.isActive).length;
    if (activeSkillsCount !== skills.length) {
      return sendResponse(res, 400, false, 'One or more selected skills are invalid or inactive.');
    }
  }
  */

  // Save profile information
  const updatedData: any = {
    name,
    department,
    year,
    collegeName,
    dateOfBirth: dateOfBirth || null,
    phoneNumber,
    skills: skills || [],
    collegeLocation: collegeLocation || { city: '', state: '', country: '' },
    linkedinURL: linkedinURL || null,
    githubURL: githubURL || null,
    profileCompleted: true,
    updatedAt: admin.firestore.Timestamp.now()
  };

  if (photoURL) {
    updatedData.photoURL = photoURL;
  }

  await userRef.update(updatedData);
  const finalDoc = await userRef.get();
  
  return sendResponse(res, 201, true, 'Student onboarding completed successfully.', {
    id: finalDoc.id,
    ...finalDoc.data()
  });
});

// PUT /api/profile/me
export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;

  if (!user || !user.firebaseUid) {
    return sendResponse(res, 404, false, 'Authenticated student profile not found.');
  }

  const {
    name,
    department,
    year,
    collegeName,
    dateOfBirth,
    phoneNumber,
    skills,
    collegeLocation,
    linkedinURL,
    githubURL,
    photoURL
  } = req.body;

  const db = admin.firestore();
  const userRef = db.collection('users').doc(user.firebaseUid);

  // Validate skills if updating them
  // Temporary bypass for new database instances where the skills collection is empty.
  /*
  if (skills && skills.length > 0) {
    const skillRefs = skills.map((slug: string) => db.collection('skills').doc(slug));
    const skillDocs = await db.getAll(...skillRefs);
    const activeSkillsCount = skillDocs.filter(doc => doc.exists && doc.data()?.isActive).length;
    if (activeSkillsCount !== skills.length) {
      return sendResponse(res, 400, false, 'One or more selected skills are invalid or inactive.');
    }
  }
  */

  const updates: any = {
    updatedAt: admin.firestore.Timestamp.now()
  };

  if (skills) updates.skills = skills;
  if (name) updates.name = name;
  if (department) updates.department = department;
  if (year) updates.year = year;
  if (collegeName) updates.collegeName = collegeName;
  if (dateOfBirth) updates.dateOfBirth = dateOfBirth;
  if (phoneNumber) updates.phoneNumber = phoneNumber;
  if (collegeLocation) updates.collegeLocation = collegeLocation;
  if (linkedinURL !== undefined) updates.linkedinURL = linkedinURL || null;
  if (githubURL !== undefined) updates.githubURL = githubURL || null;
  if (photoURL) updates.photoURL = photoURL;

  await userRef.update(updates);
  const finalDoc = await userRef.get();

  return sendResponse(res, 200, true, 'Student profile modified successfully.', {
    id: finalDoc.id,
    ...finalDoc.data()
  });
});

// GET /api/profile/:firebaseUid
export const getPublicProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { firebaseUid } = req.params;
  const db = admin.firestore();

  const studentDoc = await db.collection('users').doc(firebaseUid).get();
  if (!studentDoc.exists) {
    return sendResponse(res, 404, false, 'Student profile not found.');
  }

  const student = studentDoc.data() || {};

  // Fetch projects, certificates, achievements in parallel
  const [projectsSnapshot, certificatesSnapshot, achievementsSnapshot] = await Promise.all([
    db.collection('projects').where('user', '==', firebaseUid).get(),
    db.collection('certificates').where('user', '==', firebaseUid).get(),
    db.collection('achievements').where('user', '==', firebaseUid).get()
  ]);

  const rawProjects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const rawCertificates = certificatesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const achievements = achievementsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Populate references
  const projects = await populateTechnologies(rawProjects);
  const certificates = await populateCourse(rawCertificates);

  // Format response (excluding phone number and DOB for public discovery)
  const publicProfile = {
    id: firebaseUid,
    name: student.name,
    photoURL: student.photoURL || '',
    avatar: student.photoURL || '',
    department: student.department || '',
    year: student.year || '',
    yearOfStudy: student.year || '',
    collegeName: student.collegeName || '',
    college: student.collegeName || '',
    collegeLocation: student.collegeLocation,
    location: student.collegeLocation ? `${student.collegeLocation.city}, ${student.collegeLocation.state}` : '',
    skills: student.skills || [],
    linkedinURL: student.linkedinURL || null,
    linkedinUrl: student.linkedinURL || null,
    githubURL: student.githubURL || null,
    githubUrl: student.githubURL || null,
    projects,
    certificates,
    achievements,
    xp: student.xp || 0,
    coursesCompleted: student.coursesCompleted || 0,
    profileCompleted: student.profileCompleted || false,
    metrics: {
      coursesCompleted: student.coursesCompleted || 0,
      certificatesCount: student.certificatesCount || 0,
      projectsCount: student.projectsCount || 0,
      xpPoints: student.xp || 0,
      streakDays: student.streak || 0
    }
  };

  return sendResponse(res, 200, true, 'Student portfolio retrieved successfully.', publicProfile);
});

// GET /api/profiles/network/recommendations
export const getNetworkRecommendations = asyncHandler(async (req: any, res: Response) => {
  const db = admin.firestore();
  const uid = req.user?.firebaseUid || req.user?.id;

  if (!uid) {
    return sendResponse(res, 401, false, 'Unauthorized');
  }

  // Fetch all users (in a real app, use a query with limits and pagination)
  const usersSnapshot = await db.collection('users').get();
  
  let users: any[] = [];
  usersSnapshot.forEach(doc => {
    if (doc.id !== uid) {
      const data = doc.data();
      users.push({
        id: doc.id,
        name: data.name || 'Student',
        avatar: data.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
        headline: data.department ? `${data.department} Student` : 'Engineering Student',
        status: 'connect' // default status
      });
    }
  });

  // Basic shuffling
  users = users.sort(() => 0.5 - Math.random()).slice(0, 5);

  return sendResponse(res, 200, true, 'Network recommendations retrieved successfully.', users);
});

// POST /api/profiles/network/connect
export const connectUser = asyncHandler(async (req: any, res: Response) => {
  const db = admin.firestore();
  const uid = req.user?.firebaseUid || req.user?.id;
  const { targetUserId } = req.body;

  if (!uid) {
    return sendResponse(res, 401, false, 'Unauthorized');
  }
  if (!targetUserId) {
    return sendResponse(res, 400, false, 'Target user ID is required');
  }

  // For this mock implementation, we just return success
  // In a real app, this would create a connection request document in a "connections" collection

  return sendResponse(res, 200, true, 'Connection request sent successfully.');
});
