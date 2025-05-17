import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  FileText,
  Bot,
  Trash2,
  FileDown,
  Loader,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { usePDF } from "react-to-pdf";
import Button from "../../components/ui/Button";
import Textarea from "../../components/ui/Textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import useDocumentStore from "../../stores/documentStore";
import useRagStore from "../../stores/ragStore";
import { formatDate } from "../../utils/fileUtils";
import { fadeIn, slideInRight, slideInLeft } from "../../utils/animations";

const ChatView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getDocumentById,
    currentDocument,
    isLoading: documentLoading,
  } = useDocumentStore();
  const { chatHistory, chatWithDocument, clearChatHistory, isLoading } =
    useRagStore();
  const [query, setQuery] = useState("");
  const [showClearModal, setShowClearModal] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const [pendingMessage, setPendingMessage] = useState(null);
  const [responseError, setResponseError] = useState(false);

  const { toPDF, targetRef } = usePDF({
    filename: `Chat_${
      currentDocument ? currentDocument.title.replace(/\s+/g, "_") : "History"
    }.pdf`,
  });

  useEffect(() => {
    if (id) {
      getDocumentById(id);
    }
  }, [id, getDocumentById]);

  useEffect(() => {
    if (chatContainerRef.current) {
      fadeIn(chatContainerRef.current, 0.2);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, pendingMessage]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!query.trim() || isLoading) return;

      const trimmedQuery = query.trim();
      setQuery("");

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      // Create pending message
      const timestamp = new Date().toISOString();
      setPendingMessage({
        query: trimmedQuery,
        timestamp,
      });
      setResponseError(false);

      if (id) {
        try {
          await chatWithDocument(id, trimmedQuery);
          setPendingMessage(null);
        } catch (error) {
          console.error("Error in chat:", error);
          setResponseError(true);
          toast.error("Failed to get a response. Please try again.");
        }
      } else {
        toast.error("Please select a document to chat with");
        setPendingMessage(null);
      }
    },
    [query, isLoading, id, chatWithDocument]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    },
    [handleSubmit]
  );

  const handleClearChat = () => {
    clearChatHistory();
    setShowClearModal(false);
    setPendingMessage(null);
    setResponseError(false);
    toast.success("Chat history cleared");
  };

  const handleExportPdf = async () => {
    if (!filteredChatHistory.length) return;

    try {
      toPDF();
      toast.success("Chat exported as PDF successfully");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF");
    }
  };

  // Only adjust textarea height on input event, not on every query state change
  const handleTextareaInput = (e) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
    setQuery(e.target.value);
  };

  // Memoize filteredChatHistory to prevent unnecessary re-renders
  const filteredChatHistory = useMemo(() => {
    return id && chatHistory[id] ? chatHistory[id] : [];
  }, [id, chatHistory]);

  const renderEmptyState = useMemo(
    () => (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <Bot className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
          Start a conversation
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          Ask questions about your document and I'll provide answers based on
          its content.
        </p>
      </div>
    ),
    []
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto" ref={targetRef}>
        <div className="flex items-start md:items-center justify-between gap-2 mb-6 flex-col md:flex-row">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/documents")}
              icon={ArrowLeft}
              className="mr-4 flex-shrink-0"
            >
              {/* Back */}
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
              {/* {currentDocument
                ? `Chat with: ${currentDocument.title}`
                : "Document Chat"} */}
              Chat With Document
            </h1>
          </div>
          <div className="flex space-x-2">
            {filteredChatHistory.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPdf}
                  icon={FileDown}
                >
                  Export PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowClearModal(true)}
                  icon={Trash2}
                >
                  Clear Chat
                </Button>
              </>
            )}
          </div>
        </div>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-orange-500 flex-shrink-0" />
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {documentLoading
                  ? "Loading..."
                  : currentDocument
                  ? currentDocument.title
                  : "Select a Document"}
              </p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              {currentDocument
                ? "Ask questions about this document and get AI-powered answers based on its content."
                : "Please select a document to start chatting."}
            </p>
          </CardContent>
        </Card>

        <div
          ref={chatContainerRef}
          className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm mb-4 min-h-[400px] flex flex-col"
        >
          <div className="flex-1 p-4 overflow-y-auto max-h-[600px]">
            {filteredChatHistory.length === 0 && !pendingMessage ? (
              renderEmptyState
            ) : (
              <div className="space-y-6">
                {filteredChatHistory.map((message, index) => (
                  <div key={index} className="space-y-6">
                    <div
                      className="flex items-start"
                      // ref={index === 0 ? (el) => slideInRight(el, 0.2) : null}
                    >
                      <Avatar
                        fallback="U"
                        className="mr-3 bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300"
                      />
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <span className="font-medium text-gray-900 dark:text-white mr-2">
                            You
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(message.timestamp)}
                          </span>
                        </div>
                        <div className="bg-orange-50 dark:bg-gray-800 p-3 rounded-lg text-gray-800 dark:text-gray-200">
                          {message.query}
                        </div>
                      </div>
                    </div>

                    <div
                      className="flex items-start"
                      // ref={index === 0 ? (el) => slideInLeft(el, 0.3) : null}
                    >
                      <Avatar
                        fallback="AI"
                        className="mr-3 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                      />
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <span className="font-medium text-gray-900 dark:text-white mr-2">
                            AI Assistant
                          </span>
                          <Badge variant="secondary" size="sm">
                            RAG
                          </Badge>
                        </div>
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3 rounded-lg text-gray-800 dark:text-gray-200">
                          {message.response}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pending Message */}
                {pendingMessage && (
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <Avatar
                        fallback="U"
                        className="mr-3 bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300"
                      />
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <span className="font-medium text-gray-900 dark:text-white mr-2">
                            You
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(pendingMessage.timestamp)}
                          </span>
                        </div>
                        <div className="bg-orange-50 dark:bg-gray-800 p-3 rounded-lg text-gray-800 dark:text-gray-200">
                          {pendingMessage.query}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Avatar
                        fallback="AI"
                        className="mr-3 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                      />
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <span className="font-medium text-gray-900 dark:text-white mr-2">
                            AI Assistant
                          </span>
                          <Badge variant="secondary" size="sm">
                            RAG
                          </Badge>
                        </div>
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3 rounded-lg text-gray-800 dark:text-gray-200">
                          {responseError ? (
                            <div className="text-red-500">
                              Error retrieving response. Please try again.
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Loader className="h-4 w-4 animate-spin" />
                              <span>Generating response...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 p-4">
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={query}
                  onChange={handleTextareaInput}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question about the document..."
                  className="min-h-[60px] max-h-[200px] resize-none pr-12"
                  disabled={isLoading || !currentDocument}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-2 bottom-2 h-8 w-8"
                  disabled={isLoading || !query.trim() || !currentDocument}
                >
                  {isLoading ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Responses are generated based on the content of your document using
          RAG technology.
        </p>
      </div>

      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Clear Chat History"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to clear the chat history? This action cannot
            be undone.
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowClearModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleClearChat}>
              Clear History
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChatView;
