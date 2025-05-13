import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import Layout from "./components/layout/Layout";
import ExamGenerator from "./components/questions/ExamGenerator";

import useAuthStore from "./stores/authStore";

import HomePage from "./pages/home/HomePage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import DocumentList from "./pages/documents/DocumentList";
import DocumentUpload from "./pages/documents/DocumentUpload";
import DocumentDetail from "./pages/documents/DocumentDetail";
import DocumentEdit from "./pages/documents/DocumentEdit";
import ChatView from "./pages/chat/ChatView";
import ProfileView from "./pages/profile/ProfileView";
import HelpCenter from "./pages/help/HelpCenter";
import ExamView from "./pages/exam/ExamView";
import ExamResults from "./pages/exam/ExamResults";
import TermsOfService from "./pages/legal/TermsOfService";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import NotFound from "./pages/errors/NotFound";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const { getProfile, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      getProfile();
    }
  }, [isAuthenticated, getProfile]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          {}
          <Route index element={<HomePage />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
          <Route path="help" element={<HelpCenter />} />
          <Route path="terms" element={<TermsOfService />} />
          <Route path="privacy" element={<PrivacyPolicy />} />

          {}
          <Route
            path="documents"
            element={
              <ProtectedRoute>
                <DocumentList />
              </ProtectedRoute>
            }
          />
          <Route
            path="documents/upload"
            element={
              <ProtectedRoute>
                <DocumentUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="documents/:id"
            element={
              <ProtectedRoute>
                <DocumentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="documents/edit/:id"
            element={
              <ProtectedRoute>
                <DocumentEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="chat/:id"
            element={
              <ProtectedRoute>
                <ChatView />
              </ProtectedRoute>
            }
          />
          <Route
            path="exam/generate/:documentId"
            element={
              <ProtectedRoute>
                <ExamGenerator />
              </ProtectedRoute>
            }
          />
          <Route
            path="exam/:documentId"
            element={
              <ProtectedRoute>
                <ExamView />
              </ProtectedRoute>
            }
          />
          <Route
            path="exam/results"
            element={
              <ProtectedRoute>
                <ExamResults />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ProfileView />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
