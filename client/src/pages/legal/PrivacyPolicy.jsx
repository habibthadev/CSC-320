import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Scale, Shield } from "lucide-react";
import Button from "../../components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import { fadeIn } from "../../utils/animations";

const PrivacyPolicy = () => {
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
            Privacy Policy
          </h1>
        </div>

        <Card ref={contentRef}>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900">
              <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle>Haskmee Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last Updated: April 24, 2023
            </p>

            <h2>1. Introduction</h2>
            <p>
              At Haskmee, we take your privacy seriously. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your
              information when you use our document management and AI-powered
              services.
            </p>

            <h2>2. Information We Collect</h2>
            <p>
              We collect several types of information from and about users of
              our Service:
            </p>
            <ul>
              <li>
                <strong>Personal Information:</strong> Name, email address, and
                other contact details you provide when registering for an
                account.
              </li>
              <li>
                <strong>Document Content:</strong> The documents you upload,
                including any text, images, or other content contained within
                those documents.
              </li>
              <li>
                <strong>Usage Data:</strong> Information about how you interact
                with our Service, including features used, time spent, and
                actions taken.
              </li>
              <li>
                <strong>Device Information:</strong> Information about the
                device and browser you use to access our Service.
              </li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>
              We use the information we collect for various purposes, including:
            </p>
            <ul>
              <li>Providing, maintaining, and improving our Service</li>
              <li>
                Processing and analyzing your documents to generate questions,
                answers, and insights
              </li>
              <li>Personalizing your experience with the Service</li>
              <li>Communicating with you about your account and the Service</li>
              <li>Ensuring the security and integrity of our Service</li>
              <li>Complying with legal obligations</li>
            </ul>

            <h2>4. AI Processing and Data Security</h2>
            <p>
              Our Service uses artificial intelligence to process your
              documents. This processing may include:
            </p>
            <ul>
              <li>Text extraction and analysis</li>
              <li>
                Generation of questions and answers based on document content
              </li>
              <li>
                Creation of vector embeddings for semantic search and retrieval
              </li>
            </ul>
            <p>
              We implement appropriate technical and organizational measures to
              protect your data during AI processing. Your documents are
              processed in a secure environment and are not used to train our AI
              models unless you explicitly consent to such use.
            </p>

            <h2>5. Data Retention</h2>
            <p>
              We retain your personal information and uploaded documents for as
              long as your account is active or as needed to provide you with
              the Service. You can request deletion of your data at any time by
              contacting us.
            </p>

            <h2>6. Sharing Your Information</h2>
            <p>
              We do not sell your personal information or document content to
              third parties. We may share your information in the following
              circumstances:
            </p>
            <ul>
              <li>With service providers who help us operate our Service</li>
              <li>To comply with legal obligations</li>
              <li>To protect and defend our rights and property</li>
              <li>With your consent or at your direction</li>
            </ul>

            <h2>7. Your Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding
              your personal information, including:
            </p>
            <ul>
              <li>The right to access and receive a copy of your data</li>
              <li>The right to rectify or update your data</li>
              <li>The right to delete your data</li>
              <li>
                The right to restrict or object to our processing of your data
              </li>
              <li>The right to data portability</li>
            </ul>
            <p>
              To exercise these rights, please contact us using the information
              provided below.
            </p>

            <h2>8. Children's Privacy</h2>
            <p>
              Our Service is not intended for children under the age of 16. We
              do not knowingly collect personal information from children under
              16. If you are a parent or guardian and believe your child has
              provided us with personal information, please contact us.
            </p>

            <h2>9. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page
              and updating the "Last Updated" date.
            </p>

            <h2>10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us at:
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
                to="/terms"
                className="text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400 flex items-center gap-2"
              >
                <Scale className="h-4 w-4" />
                <span>Terms of Service</span>
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

export default PrivacyPolicy;
