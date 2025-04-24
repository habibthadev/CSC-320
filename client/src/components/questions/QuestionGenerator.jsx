import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { usePDF } from "react-to-pdf";
import {
  ArrowLeft,
  Sparkles,
  Tag,
  Plus,
  X,
  FileDown,
  AlertCircle,
  List,
} from "lucide-react";

import Button from "../ui/Button";
import Input from "../ui/Input";
import Label from "../ui/Label";
import Select from "../ui/Select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/Card";
import Badge from "../ui/Badge";
import useDocumentStore from "../../stores/documentStore";
import useQuestionStore from "../../stores/questionStore";
import { fadeIn } from "../../utils/animations";
import QuestionGeneratorPdf from "../pdf/QuestionGeneratorPdf";

const QuestionGenerator = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const { getDocumentById, currentDocument } = useDocumentStore();
  const { generateQuestions, isLoading } = useQuestionStore();
  const [formData, setFormData] = useState({
    numQuestions: 5,
    difficulty: "medium",
    tags: [],
  });
  const [currentTag, setCurrentTag] = useState("");
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState("");
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const formRef = useRef(null);
  const previewRef = useRef(null);

  const { toPDF, targetRef } = usePDF({
    filename: `Generated_Questions_${currentDocument?.title || "Document"}.pdf`,
  });

  useEffect(() => {
    getDocumentById(documentId);
  }, [documentId, getDocumentById]);

  useEffect(() => {
    if (formRef.current) {
      fadeIn(formRef.current, 0.2);
    }
  }, []);

  useEffect(() => {
    if (preview && previewRef.current) {
      fadeIn(previewRef.current, 0.2);
    }
  }, [preview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "numQuestions" ? Number.parseInt(value, 10) : value,
    }));
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

    const {
      success,
      error,
      data,
      preview: docPreview,
    } = await generateQuestions(documentId, formData);

    if (success) {
      setPreview(docPreview);
      setGeneratedQuestions(data || []);
      toast.success("Questions generated successfully");
    } else {
      toast.error(error || "Failed to generate questions");
    }
  };

  const handleExportPdf = () => {
    if (!generatedQuestions.length) {
      toast.error("No questions to export");
      return;
    }

    try {
      toPDF();
      toast.success("Questions exported as PDF successfully");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF");
    }
  };

  const handleFinish = () => {
    navigate(`/documents/${documentId}`);
  };

  const handleAnswerQuestion = (questionId) => {
    navigate(`/questions/${questionId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
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
            Generate Questions
          </h1>
        </div>

        {!preview ? (
          <Card ref={formRef}>
            <CardHeader>
              <CardTitle>Question Generation Settings</CardTitle>
              <CardDescription>
                Generate questions based on the content of your document
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="document">Document</Label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {currentDocument ? currentDocument.title : "Loading..."}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numQuestions" required>
                    Number of Questions
                  </Label>
                  <Input
                    id="numQuestions"
                    name="numQuestions"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.numQuestions}
                    onChange={handleChange}
                    error={errors.numQuestions}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Choose between 1 and 20 questions
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty" required>
                    Difficulty Level
                  </Label>
                  <Select
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    error={errors.difficulty}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (Optional)</Label>
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="tags"
                        placeholder="Add a tag and press Enter"
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
                      icon={Plus}
                    >
                      Add
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => navigate(`/documents/${documentId}`)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit}
                isLoading={isLoading}
                icon={Sparkles}
              >
                Generate Questions
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div ref={previewRef}>
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Document Preview</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPdf}
                  icon={FileDown}
                >
                  Export as PDF
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg max-h-40 overflow-y-auto">
                  <p className="text-gray-800 dark:text-gray-200">{preview}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generated Questions</CardTitle>
                <CardDescription>
                  {generatedQuestions.length} questions were generated from your
                  document
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedQuestions.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No questions could be generated from this document. The
                      document might not contain enough structured content.
                    </p>
                    <Button onClick={() => setPreview("")} className="mt-4">
                      Try Different Settings
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {generatedQuestions.map((question, index) => (
                      <div
                        key={question._id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {index + 1}. {question.question}
                            </h3>
                            <div className="mt-2">
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
                              {question.tags &&
                                question.tags.map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="ml-2"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAnswerQuestion(question._id)}
                          >
                            Answer
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setPreview("")}>
                    Back to Settings
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/questions/list/${documentId}`)}
                    icon={List}
                  >
                    View All Questions
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleExportPdf}
                    icon={FileDown}
                    disabled={generatedQuestions.length === 0}
                  >
                    Export PDF
                  </Button>
                  <Button onClick={handleFinish}>Finish</Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>

      {/* Hidden PDF template for export */}
      <div className="hidden">
        <QuestionGeneratorPdf
          ref={targetRef}
          document={currentDocument}
          questions={generatedQuestions}
          preview={preview}
          settings={formData}
        />
      </div>
    </div>
  );
};

export default QuestionGenerator;
