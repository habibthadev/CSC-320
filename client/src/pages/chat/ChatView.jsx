import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Send,
  FileText,
  MessageCircle,
  Bot,
  User,
  ArrowLeft,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Paperclip,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Check,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { Button } from "../../components/ui/Button";
import { Textarea } from "../../components/ui/Textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";
import { Avatar } from "../../components/ui/Avatar";
import { DropdownMenu } from "../../components/ui/DropdownMenu";
import MarkdownMessage from "../../components/ui/MarkdownMessage";
import StreamingMarkdown from "../../components/ui/StreamingMarkdown";
import { useDocument, useDocuments } from "../../hooks/useDocuments";
import {
  useChatWithDocument,
  useChatWithMultipleDocuments,
  useGeneralChat,
} from "../../hooks/useChat";
import { fadeIn } from "../../utils/animations";

const ChatView = () => {
  const { id } = useParams();
  const { data: document } = useDocument(id);
  const { data: documents = [] } = useDocuments();
  const chatWithDocumentMutation = useChatWithDocument();
  const chatWithMultipleMutation = useChatWithMultipleDocuments();
  const generalChatMutation = useGeneralChat();

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [expandedSources, setExpandedSources] = useState({});
  const [selectedDocumentId, setSelectedDocumentId] = useState(id || null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      try {
        fadeIn(chatContainerRef.current, 0.2);
      } catch (error) {
        console.warn("Animation error:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      try {
        messagesEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      } catch (error) {
        console.warn("Scroll error:", error);
      }
    }
  }, [messages, streamingMessage]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest(".dropdown-container")) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen && typeof window !== "undefined" && window.document) {
      window.document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      if (typeof window !== "undefined" && window.document) {
        window.document.removeEventListener("mousedown", handleClickOutside);
      }
    };
  }, [isDropdownOpen]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    const userMessage = {
      id: Date.now(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);
    setStreamingMessage("");

    const mutation = selectedDocumentId
      ? chatWithDocumentMutation
      : generalChatMutation;

    const conversationHistory = messages.map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.content,
    }));

    const params = selectedDocumentId
      ? {
          documentId: selectedDocumentId,
          query: inputMessage,
          conversationHistory,
        }
      : { query: inputMessage, conversationHistory };

    mutation.mutate(params, {
      onSuccess: (data) => {
        const response = data.response;
        let currentIndex = 0;

        const streamInterval = setInterval(() => {
          if (currentIndex < response.length) {
            const remainingText = response.slice(currentIndex);
            let chunkSize = 1;

            if (remainingText.match(/^[a-zA-Z0-9\s]/)) {
              chunkSize = Math.min(3, remainingText.length);
            } else if (remainingText.match(/^[*_`#]/)) {
              chunkSize = 1;
            } else {
              chunkSize = Math.min(2, remainingText.length);
            }

            const chunk = response.slice(0, currentIndex + chunkSize);
            setStreamingMessage(chunk);
            currentIndex += chunkSize;
          } else {
            clearInterval(streamInterval);

            const botMessage = {
              id: Date.now() + 1,
              content: response,
              sender: "bot",
              timestamp: new Date().toISOString(),
              sources: data.sources || [],
              hasWebSearch: data.hasWebSearch || false,
            };
            setMessages((prev) => [...prev, botMessage]);
            setIsTyping(false);
            setStreamingMessage("");
          }
        }, 50);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to send message");
        setIsTyping(false);
        setStreamingMessage("");
      },
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);

    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 128) + "px";
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const toggleSourceExpansion = (messageId, sourceIndex) => {
    const key = `${messageId}-${sourceIndex}`;
    setExpandedSources((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleDocumentSelect = (documentId) => {
    setSelectedDocumentId(documentId);
    setIsDropdownOpen(false);

    setMessages([]);
    toast.success(
      documentId
        ? `Switched to RAG mode with ${
            documents.find((d) => d._id === documentId)?.title
          }`
        : "Switched to general chat mode"
    );
  };

  const getCurrentSelectedDocument = () => {
    return documents.find((doc) => doc._id === selectedDocumentId);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 max-w-5xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to={id ? `/documents/${id}` : "/documents"}
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
                  {selectedDocumentId ? (
                    <FileText className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  ) : (
                    <MessageCircle className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  )}
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">
                    {selectedDocumentId
                      ? getCurrentSelectedDocument()?.title || "Document Chat"
                      : "AI Assistant"}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    {selectedDocumentId
                      ? getCurrentSelectedDocument()?.vectorized
                        ? "RAG Mode - Ready for questions"
                        : "RAG Mode - Processing..."
                      : "General Chat - Web access enabled"}
                  </p>
                </div>
              </div>
            </div>
            <Badge
              variant={selectedDocumentId ? "default" : "secondary"}
              className={
                selectedDocumentId
                  ? "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 border-teal-200 dark:border-teal-800"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800"
              }
            >
              {selectedDocumentId
                ? getCurrentSelectedDocument()?.vectorized
                  ? "RAG Mode"
                  : "Processing"
                : "General Chat"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="pb-32">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="py-6 space-y-6" ref={chatContainerRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-16 h-16 rounded-full bg-teal-50 dark:bg-teal-950 flex items-center justify-center mb-6">
                  <MessageCircle className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  {selectedDocumentId
                    ? "Ask about this document"
                    : "Start a conversation"}
                </h3>
                <p className="text-muted-foreground max-w-md mb-8">
                  {selectedDocumentId
                    ? `I can help you understand and analyze "${
                        getCurrentSelectedDocument()?.title
                      }". Ask me anything!`
                    : "I'm here to help with your questions and can search the web for current information. How can I assist you today?"}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                  {selectedDocumentId ? (
                    <>
                      <Button
                        variant="outline"
                        className="text-left justify-start h-auto p-4"
                        onClick={() =>
                          setInputMessage(
                            "What is the main topic of this document?"
                          )
                        }
                      >
                        <MessageCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>What's the main topic?</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="text-left justify-start h-auto p-4"
                        onClick={() =>
                          setInputMessage("Can you summarize the key points?")
                        }
                      >
                        <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>Summarize key points</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="text-left justify-start h-auto p-4"
                        onClick={() =>
                          setInputMessage(
                            "How can you help me with my documents?"
                          )
                        }
                      >
                        <MessageCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>How can you help?</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="text-left justify-start h-auto p-4"
                        onClick={() =>
                          setInputMessage(
                            "What types of documents can you analyze?"
                          )
                        }
                      >
                        <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>What can you analyze?</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div key={message.id} className="w-full">
                    {message.sender === "user" ? (
                      <div className="flex justify-end">
                        <div className="flex max-w-[80%] space-x-3 flex-row-reverse space-x-reverse">
                          <Avatar className="h-8 w-8 flex-shrink-0 bg-teal-100 dark:bg-teal-900">
                            <User className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                          </Avatar>
                          <div className="flex flex-col space-y-1 flex-1">
                            <div className="rounded-2xl px-4 py-3 bg-teal-600 text-white ml-12">
                              <MarkdownMessage
                                content={message.content}
                                className="prose-invert prose-sm max-w-none"
                              />
                            </div>
                            <div className="flex items-center gap-2 px-2 justify-end">
                              <span className="text-xs text-muted-foreground">
                                {formatTime(message.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full">
                        <div className="flex items-start space-x-3 w-full">
                          <Avatar className="h-8 w-8 flex-shrink-0 bg-muted">
                            <Bot className="h-4 w-4 text-muted-foreground" />
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <div className="w-full">
                              <MarkdownMessage
                                content={message.content}
                                className="prose-sm max-w-none dark:prose-invert"
                              />
                              {message.sources &&
                                message.sources.length > 0 && (
                                  <div className="mt-4 p-3 bg-muted/50 rounded-lg border-l-2 border-teal-500 max-w-full overflow-hidden">
                                    <p className="text-xs text-muted-foreground mb-2 font-medium">
                                      {message.hasWebSearch
                                        ? "Web Sources:"
                                        : "Document Sources:"}
                                    </p>
                                    <div className="space-y-2 max-w-full overflow-hidden">
                                      {message.sources.map((source, idx) => (
                                        <div
                                          key={idx}
                                          className="text-xs text-muted-foreground border border-border/50 rounded p-2 bg-background/50 overflow-hidden max-w-full"
                                        >
                                          {message.hasWebSearch ? (
                                            <div className="space-y-2">
                                              <div className="flex items-start justify-between">
                                                <p className="font-medium text-foreground mb-1 flex-1 mr-2">
                                                  {source.title?.length > 80
                                                    ? `${source.title.substring(
                                                        0,
                                                        80
                                                      )}...`
                                                    : source.title}
                                                </p>
                                                {(source.title?.length > 80 ||
                                                  source.url?.length > 60 ||
                                                  source.snippet?.length >
                                                    200) && (
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-4 w-4 p-0 flex-shrink-0"
                                                    onClick={() =>
                                                      toggleSourceExpansion(
                                                        message.id,
                                                        idx
                                                      )
                                                    }
                                                  >
                                                    {expandedSources[
                                                      `${message.id}-${idx}`
                                                    ] ? (
                                                      <ChevronUp className="h-3 w-3" />
                                                    ) : (
                                                      <ChevronDown className="h-3 w-3" />
                                                    )}
                                                  </Button>
                                                )}
                                              </div>

                                              {source.url && (
                                                <div className="break-all">
                                                  <a
                                                    href={source.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-teal-600 hover:text-teal-800 underline text-xs"
                                                    title={source.url}
                                                  >
                                                    {expandedSources[
                                                      `${message.id}-${idx}`
                                                    ] || source.url.length <= 60
                                                      ? source.url
                                                      : `${source.url.substring(
                                                          0,
                                                          60
                                                        )}...`}
                                                  </a>
                                                </div>
                                              )}

                                              {source.snippet && (
                                                <p className="mt-1 text-muted-foreground leading-relaxed break-words">
                                                  {expandedSources[
                                                    `${message.id}-${idx}`
                                                  ] ||
                                                  source.snippet.length <= 200
                                                    ? source.snippet
                                                    : `${source.snippet.substring(
                                                        0,
                                                        200
                                                      )}...`}
                                                </p>
                                              )}
                                            </div>
                                          ) : (
                                            <div className="space-y-2">
                                              <div className="flex items-start justify-between">
                                                <p className="font-medium text-foreground mb-1 flex-1 mr-2">
                                                  Source {source.id}:{" "}
                                                  {source.title?.length > 50
                                                    ? `${source.title.substring(
                                                        0,
                                                        50
                                                      )}...`
                                                    : source.title}
                                                </p>
                                                {(source.title?.length > 50 ||
                                                  source.content?.length >
                                                    150) && (
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-4 w-4 p-0 flex-shrink-0"
                                                    onClick={() =>
                                                      toggleSourceExpansion(
                                                        message.id,
                                                        idx
                                                      )
                                                    }
                                                  >
                                                    {expandedSources[
                                                      `${message.id}-${idx}`
                                                    ] ? (
                                                      <ChevronUp className="h-3 w-3" />
                                                    ) : (
                                                      <ChevronDown className="h-3 w-3" />
                                                    )}
                                                  </Button>
                                                )}
                                              </div>

                                              <p className="text-muted-foreground mb-1">
                                                Relevance:{" "}
                                                {(
                                                  source.similarity * 100
                                                ).toFixed(1)}
                                                %
                                              </p>

                                              <p className="text-muted-foreground italic break-words leading-relaxed">
                                                "
                                                {expandedSources[
                                                  `${message.id}-${idx}`
                                                ] ||
                                                source.content?.length <= 150
                                                  ? source.content
                                                  : `${source.content?.substring(
                                                      0,
                                                      150
                                                    )}...`}
                                                "
                                              </p>
                                              {source.startIndex !==
                                                undefined && (
                                                <p className="text-xs text-muted-foreground/70 mt-1">
                                                  Location: Characters{" "}
                                                  {source.startIndex}-
                                                  {source.endIndex}
                                                </p>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {formatTime(message.timestamp)}
                              </span>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-muted"
                                  onClick={() =>
                                    copyToClipboard(message.content)
                                  }
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-muted"
                                >
                                  <ThumbsUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-muted"
                                >
                                  <ThumbsDown className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="w-full">
                    <div className="flex items-start space-x-3 w-full">
                      <Avatar className="h-8 w-8 flex-shrink-0 bg-muted">
                        <Bot className="h-4 w-4 text-muted-foreground" />
                      </Avatar>
                      <div className="flex-1">
                        {streamingMessage ? (
                          <StreamingMarkdown
                            content={streamingMessage}
                            showCursor={true}
                            className="prose-sm max-w-none dark:prose-invert"
                          />
                        ) : (
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.1s]" />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-sm z-20">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <Textarea
                value={inputMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={`Ask me anything${
                  selectedDocumentId
                    ? ` about ${
                        getCurrentSelectedDocument()?.title || "this document"
                      }`
                    : " (with web search)"
                }...`}
                className="resize-none border-input bg-background text-foreground focus:border-teal-500 focus:ring-teal-500 rounded-2xl pr-20 min-h-[52px] max-h-32"
                rows={1}
                disabled={
                  chatWithDocumentMutation.isPending ||
                  chatWithMultipleMutation.isPending ||
                  generalChatMutation.isPending
                }
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <div className="relative dropdown-container">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 w-8 p-0 hover:bg-muted rounded-lg ${
                      selectedDocumentId ? "bg-teal-100 dark:bg-teal-900" : ""
                    }`}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <Paperclip
                      className={`h-4 w-4 ${
                        selectedDocumentId
                          ? "text-teal-600 dark:text-teal-400"
                          : ""
                      }`}
                    />
                  </Button>

                  {isDropdownOpen && (
                    <div className="absolute bottom-10 right-0 w-64 bg-background border border-border rounded-lg shadow-lg z-30 max-h-80 overflow-y-auto">
                      <div className="p-2">
                        <div className="flex items-center justify-between mb-2 px-2 py-1">
                          <span className="text-xs font-medium text-muted-foreground">
                            Mode Selection
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>

                        <div
                          className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted ${
                            !selectedDocumentId
                              ? "bg-teal-100 dark:bg-teal-900"
                              : ""
                          }`}
                          onClick={() => handleDocumentSelect(null)}
                        >
                          <div className="flex items-center justify-center w-6 h-6">
                            {!selectedDocumentId ? (
                              <Check className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                            ) : (
                              <MessageCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">General Chat</p>
                            <p className="text-xs text-muted-foreground">
                              AI assistant with web access
                            </p>
                          </div>
                        </div>

                        {documents.length > 0 && (
                          <>
                            <div className="border-t border-border my-2"></div>
                            <p className="text-xs font-medium text-muted-foreground px-2 mb-2">
                              RAG Mode - Select Document
                            </p>
                          </>
                        )}

                        {documents.length > 0 ? (
                          documents.map((doc) => (
                            <div
                              key={doc._id}
                              className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted ${
                                selectedDocumentId === doc._id
                                  ? "bg-teal-100 dark:bg-teal-900"
                                  : ""
                              }`}
                              onClick={() => handleDocumentSelect(doc._id)}
                            >
                              <div className="flex items-center justify-center w-6 h-6">
                                {selectedDocumentId === doc._id ? (
                                  <Check className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                ) : (
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {doc.title}
                                </p>
                                <div className="flex items-center gap-2">
                                  <p className="text-xs text-muted-foreground">
                                    {doc.fileType?.toUpperCase() || "DOC"}
                                  </p>
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      doc.vectorized
                                        ? "bg-green-500"
                                        : "bg-yellow-500"
                                    }`}
                                  ></div>
                                  <p className="text-xs text-muted-foreground">
                                    {doc.vectorized ? "Ready" : "Processing"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-2 text-center">
                            <p className="text-sm text-muted-foreground">
                              No documents uploaded
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Upload documents to enable RAG mode
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={
                    !inputMessage.trim() ||
                    chatWithDocumentMutation.isPending ||
                    chatWithMultipleMutation.isPending ||
                    generalChatMutation.isPending
                  }
                  size="sm"
                  className="h-8 w-8 p-0 bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-500 dark:hover:bg-teal-600 rounded-lg"
                >
                  {chatWithDocumentMutation.isPending ||
                  chatWithMultipleMutation.isPending ||
                  generalChatMutation.isPending ? (
                    <Spinner className="h-3 w-3" />
                  ) : (
                    <Send className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            AI can make mistakes. Please verify important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
