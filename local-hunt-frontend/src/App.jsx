// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { Container, Spinner } from 'react-bootstrap';
// import { AuthProvider, useAuth } from './contexts/AuthContext';
// import { ToastProvider } from './contexts/ToastContext';

// // Import Components
// import SiteNavbar from './components/common/Navbar';
// import Footer from './components/common/Footer';

// // Import Pages
// import HomePage from './pages/HomePage';
// import AuthPage from './pages/AuthPage';
// import Dashboard from './pages/Dashboard';
// import UserProfilePage from './pages/UserProfilePage';
// import VendorRegistrationPage from './pages/VendorRegistrationPage';
// import VendorDiscoveryPage from './pages/VendorDiscoveryPage';
// import VendorDetailPage from './pages/VendorDetailPage';
// import MessagesPage from './pages/MessagesPage';
// import AdminDashboardPage from './pages/AdminDashboardPage';
// import VendorDashboardPage from './pages/VendorDashboardPage';
// import NotificationsPage from './pages/NotificationsPage';

// import './App.css';

// // Wrapper for routes that require authentication
// const ProtectedRoute = ({ children }) => {
//   const { currentUser, loadingAuth } = useAuth();
//   if (loadingAuth) {
//     return (
//       <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
//         <Spinner animation="border" variant="primary" />
//       </Container>
//     );
//   }
//   return currentUser ? children : <Navigate to="/auth" replace />;
// };

// // Wrapper for the admin-only route
// const AdminRoute = ({ children }) => {
//     const { userProfile } = useAuth();
//     return userProfile?.role === 'admin' ? children : <Navigate to="/dashboard" replace />;
// }

// // Main App Layout
// function App() {
//   return (
//     <AuthProvider>
//       <ToastProvider>
//         <Router>
//           <div className="d-flex flex-column min-vh-100">
//             <SiteNavbar />
//             <main className="flex-grow-1">
//               <Routes>
//                 {/* Public Routes */}
//                 <Route path="/" element={<HomePage />} />
//                 <Route path="/auth" element={<AuthPage />} />
//                 <Route path="/vendors" element={<VendorDiscoveryPage />} />
//                 <Route path="/vendors/:id" element={<VendorDetailPage />} />

//                 {/* Protected Routes */}
//                 <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
//                 <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
//                 <Route path="/register-vendor" element={<ProtectedRoute><VendorRegistrationPage /></ProtectedRoute>} />
//                 <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
//                 <Route path="/messages/:vendorId" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
//                 <Route path="/vendor-dashboard" element={<ProtectedRoute><VendorDashboardPage /></ProtectedRoute>} />
//                 <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

//                 {/* Admin Route */}
//                 <Route path="/admin" element={<ProtectedRoute><AdminRoute><AdminDashboardPage /></AdminRoute></ProtectedRoute>} />

//                 {/* 404 Not Found */}
//                 <Route path="*" element={<Container className="text-center my-5"><h1>404 - Page Not Found</h1></Container>} />
//               </Routes>
//             </main>
//             <Footer />
//           </div>
//         </Router>
//       </ToastProvider>
//     </AuthProvider>
//   );
// }

// export default App;


import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

// Import Components
import SiteNavbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Import Pages
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import UserProfilePage from './pages/UserProfilePage';
import VendorRegistrationPage from './pages/VendorRegistrationPage';
import VendorDiscoveryPage from './pages/VendorDiscoveryPage';
import VendorDetailPage from './pages/VendorDetailPage';
import MessagesPage from './pages/MessagesPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import VendorDashboardPage from './pages/VendorDashboardPage';
import NotificationsPage from './pages/NotificationsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import BusinessSolutionsPage from './pages/BusinessSolutionsPage';
import PricingPage from './pages/PricingPage';
import SupportPage from './pages/SupportPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import CookiePolicyPage from './pages/CookiePolicyPage';
import './App.css';

// Wrapper for routes that require authentication
const ProtectedRoute = ({ children }) => {
  const { currentUser, loadingAuth } = useAuth();
  if (loadingAuth) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh', paddingTop: '76px' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }
  return currentUser ? children : <Navigate to="/auth" replace />;
};

// Wrapper for the admin-only route
const AdminRoute = ({ children }) => {
    const { userProfile } = useAuth();
    return userProfile?.role === 'admin' ? children : <Navigate to="/dashboard" replace />;
}

// Main App Layout
function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="d-flex flex-column min-vh-100">
            <SiteNavbar />
            {/* Main content with proper padding for fixed navbar */}
            <main className="flex-grow-1" style={{ paddingTop: '76px', minHeight: 'calc(100vh - 76px)' }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/vendors" element={<VendorDiscoveryPage />} />
                <Route path="/vendors/:id" element={<VendorDetailPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/business-solutions" element={<BusinessSolutionsPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsOfServicePage />} />
                <Route path="/cookies" element={<CookiePolicyPage />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
                <Route path="/register-vendor" element={<ProtectedRoute><VendorRegistrationPage /></ProtectedRoute>} />
                <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
                <Route path="/messages/:vendorId" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
                <Route path="/vendor-dashboard" element={<ProtectedRoute><VendorDashboardPage /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                

                {/* Admin Route */}
                <Route path="/admin" element={<ProtectedRoute><AdminRoute><AdminDashboardPage /></AdminRoute></ProtectedRoute>} />

                {/* 404 Not Found */}
                <Route path="*" element={
                  <Container className="text-center my-5" style={{ paddingTop: '76px' }}>
                    <h1>404 - Page Not Found</h1>
                  </Container>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;