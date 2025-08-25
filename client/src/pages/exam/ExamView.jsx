import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft, Clock, Send, AlertCircle } from "lucide-react";

import Button from "../../components/ui/Button";
import Textarea from "../../components/ui/Textarea";
import Label from "../../components/ui/Label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/Alert";
import Modal from "../../components/ui/Modal";
import { useDocument } from "../../hooks/useDocuments";
import { useValidateAnswer } from "../../hooks/useQuestions";
import { fadeIn } from "../../utils/animations";

const ExamView = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: document } = useDocument(documentId);
  const validateAnswerMutation = useValidateAnswer();

  const [questions, setQuestions] = useState(location.state?.questions || []);
  const [answers, setAnswers] = useState({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const examRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (examRef.current) {
      fadeIn(examRef.current, 0.2);
    }
  }, [questions]);

  useEffect(() => {
    if (!location.state?.questions || questions.length === 0) {
      toast.error("No questions found. Please generate questions first.");
      navigate(`/generate/${documentId}`);
    }
  }, [location.state, documentId, navigate, questions.length]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const isExamComplete = () => {
    return questions.every((q) => answers[q._id]?.trim());
  };

  const handleSubmit = async () => {
    if (!isExamComplete()) {
      toast.error("Please answer all questions before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const validationResults = [];

      for (const question of questions) {
        await new Promise((resolve, reject) => {
          validateAnswerMutation.mutate(
            {
              questionId: question._id,
              userAnswer: answers[question._id],
            },
            {
              onSuccess: (data) => {
                validationResults.push({
                  questionId: question._id,
                  result: data.result,
                  explanation: data.explanation,
                  correctAnswer: data.correctAnswer,
                });
                resolve();
              },
              onError: (error) => {
                toast.error(`Failed to validate question: ${error.message}`);
                reject(error);
              },
            }
          );
        });
      }

      clearInterval(timerRef.current);

      const examResults = {
        documentId,
        questions,
        answers,
        validationResults,
        timeSpent,
        completedAt: new Date().toISOString(),
      };

      localStorage.setItem("examResults", JSON.stringify(examResults));

      toast.success("Exam submitted successfully");
      navigate(`/exam/results`);
    } catch (error) {
      console.error("Exam submission error:", error);
      toast.error("An error occurred while submitting your exam");
    } finally {
      setIsSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (!questions.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No Questions Available
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No questions have been generated for this exam yet.
          </p>
          <Button onClick={() => navigate(`/generate/${documentId}`)}>
            Generate Questions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/documents/${documentId}`)}
              icon={ArrowLeft}
              className="mr-4"
            >
              Back to Document
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Exam Questions
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <Clock className="h-4 w-4 mr-1" />
              <span>{formatTime(timeSpent)}</span>
            </div>
          </div>
        </div>

        <div ref={examRef}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Exam Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Answer all {questions.length} questions. Once submitted, you
                  cannot change your answers. Your answers will be evaluated and
                  corrections will be provided.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="space-y-6 mb-6">
            {questions.map((question, index) => (
              <Card key={question._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Question {index + 1}</CardTitle>
                    <Badge
                      variant={
                        question.difficulty === "easy"
                          ? "success"
                          : question.difficulty === "medium"
                          ? "warning"
                          : "danger"
                      }
                    >
                      {question.difficulty}
                    </Badge>
                  </div>
                  {question.tags && question.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {question.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-lg text-gray-900 dark:text-white">
                    {question.question}
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor={`answer-${question._id}`} required>
                      Your Answer
                    </Label>
                    <Textarea
                      id={`answer-${question._id}`}
                      placeholder="Type your answer here..."
                      value={answers[question._id] || ""}
                      onChange={(e) =>
                        handleAnswerChange(question._id, e.target.value)
                      }
                      className="min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => setShowSubmitModal(true)}
              disabled={!isExamComplete() || isSubmitting}
              icon={Send}
            >
              Submit Exam
            </Button>
          </div>
        </div>

        <Modal
          isOpen={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
          title="Submit Exam"
        >
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to submit your exam? You won't be able to
              change your answers after submission.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowSubmitModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} isLoading={isSubmitting}>
                Submit Exam
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ExamView;
