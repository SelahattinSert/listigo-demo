
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Spinner from './components/ui/Spinner';
import { useAuth } from './hooks/useAuth';
import { ROLES } from './constants';

// Lazy load pages, pointing to .tsx files directly
const HomePage = React.lazy(() => import('./pages/HomePage.tsx'));
const LoginPage = React.lazy(() => import('./pages/LoginPage.tsx'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage.tsx'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage.tsx'));
const CreateListingPage = React.lazy(() => import('./pages/CreateListingPage.tsx'));
const EditListingPage = React.lazy(() => import('./pages/EditListingPage.tsx'));
const ListingDetailsPage = React.lazy(() => import('./pages/ListingDetailsPage.tsx'));
const MessagesPage = React.lazy(() => import('./pages/MessagesPage.tsx'));
const AdminCategoriesPage = React.lazy(() => import('./pages/AdminCategoriesPage.tsx'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage.tsx'));

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, roles } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && roles) {
    const userHasRequiredRole = allowedRoles.some(role => roles.includes(role));
    if (!userHasRequiredRole) {
      return <Navigate to="/" replace />; // Or a specific "Access Denied" page
    }
  }
  
  return <>{children}</>;
};


const App: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-darkBg transition-colors duration-300">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><Spinner /></div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/listings/:id" element={<ListingDetailsPage />} />
            
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/create-listing" element={<ProtectedRoute><CreateListingPage /></ProtectedRoute>} />
            <Route path="/edit-listing/:id" element={<ProtectedRoute><EditListingPage /></ProtectedRoute>} />
            <Route path="/messages/:listingId" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><MessagesPage entryPoint='conversationsList'/></ProtectedRoute>} />


            <Route 
              path="/admin/categories" 
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <AdminCategoriesPage />
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default App;