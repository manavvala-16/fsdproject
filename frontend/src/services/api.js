import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

// Interceptor to attach Authorization JWT token automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('cinevault_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Health Check
export const checkHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: 'Unable to reach backend service',
      database: { status: 'Disconnected' },
      error: error.message,
    };
  }
};

// Auth Services
export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Registration failed. Please try again.',
    };
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Login failed. Please check your credentials.',
    };
  }
};

export const fetchUserProfile = async () => {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch user session.',
    };
  }
};

// Movie Services
export const fetchMovies = async (params = {}) => {
  try {
    const response = await apiClient.get('/movies', { params });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch movies catalog.',
      data: [],
      pagination: { currentPage: 1, totalPages: 1, totalItems: 0 }
    };
  }
};

export const fetchMovieById = async (id) => {
  try {
    const response = await apiClient.get(`/movies/${id}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch movie details.',
      data: null
    };
  }
};

export const fetchGenres = async () => {
  try {
    const response = await apiClient.get('/genres');
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch genres.',
      data: []
    };
  }
};

export const fetchLanguages = async () => {
  try {
    const response = await apiClient.get('/languages');
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch languages.',
      data: []
    };
  }
};

// Watchlist Services
export const fetchWatchlist = async () => {
  try {
    const response = await apiClient.get('/watchlist');
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch your watchlist.',
      data: []
    };
  }
};

export const addToWatchlist = async (movieId) => {
  try {
    const response = await apiClient.post('/watchlist', { movieId });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Could not add movie to watchlist.',
    };
  }
};

export const removeFromWatchlist = async (movieId) => {
  try {
    const response = await apiClient.delete(`/watchlist/${movieId}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Could not remove movie from watchlist.',
    };
  }
};

// Viewing History Services
export const fetchWatchHistory = async () => {
  try {
    const response = await apiClient.get('/watch-history');
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch viewing history.',
      data: []
    };
  }
};

export const addToWatchHistory = async (movieId) => {
  try {
    const response = await apiClient.post('/watch-history', { movieId });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Could not mark movie as watched.',
    };
  }
};

export const removeFromWatchHistory = async (movieId) => {
  try {
    const response = await apiClient.delete(`/watch-history/${movieId}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Could not remove movie from viewing history.',
    };
  }
};

// Ratings Services
export const fetchMovieRatings = async (movieId) => {
  try {
    const response = await apiClient.get(`/movies/${movieId}/ratings`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch movie ratings.',
      data: { averageRating: 0, totalRatings: 0, userRating: null, ratings: [] }
    };
  }
};

export const submitRating = async (movieId, rating) => {
  try {
    const response = await apiClient.post(`/movies/${movieId}/rating`, { rating });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Could not submit your rating.',
    };
  }
};

export const deleteRating = async (movieId) => {
  try {
    const response = await apiClient.delete(`/movies/${movieId}/rating`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Could not remove your rating.',
    };
  }
};

// Reviews Services
export const fetchMovieReviews = async (movieId) => {
  try {
    const response = await apiClient.get(`/movies/${movieId}/reviews`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch reviews.',
      data: []
    };
  }
};

export const createReview = async (movieId, reviewData) => {
  try {
    const response = await apiClient.post(`/movies/${movieId}/reviews`, reviewData);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Could not submit your review.',
    };
  }
};

export const updateReview = async (reviewId, reviewText) => {
  try {
    const response = await apiClient.put(`/reviews/${reviewId}`, { reviewText });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Could not update your review.',
    };
  }
};

export const deleteReview = async (reviewId) => {
  try {
    const response = await apiClient.delete(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Could not delete this review.',
    };
  }
};

// Collections Services
export const fetchCollections = async () => {
  try {
    const response = await apiClient.get('/collections');
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch your collections.',
      data: []
    };
  }
};

export const fetchCollectionById = async (collectionId) => {
  try {
    const response = await apiClient.get(`/collections/${collectionId}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch collection details.',
      data: null
    };
  }
};

export const createCollection = async (collectionData) => {
  try {
    const response = await apiClient.post('/collections', collectionData);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Could not create this collection.',
    };
  }
};

