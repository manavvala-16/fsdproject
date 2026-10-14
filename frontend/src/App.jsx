import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import DiscoverPage from './pages/DiscoverPage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import WatchlistPage from './pages/WatchlistPage';
import WatchHistoryPage from './pages/WatchHistoryPage';
import MyCollectionsPage from './pages/MyCollectionsPage';
import CollectionDetailsPage from './pages/CollectionDetailsPage';
import CommunityPage from './pages/CommunityPage';
import UserProfilePage from './pages/UserProfilePage';
import MovieDNAPage from './pages/MovieDNAPage';
import RecommendationsPage from './pages/RecommendationsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function AppContent() {
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const hash = currentHash || '#/';
  const path = hash.split('?')[0];

  const movieMatch = path.match(/^#\/movies\/(\d+)$/);
  if (movieMatch) {
    return <MovieDetailsPage movieId={movieMatch[1]} />;
  }

  const collectionMatch = path.match(/^#\/collections\/(\d+)$/);
  if (collectionMatch) {
    return <CollectionDetailsPage collectionId={collectionMatch[1]} />;
  }

  const userMatch = path.match(/^#\/users\/(\d+)$/);
  if (userMatch) {
    return <UserProfilePage userId={userMatch[1]} />;
  }

  switch (path) {
    case '#/login':
      return <LoginPage />;
    case '#/register':
      return <RegisterPage />;
    case '#/profile':
      return <ProfilePage />;
    case '#/discover':
      return <DiscoverPage />;
    case '#/watchlist':
      return <WatchlistPage />;
    case '#/history':
      return <WatchHistoryPage />;
    case '#/collections':
      return <MyCollectionsPage />;
    case '#/community':
      return <CommunityPage />;
    case '#/dna':
      return <MovieDNAPage />;
    case '#/recommendations':
      return <RecommendationsPage />;
    case '#/admin':
      return <AdminDashboardPage />;
    case '#/':
    default:
      return <LandingPage />;
  }
}


function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
