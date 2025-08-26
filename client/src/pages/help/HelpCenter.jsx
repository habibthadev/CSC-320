import React, { useEffect, useRef } from "react";
import {
  Search,
  FileText,
  MessageSquare,
  Brain,
  Upload,
  HelpCircle,
  Mail,
  Clock,
  BookOpen,
  MessageCircle,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/Tabs";
import { Badge } from "../../components/ui/Badge";
import { fadeIn, staggerItems } from "../../utils/animations";

const HelpCenter = () => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("faq");
  const contentRef = useRef(null);
  const faqItemsRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      fadeIn(contentRef.current, 0.2);
    }

    if (faqItemsRef.current && activeTab === "faq") {
      const items = faqItemsRef.current.querySelectorAll(".faq-item");
      staggerItems(items, 0.3, 0.1);
    }
  }, [activeTab]);

  const faqs = [
    {
      question: "What file formats are supported?",
      answer:
        "We support PDF, DOCX, DOC, TXT, PNG, JPG, JPEG, BMP, and TIFF file formats. For images, we use OCR technology to extract text content.",
      category: "documents",
    },
    {
      question: "Is there a file size limit?",
      answer: "Yes, the maximum file size is 20MB per document.",
      category: "documents",
    },
    {
      question: "What is vectorization?",
      answer:
        "Vectorization is the process of converting document text into numerical vectors (embeddings) that capture semantic meaning. This enables more accurate document search and retrieval when chatting with documents.",
      category: "documents",
    },
    {
      question: "How does the document chat work?",
      answer:
        "Our document chat uses Retrieval-Augmented Generation (RAG) technology. When you ask a question, the system finds the most relevant parts of your document and uses them to generate an accurate answer based on the document content.",
      category: "chat",
    },
    {
      question: "Can I chat with multiple documents at once?",
      answer:
        "Yes, you can select multiple documents to chat with. The system will search across all selected documents to find the most relevant information for your query.",
      category: "chat",
    },
    {
      question: "How are questions generated from my documents?",
      answer:
        "Our AI analyzes your document content and generates questions based on the key information it contains. You can adjust the difficulty level and number of questions generated.",
      category: "questions",
    },
    {
      question: "How is my answer evaluated?",
      answer:
        "When you submit an answer to a generated question, our AI compares your response to the correct answer semantically, not just looking for exact word matches. This allows for flexibility in how you phrase your answer.",
      category: "questions",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes, we take data security seriously. Your documents are stored securely and are only accessible to you. We do not share your data with third parties.",
      category: "security",
    },
    {
      question: "Can I delete my documents?",
      answer:
        "Yes, you can delete any document from your account at any time. Once deleted, the document and all associated data are permanently removed from our servers.",
      category: "documents",
    },
    {
      question: "How do I reset my password?",
      answer:
        'You can reset your password by clicking the "Forgot password" link on the login page. We will send a one-time password (OTP) to your email that you can use to create a new password.',
      category: "account",
    },
  ];

  const filteredFaqs = searchTerm
    ? faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : faqs;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Help Center
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions and learn how to get the most out
            of our platform.
          </p>
        </div>

        <Card className="mb-8 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
              <Input
                placeholder="Search for help articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base"
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="faq" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="guides" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Guides
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Support
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faq" ref={contentRef}>
            <div className="space-y-4" ref={faqItemsRef}>
              {filteredFaqs.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="rounded-full bg-muted p-3 mb-4">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      No results found
                    </h3>
                    <p className="text-muted-foreground text-center max-w-sm">
                      We couldn't find any FAQs matching your search. Try
                      different keywords or browse all categories.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredFaqs.map((faq, index) => (
                  <Card
                    key={index}
                    className="faq-item border-0 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg font-medium leading-tight pr-4">
                          {faq.question}
                        </CardTitle>
                        <Badge
                          variant="secondary"
                          className="text-xs capitalize shrink-0"
                        >
                          {faq.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="guides" ref={contentRef}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow group">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="rounded-full bg-primary/10 p-4 mb-4 group-hover:bg-primary/20 transition-colors">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Document Upload Guide
                    </h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      Learn how to upload and manage your documents efficiently.
                    </p>
                    <Button variant="outline" className="w-full">
                      <BookOpen className="mr-2 h-4 w-4" />
                      View Guide
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow group">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="rounded-full bg-primary/10 p-4 mb-4 group-hover:bg-primary/20 transition-colors">
                      <MessageSquare className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Document Chat Tutorial
                    </h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      Master the art of chatting with your documents
                      effectively.
                    </p>
                    <Button variant="outline" className="w-full">
                      <BookOpen className="mr-2 h-4 w-4" />
                      View Guide
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow group">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="rounded-full bg-primary/10 p-4 mb-4 group-hover:bg-primary/20 transition-colors">
                      <Brain className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Question Generation
                    </h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      Generate and answer questions from your documents.
                    </p>
                    <Button variant="outline" className="w-full">
                      <BookOpen className="mr-2 h-4 w-4" />
                      View Guide
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow group">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="rounded-full bg-primary/10 p-4 mb-4 group-hover:bg-primary/20 transition-colors">
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Getting Started
                    </h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      A complete overview of the platform for new users.
                    </p>
                    <Button variant="outline" className="w-full">
                      <BookOpen className="mr-2 h-4 w-4" />
                      View Guide
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow group md:col-span-2 lg:col-span-2">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="rounded-full bg-primary/10 p-4 mb-4 group-hover:bg-primary/20 transition-colors">
                      <HelpCircle className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Advanced Features
                    </h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      Discover advanced features and best practices for power
                      users.
                    </p>
                    <Button variant="outline" className="w-full max-w-xs">
                      <BookOpen className="mr-2 h-4 w-4" />
                      View Guide
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contact" ref={contentRef}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-primary" />
                      Email Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Send us an email and we'll get back to you within 24
                      hours.
                    </p>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <a
                        href="mailto:adebayohabib7@gmail.com"
                        className="text-primary hover:underline font-medium"
                      >
                        adebayohabib7@gmail.com
                      </a>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-primary" />
                      Help Desk
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Submit a support ticket for more complex issues.
                    </p>
                    <Button className="w-full">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Submit Ticket
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Support Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Monday - Friday
                        </span>
                        <span className="font-medium">
                          9:00 AM - 5:00 PM EST
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Weekend</span>
                        <span className="font-medium">Limited Support</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Response Time
                        </span>
                        <span className="font-medium">Within 24 hours</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">Need Immediate Help?</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Check our FAQ section first - most questions are answered
                      there!
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("faq")}
                      className="w-full"
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Browse FAQ
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HelpCenter;
