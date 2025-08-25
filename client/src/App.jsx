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
          path="/documents/:id/edit"
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

export default App;
