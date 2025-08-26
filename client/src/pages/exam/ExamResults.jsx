import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { usePDF } from "react-to-pdf";
import {
  ArrowLeft,
  FileDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trophy,
  Clock,
  Target,
  BookOpen,
  Download,
  RotateCcw,
} from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

import { Button } from "../../components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";
import { useDocument } from "../../hooks/useDocuments";
import { fadeIn } from "../../utils/animations";
import { cn } from "../../utils";

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen bg-background px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="h-6 w-6 mr-2" />
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="text-sm mb-3">
                An error occurred while displaying exam results:
              </p>
              <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                {error.message}
              </pre>
            </div>
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/documents")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Documents
              </Button>
              <Button onClick={resetErrorBoundary}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ExamResults = () => {
  const navigate = useNavigate();
  const [examResults, setExamResults] = useState(null);
  const resultsRef = useRef(null);

  const { data: document } = useDocument(examResults?.documentId);

  const { toPDF, targetRef } = usePDF({
    filename: `Exam_Results_${document?.title || "Document"}.pdf`,
  });

  useEffect(() => {
    const storedResults = localStorage.getItem("examResults");
    if (storedResults) {
      try {
        const parsedResults = JSON.parse(storedResults);
        setExamResults(parsedResults);
      } catch (error) {
        console.error("Error parsing exam results:", error);
        toast.error("Error loading exam results");
        navigate("/documents");
      }
    } else {
      toast.error("No exam results found");
      navigate("/documents");
    }
  }, [navigate]);

  useEffect(() => {
    if (resultsRef.current) {
      fadeIn(resultsRef.current, 0.2);
    }
  }, [examResults]);

  const handleExportPdf = () => {
    try {
      toPDF();
      toast.success("Exam results exported as PDF successfully");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleTakeNewExam = () => {
    localStorage.removeItem("examResults");
    navigate(`/generate/${examResults.documentId}`);
  };

  const getScorePercentage = () => {
    if (!examResults?.validationResults) return 0;
    const correctAnswers = examResults.validationResults.filter(
      (result) => result.result === "Correct"
    ).length;
    return Math.round(
      (correctAnswers / examResults.validationResults.length) * 100
    );
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "text-success-600";
    if (percentage >= 60) return "text-warning-600";
    return "text-error-600";
  };

  if (!examResults) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Spinner className="h-8 w-8" />
          <p className="text-muted-foreground">Loading exam results...</p>
        </div>
      </div>
    );
  }

  const { questions, answers, validationResults, timeSpent, documentId } =
    examResults;
  const scorePercentage = getScorePercentage();

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="min-h-screen bg-background">
        <div className="container max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/documents")}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Exam Results
                </h1>
                <p className="text-muted-foreground">
                  Your exam performance and feedback
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportPdf} size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <Button onClick={handleTakeNewExam} size="sm">
                <RotateCcw className="mr-2 h-4 w-4" />
                New Exam
              </Button>
            </div>
          </div>

          <div ref={targetRef}>
            <div ref={resultsRef} className="space-y-8">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Overall Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                      <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground mb-1">
                        Final Score
                      </p>
                      <p
                        className={cn(
                          "text-4xl font-bold",
                          scorePercentage >= 80
                            ? "text-success-600"
                            : scorePercentage >= 60
                            ? "text-warning-500"
                            : "text-error-500"
                        )}
                      >
                        {scorePercentage}%
                      </p>
                    </div>

                    <div className="text-center p-4 rounded-lg bg-muted/30">
                      <Target className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-1">
                        Questions
                      </p>
                      <p className="text-2xl font-bold">
                        {
                          validationResults.filter(
                            (r) => r.result === "Correct"
                          ).length
                        }
                        <span className="text-lg text-muted-foreground">
                          {" "}
                          / {questions.length}
                        </span>
                      </p>
                    </div>

                    <div className="text-center p-4 rounded-lg bg-muted/30">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-1">
                        Time Spent
                      </p>
                      <p className="text-2xl font-bold">
                        {formatTime(timeSpent)}
                      </p>
                    </div>

                    <div className="text-center p-4 rounded-lg bg-muted/30">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-1">
                        Grade
                      </p>
                      <Badge
                        variant={
                          scorePercentage >= 80
                            ? "default"
                            : scorePercentage >= 60
                            ? "secondary"
                            : "destructive"
                        }
                        className="text-lg px-3 py-1"
                      >
                        {scorePercentage >= 90
                          ? "A+"
                          : scorePercentage >= 80
                          ? "A"
                          : scorePercentage >= 70
                          ? "B"
                          : scorePercentage >= 60
                          ? "C"
                          : "F"}
                      </Badge>
                    </div>
                  </div>

                  {document && (
                    <div className="mt-6 p-4 bg-muted/20 rounded-lg border-l-4 border-primary">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Document:
                        </span>
                        <span className="font-medium">{document.title}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Question Breakdown</h2>
                {questions.map((question, index) => {
                  const result = validationResults.find(
                    (r) => r.questionId === question._id
                  );
                  const userAnswer = answers[question._id];
                  const isCorrect = result?.result === "Correct";

                  return (
                    <Card key={question._id} className="border-0 shadow-lg">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold",
                                isCorrect
                                  ? "bg-success-100 text-success-700 border-2 border-success-200"
                                  : "bg-error-100 text-error-700 border-2 border-error-200"
                              )}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                Question {index + 1}
                                {isCorrect ? (
                                  <CheckCircle className="h-5 w-5 text-success-600" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-error-600" />
                                )}
                              </CardTitle>
                              {question.tags && question.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {question.tags.map((tag) => (
                                    <Badge
                                      key={tag}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge
                              variant={
                                question.difficulty === "easy"
                                  ? "default"
                                  : question.difficulty === "medium"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {question.difficulty}
                            </Badge>
                            <Badge
                              variant={isCorrect ? "default" : "destructive"}
                              className={
                                isCorrect
                                  ? "bg-success-600 hover:bg-success-700"
                                  : ""
                              }
                            >
                              {isCorrect ? "Correct" : "Incorrect"}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <h4 className="font-medium mb-2">Question:</h4>
                          <div className="p-4 bg-muted/20 rounded-lg border-l-4 border-primary">
                            <p className="leading-relaxed">
                              {question.question}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Your Answer:</h4>
                          <div
                            className={cn(
                              "p-4 rounded-lg border-l-4",
                              isCorrect
                                ? "bg-success-50 border-success-200 text-success-900"
                                : "bg-error-50 border-error-200 text-error-900"
                            )}
                          >
                            <p className="leading-relaxed">{userAnswer}</p>
                          </div>
                        </div>

                        {result?.correctAnswer && !isCorrect && (
                          <div>
                            <h4 className="font-medium mb-2">
                              Correct Answer:
                            </h4>
                            <div className="p-4 bg-success-50 rounded-lg border-l-4 border-success-200">
                              <p className="leading-relaxed text-success-900">
                                {result.correctAnswer}
                              </p>
                            </div>
                          </div>
                        )}

                        {result?.explanation && (
                          <div>
                            <h4 className="font-medium mb-2">
                              {isCorrect
                                ? "Explanation:"
                                : "Why this is incorrect:"}
                            </h4>
                            <div className="p-4 bg-info-50 rounded-lg border-l-4 border-info-200">
                              <p className="leading-relaxed text-info-900">
                                {result.explanation}
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ExamResults;
