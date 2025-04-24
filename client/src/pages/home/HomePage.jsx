import { useEffect, useRef } from "react";
import {
  FileText,
  MessageSquare,
  Brain,
  Upload,
  Database,
  Shield,
} from "lucide-react";
import Button from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import useAuthStore from "../../stores/authStore";
import { fadeIn, staggerItems } from "../../utils/animations";

const HomePage = () => {
  const { isAuthenticated } = useAuthStore();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);

  useEffect(() => {
    if (heroRef.current) {
      fadeIn(heroRef.current, 0.2);
    }

    if (featuresRef.current) {
      const items = featuresRef.current.querySelectorAll(".feature-card");
      staggerItems(items, 0.4, 0.1);
    }
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section
        className="bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-950 py-20"
        ref={heroRef}
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Document Intelligence{" "}
            <span className="text-orange-600 dark:text-orange-500">
              Simplified
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10">
            Upload documents, generate questions, and chat with your content
            using advanced AI technology.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {isAuthenticated ? (
              <>
                <Button to="/documents" size="lg" icon={FileText}>
                  My Documents
                </Button>
                <Button
                  to="/documents/upload"
                  variant="outline"
                  size="lg"
                  icon={Upload}
                >
                  Upload Document
                </Button>
              </>
            ) : (
              <>
                <Button to="/register" size="lg">
                  Get Started
                </Button>
                <Button to="/login" variant="outline" size="lg">
                  Login
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Powerful Features
          </h2>
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            ref={featuresRef}
          >
            <Card className="feature-card pt-5">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center mb-4">
                  <Upload className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Document Upload
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Upload PDFs, Word documents, text files, and images with
                  automatic text extraction.
                </p>
              </CardContent>
            </Card>

            <Card className="feature-card pt-5">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center mb-4">
                  <Database className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Vector Database
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Convert documents into vector embeddings for semantic search
                  and retrieval.
                </p>
              </CardContent>
            </Card>

            <Card className="feature-card pt-5">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Document Chat
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Chat with your documents using RAG technology for accurate,
                  context-aware responses.
                </p>
              </CardContent>
            </Card>

            <Card className="feature-card pt-5">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center mb-4">
                  <Brain className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Question Generation
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Automatically generate questions from your documents with
                  adjustable difficulty levels.
                </p>
              </CardContent>
            </Card>

            <Card className="feature-card pt-5">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Multiple File Formats
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Support for PDFs, Word documents, text files, and images with
                  OCR capabilities.
                </p>
              </CardContent>
            </Card>

            <Card className="feature-card pt-5">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Secure Storage
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Your documents are securely stored and accessible only to you.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-orange-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10">
            Join today and transform how you interact with your documents.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {isAuthenticated ? (
              <Button to="/documents/upload" size="lg" icon={Upload}>
                Upload Your First Document
              </Button>
            ) : (
              <Button to="/register" size="lg">
                Create Free Account
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
