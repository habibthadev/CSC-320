import { useEffect, useRef } from "react";
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
import useExamStore from "../../stores/examStore";
import useDocumentStore from "../../stores/documentStore";
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
  const {
    currentExamResults: results,
    examAnswers: answers,
    examQuestions: questions,
    examTimeSpent: timeSpent,
    examDocumentId: documentId,
    clearExamResults,
  } = useExamStore();
  const { getDocumentById, currentDocument } = useDocumentStore();
  const resultsRef = useRef(null);

  const { toPDF, targetRef } = usePDF({
    filename: `Exam_Results_${currentDocument?.title || "Document"}.pdf`,
  });

  useEffect(() => {
    if (!results || !questions || questions.length === 0) {
      toast.error("No exam results found");
      navigate("/documents");
      return;
    }

    if (documentId) {
      getDocumentById(documentId);
    }
  }, [results, questions, documentId, navigate, getDocumentById]);

  useEffect(() => {
    if (resultsRef.current) {
      fadeIn(resultsRef.current, 0.2);
    }
  }, [results]);

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
    clearExamResults();
    navigate(`/exam/generate/${documentId}`);
  };

  if (!results || !questions || questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" ref={targetRef}>
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
              {/* Back to Document */}
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Exam Results
            </h1>
          </div>
          {/* <Button
            variant="outline"
            size="sm"
            onClick={handleExportPdf}
            icon={FileDown}
          >
            Export PDF
          </Button> */}
        </div>

        <div ref={resultsRef}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Exam Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Questions
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {questions.length}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Correct Answers
                  </p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {results.filter((r) => r.result === "Correct").length}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Score
                  </p>
                  <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                    {Math.round(
                      (results.filter((r) => r.result === "Correct").length /
                        questions.length) *
                        100
                    )}
                    %
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Time Spent
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatTime(timeSpent)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6 mb-6">
            {results.map((result, index) => {
              const question = questions.find(
                (q) => q._id === result.questionId
              );

              return (
                <Card key={result.questionId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        {result.result === "Correct" ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                            <span>Question {index + 1}</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-5 w-5 text-red-500 mr-2" />
                            <span>Question {index + 1}</span>
                          </>
                        )}
                      </CardTitle>
                      <Badge
                        variant={
                          result.result === "Correct" ? "success" : "danger"
                        }
                      >
                        {result.result}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        Question:
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        {question.question}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        Your Answer:
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        {answers[question._id]}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        Correct Answer:
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        {result.explanation}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-between md:flex-row flex-col items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/documents/${documentId}`)}
              className="w-full md:w-auto"
            >
              Back to Document
            </Button>
            <div className="flex space-y-2 md:space-x-2 md:flex-row flex-col w-full md:w-auto">
              <Button
                variant="outline"
                onClick={handleExportPdf}
                icon={FileDown}
                className="w-full md:w-auto"
              >
                Export PDF
              </Button>
              <Button onClick={handleTakeNewExam} className="w-full md:w-auto">
                Take New Exam
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExamResultsWithErrorBoundary = () => {
  const navigate = useNavigate();

  const handleReset = () => {
    navigate(0);
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={handleReset}>
      <ExamResults />
    </ErrorBoundary>
  );
};

export default ExamResultsWithErrorBoundary;
