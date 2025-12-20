// API Configuration
const PROD_API = 'https://zagazighousing-production-fff4.up.railway.app';
export const API_URL = import.meta.env.VITE_API_URL || `${PROD_API}/api`;
export const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || PROD_API;
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || PROD_API;

// Helper function to get full image URL
export const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return `${API_BASE}${imagePath}`;
    return imagePath;
};
