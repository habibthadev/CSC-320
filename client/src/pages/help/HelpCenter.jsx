import React, { useEffect, useRef } from "react";
import {
  Search,
  FileText,
  MessageSquare,
  Brain,
  Upload,
  HelpCircle,
  Mail,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import { Tabs, TabsTrigger, TabsContent } from "../../components/ui/Tabs";
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Help Center
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find answers to common questions and learn how to get the most out
            of our platform.
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search for help..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="faq" value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-gray-200 dark:border-gray-800 mb-6">
            <div className="flex overflow-x-auto">
              <TabsTrigger value="faq">Frequently Asked Questions</TabsTrigger>
              <TabsTrigger value="guides">User Guides</TabsTrigger>
              <TabsTrigger value="contact">Contact Support</TabsTrigger>
            </div>
          </div>

          <TabsContent value="faq" ref={contentRef}>
            <div className="space-y-6" ref={faqItemsRef}>
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-12">
                  <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    We couldn't find any FAQs matching your search. Try
                    different keywords or browse the categories.
                  </p>
                </div>
              ) : (
                filteredFaqs.map((faq, index) => (
                  <Card key={index} className="faq-item">
                    <CardHeader>
                      <CardTitle className="text-lg">{faq.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-300">
                        {faq.answer}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="guides" ref={contentRef}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <Upload className="h-10 w-10 text-orange-500 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Document Upload Guide
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Learn how to upload and manage your documents.
                    </p>
                    <Button variant="outline">View Guide</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <MessageSquare className="h-10 w-10 text-orange-500 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Document Chat Tutorial
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Learn how to chat with your documents effectively.
                    </p>
                    <Button variant="outline">View Guide</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <Brain className="h-10 w-10 text-orange-500 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Question Generation Guide
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Learn how to generate and answer questions from your
                      documents.
                    </p>
                    <Button variant="outline">View Guide</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <FileText className="h-10 w-10 text-orange-500 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Getting Started Guide
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      A complete overview of the platform for new users.
                    </p>
                    <Button variant="outline">View Guide</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contact" ref={contentRef}>
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-600 dark:text-gray-300">
                  Need help with something not covered in our FAQs or guides?
                  Our support team is here to help.
                </p>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 p-6 border border-gray-200 dark:border-gray-800 rounded-lg text-center">
                    <Mail className="h-8 w-8 text-orange-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Email Support
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Send us an email and we'll get back to you within 24
                      hours.
                    </p>
                    <a
                      href="mailto: adebayohabib7@gmail.com"
                      className="text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400 font-medium"
                    >
                      adebayohabib7@gmail.com
                    </a>
                  </div>

                  <div className="flex-1 p-6 border border-gray-200 dark:border-gray-800 rounded-lg text-center">
                    <HelpCircle className="h-8 w-8 text-orange-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Help Desk
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Submit a support ticket for more complex issues.
                    </p>
                    <Button>Submit Ticket</Button>
                  </div>
                </div>

                <div className="p-6 bg-orange-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Support Hours
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Our support team is available Monday through Friday, 9:00 AM
                    to 5:00 PM EST.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HelpCenter;
