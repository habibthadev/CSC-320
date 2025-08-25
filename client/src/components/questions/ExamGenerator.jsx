import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Tag, Plus, X } from "lucide-react";

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
import Spinner from "../ui/Spinner";
import { useDocument } from "../../hooks/useDocuments";
import { useGenerateQuestions } from "../../hooks/useQuestions";

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
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

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
            Generate Exam Questions
          </h1>
        </div>

        <Card ref={formRef}>
          <CardHeader>
            <CardTitle>Exam Settings</CardTitle>
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
              isLoading={generateQuestionsMutation.isPending}
              icon={Sparkles}
            >
              Generate Exam
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ExamGenerator;
