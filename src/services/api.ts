import { auth } from '../firebase/config';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${path}`;
  const headers = new Headers(options.headers || {});

  // 1. Automatically fetch and inject Firebase ID JWT token if authenticated
  const currentUser = auth.currentUser;
  const mockUser = localStorage.getItem('mockEducator');
  
  if (mockUser) {
    headers.set('Authorization', 'Bearer MOCK_EDUCATOR_TOKEN');
  } else if (currentUser) {
    try {
      const token = await currentUser.getIdToken();
      headers.set('Authorization', `Bearer ${token}`);
    } catch (e) {
      console.warn('Failed to retrieve Firebase ID Token for request auth headers:', e);
    }
  }

  // 2. Set default content type if not uploading files (FormData)
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // 3. Dispatch native Fetch call
  const response = await fetch(url, {
    ...options,
    headers
  });

  const json = await response.json();
  
  if (!response.ok) {
    throw new Error(json.message || `API request failed with status: ${response.status}`);
  }

  return json;
}

export const api = {
  get: (path: string, options?: RequestInit) => request(path, { ...options, method: 'GET' }),
  post: (path: string, body?: any, options?: RequestInit) => request(path, { 
    ...options, 
    method: 'POST', 
    body: body instanceof FormData ? body : JSON.stringify(body) 
  }),
  put: (path: string, body?: any, options?: RequestInit) => request(path, { 
    ...options, 
    method: 'PUT', 
    body: body instanceof FormData ? body : JSON.stringify(body) 
  }),
  patch: (path: string, body?: any, options?: RequestInit) => request(path, { 
    ...options, 
    method: 'PATCH', 
    body: body instanceof FormData ? body : JSON.stringify(body) 
  }),
  delete: (path: string, options?: RequestInit) => request(path, { ...options, method: 'DELETE' }),
};

export default api;
