import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_.-]+\/?$/i;
const githubRegex = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_.-]+\/?$/i;
const phoneRegex = /^\+?[0-9\s-]{10,15}$/;

export const profileCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  department: z.string().min(2, 'Department is required'),
  year: z.string().min(1, 'Year of study is required'),
  collegeName: z.string().min(2, 'College name is required'),
  dateOfBirth: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
    return arg;
  }, z.date().refine((date) => {
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--;
    }
    return age >= 15;
  }, 'Student must be at least 15 years old')),
  phoneNumber: z.string().regex(phoneRegex, 'Invalid phone number format'),
  skills: z.array(z.string().min(1, 'Invalid Skill ID')).min(1, 'At least one skill is required'),
  collegeLocation: z.object({
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    country: z.string().min(2, 'Country is required')
  }),
  linkedinURL: z.string().regex(linkedinRegex, 'Invalid LinkedIn URL').nullable().optional().or(z.literal('')),
  githubURL: z.string().regex(githubRegex, 'Invalid GitHub URL').nullable().optional().or(z.literal('')),
  photoURL: z.string().optional().or(z.literal('')),
  coverImage: z.string().optional().or(z.literal(''))
});

export const profileUpdateSchema = profileCreateSchema.partial();
