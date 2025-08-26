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
} from "lucide-react";

import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Select } from "../ui/Select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Spinner } from "../ui/Spinner";
import { useDocument } from "../../hooks/useDocuments";
import { useGenerateQuestions } from "../../hooks/useQuestions";
import { cn } from "../../utils";

const ExamGenerator = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    numQuestions: 5,
    difficulty: "medium",
    tags: [],
  });
  const [currentTag, setCurrentTag] = useState("");
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);

  const { data: currentDocument, isLoading: documentLoading } =
    useDocument(documentId);
  const generateQuestionsMutation = useGenerateQuestions();

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

    generateQuestionsMutation.mutate(
      { documentId, options: formData },
      {
        onSuccess: (data) => {
          navigate(`/exam/${documentId}`, { state: { questions: data.data } });
        },
      }
    );
  };

  if (documentLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Spinner className="h-8 w-8" />
          <p className="text-gray-600 dark:text-gray-400">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
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
              Generate Exam Questions
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create custom questions from your document
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card ref={formRef} className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Exam Configuration
                </CardTitle>
                <CardDescription>
                  Customize your exam questions based on the document content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="document">Source Document</Label>
                    <div className="p-4 bg-muted/30 rounded-lg border-l-4 border-primary">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <p className="font-medium">
                          {currentDocument
                            ? currentDocument.title
                            : "Loading..."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
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
                        errors.numQuestions && "border-destructive"
                      )}
                    />
                    {errors.numQuestions && (
                      <p className="text-sm text-destructive">
                        {errors.numQuestions}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Choose between 1 and 20 questions for your exam
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty">
                      Difficulty Level{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      id="difficulty"
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleChange}
                      className={cn(errors.difficulty && "border-destructive")}
                    >
                      <option value="easy">
                        Easy - Basic concepts and definitions
                      </option>
                      <option value="medium">
                        Medium - Moderate understanding required
                      </option>
                      <option value="hard">
                        Hard - Deep analysis and critical thinking
                      </option>
                    </Select>
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
                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600 dark:text-gray-400" />
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
                        <p className="text-sm text-gray-600 dark:text-gray-400">
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Add specific topics or areas you want the questions to
                      focus on
                    </p>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/documents/${documentId}`)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={generateQuestionsMutation.isPending}
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

          <div className="lg:col-span-1">
            <div className="space-y-6">
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="h-5 w-5 text-primary" />
                    Pro Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Question Quality</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      The quality of questions depends on your document content.
                      Detailed documents generate better questions.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Difficulty Levels</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Easy: Recall and basic understanding</li>
                      <li>• Medium: Application and analysis</li>
                      <li>• Hard: Critical thinking and synthesis</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Focus Areas</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Use focus areas to target specific topics or chapters in
                      your document.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Exam Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Questions:
                    </span>
                    <span className="font-medium">{formData.numQuestions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Difficulty:
                    </span>
                    <Badge
                      variant={
                        formData.difficulty === "easy"
                          ? "default"
                          : formData.difficulty === "medium"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {formData.difficulty}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Focus Areas:
                    </span>
                    <span className="font-medium">
                      {formData.tags.length || "None"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Est. Time:
                    </span>
                    <span className="font-medium">
                      {formData.numQuestions * 3 - 5} min
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamGenerator;
