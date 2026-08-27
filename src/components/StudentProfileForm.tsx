import React, { useState, useEffect } from 'react';
import { Camera, AlertCircle, Info, Calendar as CalendarIcon, User, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';
import { StudentProfile, CollegeLocation } from '../types';
import { SkillSelector } from './SkillSelector';

interface StudentProfileFormProps {
  initialData: Partial<StudentProfile>;
  onSubmit: (data: any, imageFile: File | null, coverImageFile: File | null) => Promise<void>;
  submitLabel: string;
  loading: boolean;
  role?: string;
}

const DEPARTMENTS = [
  'Artificial Intelligence & Data Science',
  'Computer Science Engineering',
  'Information Technology',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering'
];

const YEARS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year'
];

export const StudentProfileForm: React.FC<StudentProfileFormProps> = ({
  initialData,
  onSubmit,
  submitLabel,
  loading,
  role
}) => {
  const canUploadImage = role === 'faculty' || role === 'admin';
  
  // Form fields states
  const [name, setName] = useState(initialData.name || '');
  const [department, setDepartment] = useState(initialData.department || DEPARTMENTS[0]);
  const [year, setYear] = useState(initialData.yearOfStudy || YEARS[0]);
  const [collegeName, setCollegeName] = useState(initialData.college || 'DMI College of Engineering');
  const [dateOfBirth, setDateOfBirth] = useState(initialData.dateOfBirth || '');
  const [phoneNumber, setPhoneNumber] = useState(initialData.phone || '');
  const [skills, setSkills] = useState<string[]>(initialData.skills || []);
  const [city, setCity] = useState(initialData.collegeLocation?.city || 'Chennai');
  const [state, setState] = useState(initialData.collegeLocation?.state || 'Tamil Nadu');
  const [country, setCountry] = useState(initialData.collegeLocation?.country || 'India');
  const [linkedinURL, setLinkedinURL] = useState(initialData.linkedinUrl || '');
  const [githubURL, setGithubURL] = useState(initialData.githubUrl || '');
  
  // Image upload state
  const [imagePreview, setImagePreview] = useState<string>(initialData.avatar || '');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [coverImagePreview, setCoverImagePreview] = useState<string>(initialData.coverImage || '');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  // Validation errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData.avatar) setImagePreview(initialData.avatar);
    if (initialData.coverImage) setCoverImagePreview(initialData.coverImage);
    if (initialData.name) setName(initialData.name);
    if (initialData.department) setDepartment(initialData.department);
    if (initialData.yearOfStudy) setYear(initialData.yearOfStudy);
    if (initialData.college) setCollegeName(initialData.college);
    if (initialData.dateOfBirth) setDateOfBirth(initialData.dateOfBirth);
    if (initialData.phone) setPhoneNumber(initialData.phone);
    if (initialData.skills) setSkills(initialData.skills);
    if (initialData.collegeLocation) {
      setCity(initialData.collegeLocation.city);
      setState(initialData.collegeLocation.state);
      setCountry(initialData.collegeLocation.country);
    }
    if (initialData.linkedinUrl) setLinkedinURL(initialData.linkedinUrl);
    if (initialData.githubUrl) setGithubURL(initialData.githubUrl);
  }, [initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, avatar: 'Profile image must be less than 5 MB.' }));
      return;
    }

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, avatar: 'Supported formats: JPG, JPEG, PNG, WebP.' }));
      return;
    }

    setErrors(prev => {
      const copy = { ...prev };
      delete copy.avatar;
      return copy;
    });

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, coverImage: 'Cover image must be less than 5 MB.' }));
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, coverImage: 'Supported formats: JPG, JPEG, PNG, WebP.' }));
      return;
    }

    setErrors(prev => {
      const copy = { ...prev };
      delete copy.coverImage;
      return copy;
    });

    setCoverImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!collegeName.trim()) newErrors.collegeName = 'College name is required';
    
    // Validate DoB
    if (!dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const dobDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dobDate.getFullYear();
      const m = today.getMonth() - dobDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
        age--;
      }
      if (age < 15) {
        newErrors.dateOfBirth = 'Student must be at least 15 years old';
      } else if (dobDate > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future';
      }
    }

    // Validate Phone Number
    const phoneTrimmed = phoneNumber.trim();
    if (!phoneTrimmed) {
      newErrors.phoneNumber = 'Phone number is required';
    } else {
      // Validate Indian numbers +91 followed by 10 digits, or standard format
      const digitsOnly = phoneTrimmed.replace(/\D/g, '');
      if (phoneTrimmed.startsWith('+91')) {
        if (digitsOnly.length !== 12) {
          newErrors.phoneNumber = 'Indian phone number must be exactly 10 digits after +91';
        }
      } else {
        if (digitsOnly.length < 10 || digitsOnly.length > 15) {
          newErrors.phoneNumber = 'Please enter a valid phone number (including country code)';
        }
      }
    }

    // Location validation
    if (!city.trim()) newErrors.city = 'City is required';
    if (!state.trim()) newErrors.state = 'State is required';
    if (!country.trim()) newErrors.country = 'Country is required';

    // Skills validation
    if (skills.length === 0) {
      newErrors.skills = 'Please select at least 1 skill';
    }

    // Social URLs validation
    if (linkedinURL.trim()) {
      const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+\/?$/;
      if (!linkedinRegex.test(linkedinURL.trim()) && !linkedinURL.trim().includes('linkedin.com/in/')) {
        newErrors.linkedinURL = 'Invalid LinkedIn URL format (e.g., https://linkedin.com/in/username)';
      }
    }

    if (githubURL.trim()) {
      const githubRegex = /^(https?:\/\/)?(www\.)?github\.com\/[A-Za-z0-9_-]+\/?$/;
      if (!githubRegex.test(githubURL.trim()) && !githubURL.trim().includes('github.com/')) {
        newErrors.githubURL = 'Invalid GitHub URL format (e.g., https://github.com/username)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      // Scroll to top or first error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Format phone
    let formattedPhone = phoneNumber.trim();
    if (/^\d{10}$/.test(formattedPhone)) {
      formattedPhone = `+91${formattedPhone}`;
    }

    const payload = {
      name: name.trim(),
      department,
      year,
      collegeName: collegeName.trim(),
      dateOfBirth,
      phoneNumber: formattedPhone,
      skills,
      collegeLocation: {
        city: city.trim(),
        state: state.trim(),
        country: country.trim()
      },
      linkedinURL: linkedinURL.trim() || null,
      githubURL: githubURL.trim() || null,
      photoURL: imagePreview,
      coverImage: coverImagePreview
    };

    onSubmit(payload, imageFile, coverImageFile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Top Validation Alerts Block */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl flex gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wide">Please correct form errors:</h4>
            <ul className="list-disc pl-4 text-xs text-rose-700 mt-1 space-y-0.5">
              {Object.values(errors).map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* STEP 5 / Avatar Photo Uploader */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5">
        <div className="relative shrink-0 group">
          <img
            src={imagePreview || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'}
            alt="Avatar Preview"
            className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md bg-white"
          />
          {canUploadImage && (
            <label className="absolute -bottom-1.5 -right-1.5 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md cursor-pointer transition-transform group-hover:scale-105">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={!canUploadImage}
              />
            </label>
          )}
        </div>

        <div className="flex-1 space-y-1 text-center sm:text-left">
          <h4 className="text-sm font-bold text-slate-800">Profile Representation Photo</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            {canUploadImage ? 'Google photo is selected by default. You can upload a customized image (JPG, PNG, WebP) up to 5 MB.' : 'Your profile photo is synced from your Google account. Only verified faculty and admins can upload custom avatars.'}
          </p>
          {errors.avatar && (
            <span className="text-[11px] text-rose-600 font-bold block">{errors.avatar}</span>
          )}
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col items-start gap-4">
        <div className="w-full space-y-1 text-center sm:text-left mb-2">
          <h4 className="text-sm font-bold text-slate-800">Profile Cover Banner</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Upload a customized banner image (16:9 recommended).
          </p>
          {errors.coverImage && (
            <span className="text-[11px] text-rose-600 font-bold block">{errors.coverImage}</span>
          )}
        </div>
        
        <div className="relative w-full h-32 sm:h-40 rounded-xl overflow-hidden bg-slate-200 group border-2 border-dashed border-slate-300">
          {coverImagePreview ? (
            <img
              src={coverImagePreview}
              alt="Cover Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
              <Camera className="w-8 h-8 mb-2 opacity-50" />
              <span className="text-xs font-bold uppercase">Upload Cover</span>
            </div>
          )}
          <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <span className="bg-white/90 text-slate-900 px-4 py-2 rounded-lg text-xs font-bold">Change Cover</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Name Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative rounded-xl shadow-3xs">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              placeholder="e.g. Sam Rohan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 text-xs text-slate-850 rounded-xl border focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all ${
                errors.name ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
              }`}
            />
          </div>
        </div>

        {/* Date of Birth Picker */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            Date of Birth <span className="text-rose-500">*</span>
          </label>
          <div className="relative rounded-xl shadow-3xs">
            <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="date"
              required
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 text-xs text-slate-850 rounded-xl border focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all ${
                errors.dateOfBirth ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
              }`}
            />
          </div>
        </div>

        {/* Department Dropdown */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            Academic Department <span className="text-rose-500">*</span>
          </label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 text-xs text-slate-800 rounded-xl border border-slate-200 focus:bg-white focus:border-indigo-500 outline-hidden transition-all"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* Year Select dropdown */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            Year of Study <span className="text-rose-500">*</span>
          </label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 text-xs text-slate-800 rounded-xl border border-slate-200 focus:bg-white focus:border-indigo-500 outline-hidden transition-all"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* College Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            College Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative rounded-xl shadow-3xs">
            <Info className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              placeholder="e.g. DMI College of Engineering"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 text-xs text-slate-850 rounded-xl border focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all ${
                errors.collegeName ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
              }`}
            />
          </div>
        </div>

        {/* Phone Number Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            Phone Number <span className="text-rose-500">*</span>
          </label>
          <div className="relative rounded-xl shadow-3xs">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              required
              placeholder="+91 98765 43210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 text-xs text-slate-850 rounded-xl border focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all ${
                errors.phoneNumber ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* College Location */}
      <div className="space-y-2.5 bg-slate-50/50 border border-slate-200/80 p-5 rounded-2xl">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-indigo-600" />
          <span>College Location <span className="text-rose-500">*</span></span>
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">City</span>
            <input
              type="text"
              required
              placeholder="Chennai"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white text-xs text-slate-800 rounded-xl border border-slate-200 focus:border-indigo-500 outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">State</span>
            <input
              type="text"
              required
              placeholder="Tamil Nadu"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white text-xs text-slate-800 rounded-xl border border-slate-200 focus:border-indigo-500 outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Country</span>
            <input
              type="text"
              required
              placeholder="India"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white text-xs text-slate-800 rounded-xl border border-slate-200 focus:border-indigo-500 outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Skills catalog section */}
      <div className="bg-white border border-slate-200/95 p-5 rounded-2xl space-y-3 shadow-2xs">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            Select Technical Skills <span className="text-rose-500">*</span>
          </label>
          <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
            Add skills you already master. Skills associated with certifications you complete on Thenam Campus are automatically tagged as verified.
          </p>
        </div>
        
        <SkillSelector
          selectedSkills={skills}
          onChange={setSkills}
          maxSkills={15}
        />
        {errors.skills && (
          <span className="text-[11px] text-rose-600 font-bold block">{errors.skills}</span>
        )}
      </div>

      {/* Social portfolios optional links */}
      <div className="bg-slate-50/50 border border-slate-200/80 p-5 rounded-2xl space-y-4">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-indigo-600" />
          <span>Professional Web Portals (Optional)</span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
              <Linkedin className="w-3.5 h-3.5 text-indigo-600" />
              LinkedIn URL
            </span>
            <input
              type="text"
              placeholder="e.g. linkedin.com/in/username"
              value={linkedinURL}
              onChange={(e) => setLinkedinURL(e.target.value)}
              className={`w-full px-3.5 py-2.5 bg-white text-xs text-slate-800 rounded-xl border outline-hidden transition-all ${
                errors.linkedinURL ? 'border-rose-400' : 'border-slate-200 focus:border-indigo-500'
              }`}
            />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
              <Github className="w-3.5 h-3.5 text-slate-900" />
              GitHub URL
            </span>
            <input
              type="text"
              placeholder="e.g. github.com/username"
              value={githubURL}
              onChange={(e) => setGithubURL(e.target.value)}
              className={`w-full px-3.5 py-2.5 bg-white text-xs text-slate-800 rounded-xl border outline-hidden transition-all ${
                errors.githubURL ? 'border-rose-400' : 'border-slate-200 focus:border-indigo-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Submit Trigger Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-extrabold text-sm rounded-xl shadow-md transition-all active:scale-98 select-none"
      >
        {loading ? (
          <>
            <span className="animate-spin rounded-full h-4.5 w-4.5 border-2 border-t-transparent border-white" />
            <span>Processing and saving profile...</span>
          </>
        ) : (
          <span>{submitLabel}</span>
        )}
      </button>
    </form>
  );
};
