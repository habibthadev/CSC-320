import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Sparkles,
  Clock,
  BookOpen,
  Search,
  Filter,
  Grid,
  List as ListIcon,
  ChevronRight,
  Zap,
  Target,
  Badge as BadgeIcon,
} from "lucide-react";

import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
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
import { Select } from "../../components/ui/Select";
import { useDocuments } from "../../hooks/useDocuments";
import { cn } from "../../lib/utils";

const QuestionGeneratorList = () => {
  const navigate = useNavigate();
  const { data: documents = [], isLoading } = useDocuments();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState("grid");
  const [filterType, setFilterType] = useState("all");

  const filteredDocuments = documents
    .filter((doc) => {
      const matchesSearch = doc.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterType === "all" ||
        (filterType === "vectorized" && doc.vectorized) ||
        (filterType === "processing" && !doc.vectorized);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "alphabetical":
          return a.title.localeCompare(b.title);
        case "type":
          return (a.fileType || "").localeCompare(b.fileType || "");
        default:
          return 0;
      }
    });

  const vectorizedDocuments = filteredDocuments.filter((doc) => doc.vectorized);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Spinner className="h-8 w-8" />
          <p className="text-muted-foreground">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/documents")}
          className="flex justify-start h-8 p-2 mb-2"
        >
          <ArrowLeft className="h-5 w-5" />{" "}
          <span className="text-muted-foreground text-lg ml-2">Back to documents</span>
        </Button>
        <div className="flex items-center gap-4 mb-8">
          {/* <Link
            to="/documents"
            className="h-8 w-8 p-0 rounded-md hover:bg-muted flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link> */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Generate Exam Questions
            </h1>
            <p className="text-muted-foreground">
              Select a document to create custom exam questions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-md">
                  <FileText className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {documents.length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total Documents
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-md">
                  <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {vectorizedDocuments.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Ready to Use</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-md">
                  <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {filteredDocuments.length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Filtered Results
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-md">
                  <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">∞</p>
                  <p className="text-sm text-muted-foreground">
                    Questions Possible
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Find Documents
            </CardTitle>
            <CardDescription>
              Search and filter your documents to generate questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {searchTerm || filterType !== "all"
                    ? "No matching documents"
                    : "No documents available"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || filterType !== "all"
                    ? "Try adjusting your search terms or filters"
                    : "Upload documents to start generating exam questions"}
                </p>
                <Button onClick={() => navigate("/documents/upload")}>
                  <FileText className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            )}
          >
            {filteredDocuments.map((document) => (
              <Card
                key={document._id}
                className={cn(
                  "group cursor-pointer transition-all duration-200 hover:shadow-lg border-border",
                  document.vectorized
                    ? "hover:border-teal-200 dark:hover:border-teal-800"
                    : "hover:border-yellow-200 dark:hover:border-yellow-800",
                  viewMode === "list" && "flex"
                )}
                onClick={() => {
                  if (document.vectorized) {
                    navigate(`/generate/${document._id}`);
                  }
                }}
              >
                <CardHeader
                  className={cn(viewMode === "list" && "flex-none w-1/3 pb-2")}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={cn(
                        "flex items-center gap-2",
                        viewMode === "list" && "flex-col items-start gap-1"
                      )}
                    >
                      <div
                        className={cn(
                          "p-2 rounded-md",
                          document.vectorized
                            ? "bg-teal-100 dark:bg-teal-900"
                            : "bg-yellow-100 dark:bg-yellow-900"
                        )}
                      >
                        <FileText
                          className={cn(
                            "h-5 w-5",
                            document.vectorized
                              ? "text-teal-600 dark:text-teal-400"
                              : "text-yellow-600 dark:text-yellow-400"
                          )}
                        />
                      </div>
                      {viewMode === "list" && (
                        <Badge
                          variant={
                            document.vectorized ? "default" : "secondary"
                          }
                          className={cn(
                            document.vectorized
                              ? "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          )}
                        >
                          {document.vectorized ? "Ready" : "Processing"}
                        </Badge>
                      )}
                    </div>
                    {viewMode === "grid" && (
                      <Badge
                        variant={document.vectorized ? "default" : "secondary"}
                        className={cn(
                          document.vectorized
                            ? "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        )}
                      >
                        {document.vectorized ? "Ready" : "Processing"}
                      </Badge>
                    )}
                  </div>
                  <CardTitle
                    className={cn(
                      "text-lg line-clamp-2 text-foreground",
                      viewMode === "list" && "text-base"
                    )}
                  >
                    {document.title}
                  </CardTitle>
                  {viewMode === "grid" && (
                    <CardDescription className="line-clamp-2">
                      {document.description ||
                        "Generate custom exam questions from this document"}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent
                  className={cn(
                    "pt-0",
                    viewMode === "list" && "flex-1 flex items-center"
                  )}
                >
                  <div
                    className={cn(
                      "space-y-2",
                      viewMode === "list" &&
                        "flex items-center justify-between w-full"
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-start flex-col gap-4 text-sm text-muted-foreground",
                        viewMode === "list" && "gap-6"
                      )}
                    >
                      <div className="flex items-center gap-1">
                        <BadgeIcon className="h-3 w-3 shrink-0" />
                        <span>{document.fileType?.toUpperCase() || "DOC"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(document.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {viewMode === "list" && document.vectorized && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Generate Questions
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>

                {viewMode === "grid" && (
                  <CardFooter className="pt-0">
                    <Button
                      className="w-full"
                      disabled={!document.vectorized}
                      variant={document.vectorized ? "default" : "secondary"}
                    >
                      {document.vectorized ? (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Questions
                        </>
                      ) : (
                        <>
                          <Clock className="mr-2 h-4 w-4" />
                          Processing Document
                        </>
                      )}
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        )}

        {vectorizedDocuments.length > 0 && (
          <Card className="mt-8 bg-teal-50 dark:bg-teal-950 border-teal-200 dark:border-teal-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-teal-800 dark:text-teal-200">
                <BookOpen className="h-5 w-5" />
                Quick Start Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-teal-700 dark:text-teal-300">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 flex-shrink-0" />
                <p className="text-sm">
                  <strong>Ready documents</strong> can generate questions
                  immediately
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 flex-shrink-0" />
                <p className="text-sm">
                  <strong>Processing documents</strong> need a few minutes to be
                  ready
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 flex-shrink-0" />
                <p className="text-sm">
                  <strong>Customize difficulty</strong> and question count for
                  better results
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default QuestionGeneratorList;
