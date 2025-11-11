import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Tag,
  Plus,
  X,
  FileText,
  Settings,
  Zap,
  Target,
  Clock,
  BookOpen,
  TrendingUp,
  Users,
  CheckCircle,
} from "lucide-react";

import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Select } from "../../components/ui/Select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";
import { useDocument } from "../../hooks/useDocuments";
import { useGenerateQuestions } from "../../hooks/useQuestions";
import { cn } from "../../lib/utils";

const QuestionGeneratorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    numQuestions: 5,
    difficulty: "medium",
    tags: [],
  });
  const [currentTag, setCurrentTag] = useState("");
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);

  const { data: currentDocument, isLoading: documentLoading } = useDocument(id);
  const generateQuestionsMutation = useGenerateQuestions();

  const difficultyOptions = [
    {
      value: "easy",
      label: "Easy",
      description: "Basic concepts and definitions",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      icon: "📚",
    },
    {
      value: "medium",
      label: "Medium",
      description: "Moderate understanding required",
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      icon: "🎯",
    },
    {
      value: "hard",
      label: "Hard",
      description: "Deep analysis and critical thinking",
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      icon: "🧠",
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "numQuestions" ? Number.parseInt(value, 10) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validate = () => {
    const newErrors = {};

    if (formData.numQuestions < 1 || formData.numQuestions > 20) {
      newErrors.numQuestions = "Number of questions must be between 1 and 20";
    }

    if (!["easy", "medium", "hard"].includes(formData.difficulty)) {
      newErrors.difficulty = "Please select a valid difficulty level";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    if (!currentDocument?.vectorized) {
      setErrors({ submit: "Document is still processing. Please wait." });
      return;
    }

    generateQuestionsMutation.mutate(
      { documentId: id, options: formData },
      {
        onSuccess: (data) => {
          navigate(`/exam/${id}`, { state: { questions: data.data } });
        },
        onError: (error) => {
          setErrors({
            submit: error.message || "Failed to generate questions",
          });
        },
      }
    );
  };

  const getEstimatedTime = () => {
    const baseTime = 2; // 2 minutes per question
    const difficultyMultiplier =
      formData.difficulty === "easy"
        ? 1
        : formData.difficulty === "medium"
        ? 1.5
        : 2;
    return Math.round(formData.numQuestions * baseTime * difficultyMultiplier);
  };

  const getCurrentDifficulty = () => {
    return difficultyOptions.find((opt) => opt.value === formData.difficulty);
  };

  if (documentLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Spinner className="h-8 w-8" />
          <p className="text-muted-foreground">Loading document...</p>
        </div>
      </div>
    );
  }

  if (!currentDocument) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">
            Document not found
          </h2>
          <p className="text-muted-foreground">
            The document you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("/generate")}>
            Back to Documents
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/generate")}
          className="flex justify-start h-8 p-2 mb-2"
        >
          <ArrowLeft className="h-5 w-5" />{" "}
          <span className="text-muted-foreground text-lg ml-2">Go Back</span>
        </Button>
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Generate Exam Questions
            </h1>
            <p className="text-muted-foreground">
              Create custom questions from "{currentDocument.title}"
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={currentDocument.vectorized ? "default" : "secondary"}
              className={cn(
                currentDocument.vectorized
                  ? "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              )}
            >
              {currentDocument.vectorized ? (
                <>
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Ready
                </>
              ) : (
                <>
                  <Clock className="mr-1 h-3 w-3" />
                  Processing
                </>
              )}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-md">
                    <FileText className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {currentDocument.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <span>
                        {currentDocument.fileType?.toUpperCase() || "DOC"}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(
                          currentDocument.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card ref={formRef} className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  Exam Configuration
                </CardTitle>
                <CardDescription>
                  Customize your exam questions based on the document content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="numQuestions">
                      Number of Questions{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="numQuestions"
                      name="numQuestions"
                      type="number"
                      min="1"
                      max="20"
                      value={formData.numQuestions}
                      onChange={handleChange}
                      className={cn(
                        "text-lg",
                        errors.numQuestions && "border-destructive"
                      )}
                    />
                    {errors.numQuestions && (
                      <p className="text-sm text-destructive">
                        {errors.numQuestions}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Choose between 1 and 20 questions for your exam
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="difficulty">
                      Difficulty Level{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {difficultyOptions.map((option) => (
                        <div
                          key={option.value}
                          className={cn(
                            "relative cursor-pointer rounded-lg border-2 p-4 transition-all",
                            formData.difficulty === option.value
                              ? "border-teal-500 bg-teal-50 dark:bg-teal-50"
                              : "border-border hover:border-muted-foreground"
                          )}
                          onClick={() =>
                            handleChange({
                              target: {
                                name: "difficulty",
                                value: option.value,
                              },
                            })
                          }
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-xl">{option.icon}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-foreground">
                                  {option.label}
                                </h3>
                                {formData.difficulty === option.value && (
                                  <CheckCircle className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {errors.difficulty && (
                      <p className="text-sm text-destructive">
                        {errors.difficulty}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="tags">Focus Areas (Optional)</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="tags"
                          placeholder="Add a focus area and press Enter"
                          value={currentTag}
                          onChange={(e) => setCurrentTag(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="pl-10"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddTag}
                        className="shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {formData.tags.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Focus areas:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="flex items-center gap-1 px-3 py-1"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-1 rounded-full hover:bg-muted p-0.5 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Add specific topics or areas you want the questions to
                      focus on
                    </p>
                  </div>

                  {errors.submit && (
                    <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                      <p className="text-sm text-destructive">
                        {errors.submit}
                      </p>
                    </div>
                  )}
                </form>
              </CardContent>
              <CardFooter className="flex justify-between pt-6">
                <Button variant="outline" onClick={() => navigate("/generate")}>
                  Back to Documents
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    generateQuestionsMutation.isPending ||
                    !currentDocument.vectorized
                  }
                  className="min-w-[140px]"
                >
                  {generateQuestionsMutation.isPending ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Exam
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-teal-50 dark:bg-gray-600 border-teal-200 dark:border-teal-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-teal-800 dark:text-teal-200">
                  <Target className="h-5 w-5" />
                  Exam Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-teal-700 dark:text-teal-300">
                    Questions:
                  </span>
                  <span className="font-semibold text-teal-900 dark:text-teal-100">
                    {formData.numQuestions}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-teal-700 dark:text-teal-300">
                    Difficulty:
                  </span>
                  <Badge className={getCurrentDifficulty()?.color}>
                    {getCurrentDifficulty()?.icon}{" "}
                    {getCurrentDifficulty()?.label}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-teal-700 dark:text-teal-300">
                    Focus Areas:
                  </span>
                  <span className="font-semibold text-teal-900 dark:text-teal-100">
                    {formData.tags.length || "None"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-teal-700 dark:text-teal-300">
                    Est. Time:
                  </span>
                  <span className="font-semibold text-teal-900 dark:text-teal-100">
                    {getEstimatedTime()} min
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Question Quality
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    The quality of questions depends on your document content.
                    Detailed documents generate better questions.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Difficulty Guide
                  </h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>📚 Easy: Recall and basic understanding</div>
                    <div>🎯 Medium: Application and analysis</div>
                    <div>🧠 Hard: Critical thinking and synthesis</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Focus Areas
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Use focus areas to target specific topics or chapters in
                    your document for more relevant questions.
                  </p>
                </div>
              </CardContent>
            </Card>

            {!currentDocument.vectorized && (
              <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-yellow-800 dark:text-yellow-200">
                    <Clock className="h-5 w-5" />
                    Processing Document
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Your document is still being processed. This usually takes a
                    few minutes. You can set up your exam configuration now and
                    generate questions once processing is complete.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionGeneratorDetail;
