import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { usePDF } from "react-to-pdf";
import {
  ArrowLeft,
  Send,
  CheckCircle,
  XCircle,
  FileDown,
  AlertCircle,
  List,
} from "lucide-react";

import Button from "../ui/Button";
import Textarea from "../ui/Textarea";
import Label from "../ui/Label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/Card";
import Badge from "../ui/Badge";
import { Alert, AlertTitle, AlertDescription } from "../ui/Alert";
import useQuestionStore from "../../stores/questionStore";
import { fadeIn } from "../../utils/animations";

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getQuestionById, validateAnswer, currentQuestion, isLoading } =
    useQuestionStore();
  const [userAnswer, setUserAnswer] = useState("");
  const [validation, setValidation] = useState(null);
  const [errors, setErrors] = useState({});
  const questionRef = useRef(null);
  const resultRef = useRef(null);

  const { toPDF, targetRef } = usePDF({
    filename: `Question_Answer_${id}.pdf`,
  });

  useEffect(() => {
    getQuestionById(id);
  }, [id, getQuestionById]);

  useEffect(() => {
    if (questionRef.current) {
      fadeIn(questionRef.current, 0.2);
    }
  }, [currentQuestion]);

  useEffect(() => {
    if (validation && resultRef.current) {
      fadeIn(resultRef.current, 0.2);
    }
  }, [validation]);

  const validate = () => {
    const newErrors = {};

    if (!userAnswer.trim()) {
      newErrors.userAnswer = "Please provide an answer";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const { success, error, data } = await validateAnswer(id, userAnswer);

    if (success) {
      setValidation(data);
      toast.success("Answer submitted successfully");
    } else {
      toast.error(error || "Failed to validate answer");
    }
  };

  const handleTryAgain = () => {
    setUserAnswer("");
    setValidation(null);
  };

  const handleExportPdf = () => {
    if (!currentQuestion || !validation) {
      toast.error("Cannot export PDF without a validated answer");
      return;
    }

    try {
      toPDF();
      toast.success("Answer exported as PDF successfully");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF");
    }
  };

  if (isLoading || !currentQuestion) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
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
              onClick={() =>
                navigate(`/documents/${currentQuestion?.document}`)
              }
              icon={ArrowLeft}
              className="mr-4"
            >
              Back to Document
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Question
            </h1>
          </div>
          {currentQuestion && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate(`/questions/list/${currentQuestion.document}`)
              }
              icon={List}
            >
              All Questions
            </Button>
          )}
        </div>

        <Card className="mb-6" ref={questionRef}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Question</CardTitle>
              <Badge
                variant={
                  currentQuestion.difficulty === "easy"
                    ? "success"
                    : currentQuestion.difficulty === "medium"
                    ? "warning"
                    : "danger"
                }
              >
                {currentQuestion.difficulty}
              </Badge>
            </div>
            {currentQuestion.tags && currentQuestion.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {currentQuestion.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-900 dark:text-white">
              {currentQuestion.question}
            </p>
          </CardContent>
        </Card>

        {validation ? (
          <Card ref={resultRef}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  {validation.result === "Correct" ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-green-600 dark:text-green-500">
                        Correct Answer!
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                      <span className="text-red-600 dark:text-red-500">
                        Incorrect Answer
                      </span>
                    </>
                  )}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPdf}
                  icon={FileDown}
                >
                  Export as PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                  Your Answer:
                </h3>
                <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  {userAnswer}
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                  Correct Answer:
                </h3>
                <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  {validation.explanation}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleTryAgain}>
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate(`/questions/list/${currentQuestion.document}`)
                  }
                  icon={List}
                >
                  All Questions
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleExportPdf}
                  icon={FileDown}
                >
                  Export PDF
                </Button>
                <Button
                  onClick={() =>
                    navigate(`/documents/${currentQuestion.document}`)
                  }
                >
                  Back to Document
                </Button>
              </div>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Answer</CardTitle>
              <CardDescription>
                Provide your answer to the question above
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userAnswer" required>
                    Answer
                  </Label>
                  <Textarea
                    id="userAnswer"
                    placeholder="Type your answer here..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="min-h-[120px]"
                    error={errors.userAnswer}
                  />
                </div>

                <Alert variant="info">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Tip</AlertTitle>
                  <AlertDescription>
                    Your answer will be evaluated based on its content, not
                    exact wording. Focus on including the key concepts in your
                    response.
                  </AlertDescription>
                </Alert>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() =>
                  navigate(`/documents/${currentQuestion.document}`)
                }
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit}
                isLoading={isLoading}
                icon={Send}
              >
                Submit Answer
              </Button>
            </CardFooter>
          </Card>
        )}

        {}
        <div className="hidden">
          <QuestionAnswerPdf
            ref={targetRef}
            question={currentQuestion}
            userAnswer={userAnswer}
            validation={validation}
          />
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;