export const updateCollection = async (collectionId, collectionData) => {
  try {
    const response = await apiClient.put(`/collections/${collectionId}`, collectionData);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Could not update this collection.',
    };
  }
};

export const deleteCollection = async (collectionId) => {
  try {
    const response = await apiClient.delete(`/collections/${collectionId}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Could not delete this collection.',
    };
  }
};

export const addMovieToCollection = async (collectionId, movieId) => {
  try {
    const response = await apiClient.post(`/collections/${collectionId}/movies`, { movieId });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Could not add this movie to the collection.',
    };
  }
};

export const removeMovieFromCollection = async (collectionId, movieId) => {
  try {
    const response = await apiClient.delete(`/collections/${collectionId}/movies/${movieId}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Could not remove this movie from the collection.',
    };
  }
};

// Social & Community Services
export const followUser = async (userId) => {
  try {
    const response = await apiClient.post(`/users/${userId}/follow`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Unable to follow user.',
    };
  }
};

export const unfollowUser = async (userId) => {
  try {
    const response = await apiClient.delete(`/users/${userId}/follow`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Unable to unfollow user.',
    };
  }
};

export const fetchFollowStatus = async (userId) => {
  try {
    const response = await apiClient.get(`/users/${userId}/follow-status`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Unable to fetch follow status.',
      data: { isFollowing: false, followersCount: 0, followingCount: 0 }
    };
  }
};

export const fetchFollowers = async (userId) => {
  try {
    const response = await apiClient.get(`/users/${userId}/followers`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Unable to fetch followers.',
      data: []
    };
  }
};

export const fetchFollowing = async (userId) => {
  try {
    const response = await apiClient.get(`/users/${userId}/following`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Unable to fetch following.',
      data: []
    };
  }
};

export const fetchPublicUserProfile = async (userId) => {
  try {
    const response = await apiClient.get(`/users/${userId}/profile`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Unable to fetch user profile.',
      data: null
    };
  }
};

export const fetchCommunityExplore = async () => {
  try {
    const response = await apiClient.get('/community/explore');
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Unable to explore community.',
      data: { members: [], collections: [] }
    };
  }
};

// Movie DNA & Recommendations Services
export const fetchMovieDNA = async () => {
  try {
    const response = await apiClient.get('/recommendations/dna');
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Unable to calculate Movie DNA.',
      data: null
    };
  }
};

export const fetchRecommendations = async (params = {}) => {
  try {
    const response = await apiClient.get('/recommendations', { params });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Unable to fetch personalized recommendations.',
      data: [],
      isPersonalized: false
    };
  }
};

// Admin Services
export const fetchAdminStats = async () => {
  try {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to load platform statistics.'
    };
  }
};

export const fetchAdminMovies = async (params = {}) => {
  try {
    const response = await apiClient.get('/admin/movies', { params });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to load movies.',
      data: [],
      pagination: { currentPage: 1, totalPages: 1, totalItems: 0 }
    };
  }
};

export const createAdminMovie = async (movieData) => {
  try {
    const response = await apiClient.post('/admin/movies', movieData);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to add movie.'
    };
  }
};

export const updateAdminMovie = async (movieId, movieData) => {
  try {
    const response = await apiClient.put(`/admin/movies/${movieId}`, movieData);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update movie.'
    };
  }
};

export const deleteAdminMovie = async (movieId) => {
  try {
    const response = await apiClient.delete(`/admin/movies/${movieId}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete movie.'
    };
  }
};

export const fetchAdminUsers = async (params = {}) => {
  try {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to load users.',
      data: [],
      pagination: { currentPage: 1, totalPages: 1, totalItems: 0 }
    };
  }
};

export const updateAdminUserRole = async (userId, role) => {
  try {
    const response = await apiClient.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update user role.'
    };
  }
};

export const fetchAdminReviews = async (params = {}) => {
  try {
    const response = await apiClient.get('/admin/reviews', { params });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to load reviews.',
      data: [],
      pagination: { currentPage: 1, totalPages: 1, totalItems: 0 }
    };
  }
};

export const deleteAdminReview = async (reviewId) => {
  try {
    const response = await apiClient.delete(`/admin/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete review.'
    };
  }
};

export default apiClient;


