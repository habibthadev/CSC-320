// Temporarily commented out during app changes
/*
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/layout/Layout";
import ExamGenerator from "./components/questions/ExamGenerator";

import { useAuth } from "./hooks/useAuth";
import { useAuthInit } from "./hooks/useAuthInit";

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
import { Scroll } from "lucide-react";
import { ScrollToTop } from "./helpers/scrollToTop";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const { isLoading: authLoading } = useAuthInit();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/"
          element={
            <Layout>
              <HomePage />
            </Layout>
          }
        />

        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <Layout>
                <DocumentList />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/documents/upload"
          element={
            <ProtectedRoute>
              <Layout>
                <DocumentUpload />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/documents/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <DocumentDetail />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/documents/edit/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <DocumentEdit />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Layout>
                <ChatView />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ChatView />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/exam"
          element={
            <ProtectedRoute>
              <Layout>
                <ExamView />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/exam/:documentId"
          element={
            <ProtectedRoute>
              <Layout>
                <ExamView />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/exam/results"
          element={
            <ProtectedRoute>
              <Layout>
                <ExamResults />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/generate"
          element={
            <ProtectedRoute>
              <Layout>
                <ExamGenerator />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/generate/:documentId"
          element={
            <ProtectedRoute>
              <Layout>
                <ExamGenerator />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <ProfileView />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/help"
          element={
            <Layout>
              <HelpCenter />
            </Layout>
          }
        />

        <Route
          path="/terms"
          element={
            <Layout>
              <TermsOfService />
            </Layout>
          }
        />

        <Route
          path="/privacy"
          element={
            <Layout>
              <PrivacyPolicy />
            </Layout>
          }
        />

        <Route
          path="*"
          element={
            <Layout>
              <NotFound />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}
*/

// Temporary maintenance message component
function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 dark:bg-teal-900 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-teal-600 dark:text-teal-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          App Under Maintenance
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We're currently making some exciting improvements to enhance your
          experience. The app will be back online shortly.
        </p>

        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-500">
          <div className="animate-pulse w-2 h-2 bg-teal-500 rounded-full"></div>
          <span>Making changes...</span>
        </div>
      </div>
    </div>
  );
}

export default App;
