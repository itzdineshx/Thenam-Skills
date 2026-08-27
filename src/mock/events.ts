import { EventItem } from '../types';

export const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'event_web_01',
    title: 'Drone Workshop - Building and Flying Autonomous Drones',
    type: 'workshop',
    domain: 'Robotics & AI',
    date: 'In soon at Thenamskills',
    time: 'Stay tuned',
    duration: '2 Hours',
    speaker: {
      name: 'Drone Expert',
      role: 'Robotics Engineer',
      company: 'THENAM Aviation',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'
    },
    coverImage: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80',
    description: 'Join us every Saturday for a comprehensive webinar on drone technology. Learn the basics of drone aerodynamics, autonomous flight control using AI, and how to build your own drone from scratch.',
    registeredCount: 499,
    maxCapacity: 500,
    isRegistered: false,
    recordingAvailable: true,
    certificateOffered: true,
    agenda: [
      { time: '10:00 AM - 10:45 AM', topic: 'Introduction to Drone Aerodynamics' },
      { time: '10:45 AM - 11:30 AM', topic: 'Autonomous Flight with AI' },
      { time: '11:30 AM - 12:00 PM', topic: 'Live Q&A' }
    ]
  },
  {
    id: 'event_hack_02',
    title: 'Guidelines for Smart India Hackathon (SIH) 2026',
    type: 'hackathon',
    domain: 'Innovation & Development',
    date: 'In soon at thenam skills ',
    time: 'Stay tuned  ',
    duration: ' 2 hours',
    speaker: {
      name: 'Gov of India',
      role: 'Organizer',
      company: 'MoE Innovation Cell',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80'
    },
    coverImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
    description: 'Smart India Hackathon is a nationwide initiative to provide students a platform to solve some of the pressing problems we face in our daily lives, and thus inculcate a culture of product innovation and a mindset of problem-solving.',
    registeredCount: 1200,
    maxCapacity: 2000,
    isRegistered: true,
    recordingAvailable: false,
    certificateOffered: true,
    agenda: [
      { time: 'Day 1 (08:00 AM)', topic: 'Inauguration & Problem Statement Deep Dive' },
      { time: 'Day 2 (All Day)', topic: 'Continuous Coding & Mentorship' },
      { time: 'Day 3 (04:00 PM)', topic: 'Final Pitching & Valedictory' }
    ]
  },
  {
    id: 'event_web_03',
    title: 'Hands-on AI Chatbot Development Workshop',
    type: 'webinar',
    domain: 'AI & Machine Learning',
    date: 'Saturday, 22 August 2026',
    time: '7:00 PM - 8:00 PM IST',
    duration: '1 Hour',
    speaker: {
      name: 'Jayamurugan V',
      role: 'Founder',
      company: 'Thenam Software Solutions',
      avatar: 'https://cdn.phototourl.com/free/2026-08-26-5659434f-46e0-4faa-8391-72dfeefaa208.jpg'
    },
    coverImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    description: 'Learn to build intelligent AI Chatbots using modern tools, LLMs, and real-world applications. We will cover Introduction to AI Chatbots, LLMs, API Integration & Tools, and Real-world Use Cases.',
    registeredCount: 842, // Live count representation
    maxCapacity: 1000,
    isRegistered: false,
    recordingAvailable: true,
    certificateOffered: true,
    agenda: [
      { time: '7:00 PM - 7:15 PM', topic: 'Introduction to AI Chatbots & LLMs' },
      { time: '7:15 PM - 7:40 PM', topic: 'Build Your Own Chatbot & API Integration' },
      { time: '7:40 PM - 8:00 PM', topic: 'Real-world Use Cases & Q&A' }
    ]
  }
];
