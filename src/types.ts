export type ActivityType = 
  | 'skill_unlocked'
  | 'certificate_earned'
  | 'workshop_attended'
  | 'webinar_attended'
  | 'project_milestone'
  | 'achievement'
  | 'student_post';

export type UserRole = 'student' | 'faculty' | 'admin' | 'recruiter';

export interface CollegeLocation {
  city: string;
  state: string;
  country: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  headline: string;
  college: string;
  department: string;
  yearOfStudy: string;
  location: string;
  avatar: string;
  coverImage: string;
  bio: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  collegeLocation?: CollegeLocation;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  skills: string[];
  interests: string[];
  metrics: {
    coursesCompleted: number;
    certificatesCount: number;
    projectsCount: number;
    networkCount: number;
    xpPoints: number;
    streakDays: number;
    globalRank: number;
  };
  journey: JourneyMilestone[];
  isAvailableForHire?: boolean;
  preferredRoles?: string[];
  profileCompleted?: boolean;
  isOnboardingCompleted?: boolean;
  role?: UserRole;
  followingEducators?: string[];
}

export interface JourneyMilestone {
  id: string;
  date: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  description?: string;
  verified?: boolean;
  badgeIcon?: string;
  certificateId?: string;
  projectId?: string;
  courseId?: string;
}

export interface CourseModule {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'reading' | 'quiz' | 'lab';
  isCompleted: boolean;
  videoUrl?: string;
  summary: string;
  contentMarkdown?: string;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Course {
  id: string;
  title: string;
  domain: string;
  category: 'AI & Data Science' | 'Web Development' | 'Cloud & DevOps' | 'Cybersecurity' | 'Mobile Dev' | 'UI/UX Design';
  description: string;
  instructor: {
    name: string;
    role: string;
    organization: string;
    avatar: string;
  };
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  rating: number;
  reviewsCount: number;
  enrolledCount: number;
  thumbnail: string;
  skillsGained: string[];
  progress: number; // 0 to 100
  isEnrolled: boolean;
  isBookmarked: boolean;
  completedModules: number;
  totalModules: number;
  modules: CourseModule[];
  assessmentQuestions: AssessmentQuestion[];
  certificateTemplateId: string;
  prerequisites: string[];
}

export interface Certificate {
  id: string;
  title: string;
  recipientName: string;
  recipientUid: string;
  courseId: string;
  courseName: string;
  issueDate: string;
  credentialId: string;
  verificationHash: string;
  verifiedBy: string;
  grade: string;
  skills: string[];
  qrCodeUrl: string;
  issuerLogo: string;
  certificateType: 'Course Mastery' | 'Workshop Attendance' | 'Hackathon Honor' | 'Specialization';
  isVerified: boolean;
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  domain: string;
  author: {
    uid: string;
    name: string;
    headline: string;
    avatar: string;
    college: string;
  };
  contributors?: string[];
  techStack: string[];
  demoUrl?: string;
  githubUrl?: string;
  coverImage: string;
  likesCount: number;
  isLiked?: boolean;
  viewsCount: number;
  createdAt: string;
  featured?: boolean;
}

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3';

export interface Module {
  id: string;
  title: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  embedUrl: string;
  thumbnailUrl: string;
  duration?: string;
  unlockCondition: 'immediate' | 'sequential';
}

export interface EventItem {
  id: string;
  creatorId?: string;
  title: string;
  type: 'workshop' | 'webinar' | 'hackathon' | 'masterclass';
  mode?: 'online_modular' | 'live_scheduled' | 'offline';
  domain: string;
  date: string;
  time: string;
  duration: string;
  speaker: {
    name: string;
    role: string;
    company: string;
    avatar: string;
  };
  coverImage: string;
  coverAspectRatio?: AspectRatio;
  description: string;
  registeredCount: number;
  registeredUserIds?: string[];
  maxCapacity: number;
  isRegistered: boolean;
  recordingAvailable?: boolean;
  certificateOffered: boolean;
  certificateEnabled?: boolean;
  meetLink?: string;
  meetingLink?: string;
  scheduledAt?: string;
  agenda: { time: string; topic: string }[];
  modules?: Module[];
}

export interface ActivityComment {
  id: string;
  author: {
    name: string;
    avatar: string;
    headline: string;
  };
  text: string;
  timestamp: string;
  likes: number;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  author: {
    id: string;
    name: string;
    headline: string;
    avatar: string;
    college: string;
  };
  timestamp: string;
  title: string;
  description: string;
  badgeText: string;
  badgeTheme: 'emerald' | 'amber' | 'indigo' | 'purple' | 'rose' | 'cyan' | 'blue';
  metadata?: {
    courseId?: string;
    courseTitle?: string;
    certificateId?: string;
    projectId?: string;
    projectTitle?: string;
    eventId?: string;
    eventTitle?: string;
    skillName?: string;
    grade?: string;
    verificationHash?: string;
    imageUrl?: string;
    imageUrls?: string[];
    externalUrl?: string;
    metrics?: string;
  };
  likesCount: number;
  isLiked: boolean;
  commentsCount: number;
  comments: ActivityComment[];
  sharesCount: number;
  isSaved?: boolean;
  isArchived?: boolean;
  createdAt?: string | any;
}

export interface NetworkConnection {
  id: string;
  name: string;
  headline: string;
  college: string;
  location: string;
  avatar: string;
  coverImage?: string;
  mutualConnections: number;
  skills: string[];
  status: 'none' | 'pending' | 'connected' | 'received';
  role: 'student' | 'mentor' | 'recruiter' | 'alumni';
  isExpert?: boolean;
  bio?: string;
  verifiedBadges?: string[];
}

export interface NotificationItem {
  id: string;
  type: 'achievement' | 'certificate' | 'connection' | 'event' | 'message' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  link: string;
  actionText?: string;
  actionUrl?: string;
  badgeIcon?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar: string;
    headline: string;
    college?: string;
    isOnline: boolean;
    lastSeen: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface CommunityGroup {
  id: string;
  name: string;
  category: string;
  description: string;
  memberCount: number;
  icon: string;
  isJoined: boolean;
  trendingTopics: string[];
  coverColor: string;
}

export interface AppSettings {
  autoAddCompletedCourses: boolean;
  autoCreateAchievementActivity: boolean;
  showAchievementsInFeed: boolean;
  autoAddWorkshopAttendance: boolean;
  autoAddWebinarActivity: boolean;
  askBeforePublishing: boolean;
  emailNotifications: boolean;
  networkVisibility: 'public' | 'connections_only' | 'private';
  talentSearchDiscoverable: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface AdminReport {
  id: string;
  type: 'post' | 'comment' | 'student' | 'certificate';
  targetId: string;
  targetTitle: string;
  reportedBy: string;
  reason: string;
  date: string;
  status: 'pending' | 'resolved' | 'dismissed';
}
