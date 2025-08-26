import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  MessageSquare,
  Brain,
  Upload,
  Database,
  Shield,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import Button from "../../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
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

  const features = [
    {
      icon: Upload,
      title: "Document Upload",
      description:
        "Upload PDFs, Word documents, text files, and images with automatic text extraction.",
    },
    {
      icon: Database,
      title: "Vector Database",
      description:
        "Convert documents into vector embeddings for semantic search and retrieval.",
    },
    {
      icon: MessageSquare,
      title: "Document Chat",
      description:
        "Chat with your documents using RAG technology for accurate, context-aware responses.",
    },
    {
      icon: Brain,
      title: "Question Generation",
      description:
        "Automatically generate questions from your documents with adjustable difficulty levels.",
    },
    {
      icon: FileText,
      title: "Multiple File Formats",
      description:
        "Support for PDFs, Word documents, text files, and images with OCR capabilities.",
    },
    {
      icon: Shield,
      title: "Secure Storage",
      description:
        "Your documents are securely stored and accessible only to you.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <section
        className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20"
        ref={heroRef}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-16 sm:py-20 lg:py-24">
            <div className="mx-auto max-w-4xl text-center">
              <div className="space-y-6 sm:space-y-8">
                <div className="flex justify-center">
                  <Badge
                    variant="orange"
                    className="px-4 py-2 text-sm font-medium"
                  >
                    AI-Powered Document Intelligence
                  </Badge>
                </div>

                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  Transform Documents into{" "}
                  <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                    Interactive Knowledge
                  </span>
                </h1>

                <p className="mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-400 sm:text-xl lg:text-2xl leading-relaxed">
                  Upload, analyze, and interact with your documents using
                  advanced AI. Generate questions, create exams, and chat with
                  your content seamlessly.
                </p>

                <div className="flex flex-col items-center gap-4 pt-4 sm:flex-row sm:justify-center sm:gap-6">
                  {isAuthenticated ? (
                    <>
                      <Button
                        asChild
                        size="lg"
                        className="w-full sm:w-auto min-w-[200px] h-12 text-orange-foreground shadow-lg"
                      >
                        <Link
                          to="/documents/upload"
                          className="flex items-center justify-center gap-3 px-6 py-3 text-base font-semibold bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 rounded-mdtransition-all duration-300 transform hover:scale-105 rounded-md"
                        >
                          <Upload className="h-5 w-5 flex-shrink-0" />
                          <span>Upload Document</span>
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        asChild
                        className="w-full sm:w-auto min-w-[200px] h-12 border-2 border-orange-300"
                      >
                        <Link
                          to="/documents"
                          className="flex items-center justify-center gap-3 px-6 py-3 text-base font-semibold text-foreground bg-transparent hover:bg-orange-50 hover:border-orange-400 rounded-md transition-all duration-300 transform hover:scale-105"
                        >
                          <FileText className="h-5 w-5 flex-shrink-0" />
                          <span>View Documents</span>
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        // asChild
                        size="lg"
                        className="w-full sm:w-auto min-w-[200px] h-12 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-background transition-all duration-300 transform hover:scale-105"
                      >
                        <Link
                          to="/register"
                          className="flex items-center justify-center gap-3 px-6 py-3 text-base font-semibold"
                        >
                          <span>Get Started</span>
                          <ArrowRight className="h-5 w-5 flex-shrink-0 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        // asChild
                        className="w-full sm:w-auto min-w-[180px] h-12 border-2 border-orange-300 bg-background hover:bg-orange-50 hover:border-orange-400 transition-all duration-300 transform hover:scale-105"
                      >
                        <Link
                          to="/login"
                          className="flex items-center justify-center px-6 py-3 text-base font-semibold text-foreground bg-transparent"
                        >
                          <span>Learn More</span>
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)]">
            <div className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-orange-100 to-orange-50 opacity-20"></div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 lg:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center mb-16 lg:mb-20">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-6">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 sm:text-xl lg:text-2xl leading-relaxed">
              Everything you need to transform your documents into interactive
              knowledge.
            </p>
          </div>

          <div
            className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:gap-10"
            ref={featuresRef}
          >
            {features.map((feature, index) => (
              <Card
                key={index}
                className="feature-card group relative overflow-hidden border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:shadow-orange/5 hover:-translate-y-1"
              >
                <CardHeader className="pb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange/10 group-hover:bg-orange/20 transition-colors duration-300 mb-4">
                    <feature.icon className="h-7 w-7 text-orange" />
                  </div>
                  <CardTitle className="text-xl sm:text-2xl font-semibold leading-tight">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-muted/30 via-muted/50 to-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-6">
              Ready to get started?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 sm:text-xl lg:text-2xl leading-relaxed mb-10">
              Join thousands of users who are already transforming their
              documents with AI.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
              {!isAuthenticated && (
                <>
                  <Button
                    size="lg"
                    asChild
                    className="w-full sm:w-auto min-w-[220px] h-12"
                  >
                    <Link
                      to="/register"
                      className="flex items-center justify-center gap-3 px-6 py-3 text-base font-semibold group bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-orange-foreground transition-all duration-300 transform hover:scale-105 rounded-md"
                    >
                      <span>Start Free Trial</span>
                      <ArrowRight className="h-5 w-5 flex-shrink-0 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    asChild
                    className="w-full sm:w-auto min-w-[160px] h-12 border-2 "
                  >
                    <Link
                      to="/login"
                      className="flex items-center justify-center px-6 py-3 text-base font-semibold border-orange-300 bg-background hover:bg-orange-50 hover:border-orange-400 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 rounded-md"
                    >
                      <span>Sign In</span>
                    </Link>
                  </Button>
                </>
              )}
              {isAuthenticated && (
                <Button
                  size="lg"
                  asChild
                  className="w-full sm:w-auto min-w-[280px] h-12"
                >
                  <Link
                    to="/documents/upload"
                    className="flex items-center justify-center gap-3 px-6 py-3 text-base font-semibold group bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-orange-foreground transition-all duration-300 transform hover:scale-105 rounded-md"
                  >
                    <span>Upload Your First Document</span>
                    <ArrowRight className="h-5 w-5 flex-shrink-0 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
