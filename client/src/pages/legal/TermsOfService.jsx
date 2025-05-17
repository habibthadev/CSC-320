import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Shield, Scale } from "lucide-react";
import Button from "../../components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import { fadeIn } from "../../utils/animations";

const TermsOfService = () => {
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      fadeIn(contentRef.current, 0.2);
    }

    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            icon={ArrowLeft}
            className="mr-4"
          >
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Terms of Service
          </h1>
        </div>

        <Card ref={contentRef}>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900">
              <Scale className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle>Haskmee Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last Updated: April 24, {new Date().getFullYear()}
            </p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using Haskmee ("the Service"), you agree to be
              bound by these Terms of Service. If you do not agree to these
              terms, please do not use the Service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              Haskmee provides document management, AI-powered question
              generation, and document chat services. The Service allows users
              to upload, store, analyze, and interact with their documents using
              artificial intelligence technologies.
            </p>

            <h2>3. User Accounts</h2>
            <p>
              To use certain features of the Service, you must register for an
              account. You are responsible for maintaining the confidentiality
              of your account information and for all activities that occur
              under your account. You agree to notify us immediately of any
              unauthorized use of your account.
            </p>

            <h2>4. User Content</h2>
            <p>
              You retain all rights to the content you upload to Haskmee. By
              uploading content, you grant Haskmee a non-exclusive, worldwide,
              royalty-free license to use, store, and process your content
              solely for the purpose of providing and improving the Service.
            </p>

            <h2>5. Acceptable Use</h2>
            <p>You agree not to use the Service to:</p>
            <ul>
              <li>
                Upload, transmit, or distribute content that is illegal,
                harmful, threatening, abusive, or otherwise objectionable
              </li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the intellectual property rights of others</li>
              <li>
                Attempt to gain unauthorized access to the Service or its
                related systems
              </li>
              <li>
                Interfere with or disrupt the integrity or performance of the
                Service
              </li>
              <li>Harvest or collect user information without consent</li>
            </ul>

            <h2>6. AI-Generated Content</h2>
            <p>
              The Service uses artificial intelligence to generate questions,
              provide answers, and facilitate document interactions.
              AI-generated content is provided "as is" without warranties of
              accuracy, completeness, or fitness for a particular purpose. You
              are responsible for reviewing and verifying any AI-generated
              content before relying on it.
            </p>

            <h2>7. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality
              are owned by Haskmee and are protected by international copyright,
              trademark, patent, trade secret, and other intellectual property
              laws.
            </p>

            <h2>8. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Service
              immediately, without prior notice or liability, for any reason,
              including without limitation if you breach these Terms of Service.
            </p>

            <h2>9. Limitation of Liability</h2>
            <p>
              In no event shall Haskmee, its directors, employees, partners,
              agents, suppliers, or affiliates be liable for any indirect,
              incidental, special, consequential, or punitive damages, including
              without limitation, loss of profits, data, use, goodwill, or other
              intangible losses, resulting from your access to or use of or
              inability to access or use the Service.
            </p>

            <h2>10. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms of Service
              at any time. It is your responsibility to review these Terms
              periodically for changes. Your continued use of the Service
              following the posting of any changes constitutes acceptance of
              those changes.
            </p>

            <h2>11. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of the jurisdiction in which Haskmee is established,
              without regard to its conflict of law provisions.
            </p>

            <h2>12. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p>
              <a
                href="mailto:adebayohabib7@gmail.com"
                className="text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400"
              >
                adebayohabib7@gmail.com
              </a>
            </p>

            <div className="mt-8 flex justify-between items-center">
              <Link
                to="/privacy"
                className="text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400 flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                <span>Privacy Policy</span>
              </Link>
              <Link
                to="/"
                className="text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400 flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                <span>Home</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
