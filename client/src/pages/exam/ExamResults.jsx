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
} from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

import Button from "../../components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { useDocument } from "../../hooks/useDocuments";
import { fadeIn } from "../../utils/animations";

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="h-6 w-6 mr-2" />
            Something went wrong
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 mb-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              An error occurred while displaying exam results:
            </p>
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto text-sm">
              {error.message}
            </pre>
          </div>
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/documents")}
            >
              Return to Documents
            </Button>
            <Button onClick={resetErrorBoundary}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
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
    if (percentage >= 80) return "text-green-600 dark:text-green-400";
    if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  if (!examResults) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const { questions, answers, validationResults, timeSpent, documentId } =
    examResults;
  const scorePercentage = getScorePercentage();

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/documents")}
                icon={ArrowLeft}
                className="mr-4"
              >
                Back to Documents
              </Button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Exam Results
              </h1>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleExportPdf}
                icon={FileDown}
                size="sm"
              >
                Export PDF
              </Button>
              <Button onClick={handleTakeNewExam} size="sm">
                Take New Exam
              </Button>
            </div>
          </div>

          <div ref={targetRef}>
            <div ref={resultsRef} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Overall Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Score
                      </p>
                      <p
                        className={`text-3xl font-bold ${getScoreColor(
                          scorePercentage
                        )}`}
                      >
                        {scorePercentage}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Questions
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {
                          validationResults.filter(
                            (r) => r.result === "Correct"
                          ).length
                        }{" "}
                        / {questions.length}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Time Spent
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatTime(timeSpent)}
                      </p>
                    </div>
                  </div>
                  {document && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Document:{" "}
                        <span className="font-medium">{document.title}</span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-4">
                {questions.map((question, index) => {
                  const result = validationResults.find(
                    (r) => r.questionId === question._id
                  );
                  const userAnswer = answers[question._id];
                  const isCorrect = result?.result === "Correct";

                  return (
                    <Card key={question._id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center">
                            <span className="mr-3">Question {index + 1}</span>
                            {isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                          </CardTitle>
                          <div className="flex items-center space-x-2">
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
                            <Badge variant={isCorrect ? "success" : "danger"}>
                              {isCorrect ? "Correct" : "Incorrect"}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            Question:
                          </h4>
                          <p className="text-gray-700 dark:text-gray-300">
                            {question.question}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            Your Answer:
                          </h4>
                          <div
                            className={`p-3 rounded-lg border ${
                              isCorrect
                                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                            }`}
                          >
                            <p className="text-gray-700 dark:text-gray-300">
                              {userAnswer}
                            </p>
                          </div>
                        </div>

                        {result?.correctAnswer && (
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                              Correct Answer:
                            </h4>
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                              <p className="text-gray-700 dark:text-gray-300">
                                {result.correctAnswer}
                              </p>
                            </div>
                          </div>
                        )}

                        {result?.explanation && (
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                              {isCorrect
                                ? "Explanation:"
                                : "Why this is incorrect:"}
                            </h4>
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                              <p className="text-gray-700 dark:text-gray-300">
                                {result.explanation}
                              </p>
                            </div>
                          </div>
                        )}

                        {question.tags && question.tags.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                              Tags:
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {question.tags.map((tag) => (
                                <Badge key={tag} variant="secondary">
                                  {tag}
                                </Badge>
                              ))}
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
