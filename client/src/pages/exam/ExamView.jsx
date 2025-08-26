import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Clock,
  Send,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Timer,
} from "lucide-react";

import { Button } from "../../components/ui/Button";
import { Textarea } from "../../components/ui/Textarea";
import { Label } from "../../components/ui/Label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Alert } from "../../components/ui/Alert";
import { Modal } from "../../components/ui/Modal";
import { Spinner } from "../../components/ui/Spinner";
import { useDocument } from "../../hooks/useDocuments";
import { useValidateAnswer } from "../../hooks/useQuestions";
import { fadeIn } from "../../utils/animations";
import { cn } from "../../utils";

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
      <div className="min-h-screen bg-background px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="rounded-full bg-muted p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">
            No Questions Available
          </h1>
          <p className="text-muted-foreground mb-6">
            No questions have been generated for this exam yet.
          </p>
          <Button
            onClick={() => navigate(`/generate/${documentId}`)}
            className="w-full"
          >
            Generate Questions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/documents/${documentId}`)}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Exam Questions
              </h1>
              <p className="text-muted-foreground">
                Answer all questions to complete the exam
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-sm font-medium">
              {formatTime(timeSpent)}
            </span>
          </div>
        </div>

        <div ref={examRef} className="space-y-6">
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Exam Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="border-primary/20 bg-primary/5">
                <div className="space-y-2">
                  <p className="font-medium">Important Guidelines:</p>
                  <ul className="text-sm space-y-1 ml-4 list-disc">
                    <li>
                      Answer all {questions.length} questions to submit the exam
                    </li>
                    <li>Once submitted, you cannot change your answers</li>
                    <li>
                      Your answers will be evaluated with detailed feedback
                    </li>
                    <li>Take your time to provide thoughtful responses</li>
                  </ul>
                </div>
              </Alert>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success-600" />
              <span className="text-sm font-medium">
                Progress:{" "}
                {
                  Object.keys(answers).filter((id) => answers[id]?.trim())
                    .length
                }{" "}
                / {questions.length} answered
              </span>
            </div>
            <div className="w-32 bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    (Object.keys(answers).filter((id) => answers[id]?.trim())
                      .length /
                      questions.length) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-6">
            {questions.map((question, index) => (
              <Card key={question._id} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                          {index + 1}
                        </span>
                        Question {index + 1}
                      </CardTitle>
                      {question.tags && question.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {question.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Badge
                      variant={
                        question.difficulty === "easy"
                          ? "default"
                          : question.difficulty === "medium"
                          ? "secondary"
                          : "destructive"
                      }
                      className="ml-4"
                    >
                      {question.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/20 rounded-lg border-l-4 border-primary">
                    <p className="text-base leading-relaxed">
                      {question.question}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor={`answer-${question._id}`}
                      className="text-base"
                    >
                      Your Answer <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id={`answer-${question._id}`}
                      placeholder="Type your detailed answer here..."
                      value={answers[question._id] || ""}
                      onChange={(e) =>
                        handleAnswerChange(question._id, e.target.value)
                      }
                      className="min-h-[120px] resize-none"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {answers[question._id]?.length || 0} characters
                      </span>
                      {answers[question._id]?.trim() && (
                        <div className="flex items-center gap-1 text-success-600">
                          <CheckCircle className="h-3 w-3" />
                          <span>Answered</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="sticky bottom-4 pt-6">
            <Card className="border-primary/20 bg-background/95 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Time spent: {formatTime(timeSpent)}</span>
                  </div>
                  <Button
                    onClick={() => setShowSubmitModal(true)}
                    disabled={!isExamComplete() || isSubmitting}
                    className={cn(
                      "min-w-[140px]",
                      isExamComplete() && "bg-success-600 hover:bg-success-700"
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Exam
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Modal
          isOpen={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
          title="Submit Exam"
          description="Confirm your exam submission"
        >
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-2">Exam Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Questions answered:</span>
                  <span className="font-medium">
                    {
                      Object.keys(answers).filter((id) => answers[id]?.trim())
                        .length
                    }{" "}
                    / {questions.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Time spent:</span>
                  <span className="font-medium">{formatTime(timeSpent)}</span>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground">
              Are you sure you want to submit your exam? You won't be able to
              change your answers after submission.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowSubmitModal(false)}
              >
                Review Again
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-success-600 hover:bg-success-700"
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Submitting...
                  </>
                ) : (
                  "Confirm Submit"
                )}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ExamView;
