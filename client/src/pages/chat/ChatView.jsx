import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Send, FileText, MessageCircle, Bot, User } from "lucide-react";
import { toast } from "react-hot-toast";

import Button from "../../components/ui/Button";
import Textarea from "../../components/ui/Textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";
import { useDocument } from "../../hooks/useDocuments";
import {
  useChatWithDocument,
  useChatWithMultipleDocuments,
  useGeneralChat,
} from "../../hooks/useChat";
import { fadeIn } from "../../utils/animations";

const ChatView = () => {
  const { id } = useParams();
  const { data: document } = useDocument(id);
  const chatWithDocumentMutation = useChatWithDocument();
  const chatWithMultipleMutation = useChatWithMultipleDocuments();
  const generalChatMutation = useGeneralChat();

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      fadeIn(chatContainerRef.current, 0.2);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

    const mutation = id ? chatWithDocumentMutation : generalChatMutation;
    const params = id
      ? { documentId: id, query: inputMessage }
      : { query: inputMessage };

    mutation.mutate(params, {
      onSuccess: (data) => {
        const botMessage = {
          id: Date.now() + 1,
          content: data.response,
          sender: "bot",
          timestamp: new Date().toISOString(),
          sources: data.sources || [],
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to send message");
        setIsTyping(false);
      },
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div ref={chatContainerRef} className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {id
              ? `Chat with ${document?.title || "Document"}`
              : "Chat with Documents"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {id
              ? "Ask questions about this document and get instant answers"
              : "Ask questions about your documents and get instant answers"}
          </p>
        </div>

        {id && document && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Document Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {document.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {document.fileType} • {Math.round(document.fileSize / 1024)}{" "}
                    KB
                  </p>
                </div>
                <Badge variant={document.vectorized ? "success" : "warning"}>
                  {document.vectorized ? "Ready for Chat" : "Processing..."}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="min-h-[500px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              Chat Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-96">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 dark:text-gray-600 mb-4">
                    <MessageCircle className="h-12 w-12 mx-auto" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Start a conversation by asking a question about{" "}
                    {id ? "this document" : "your documents"}
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender === "user"
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.sender === "bot" && (
                            <Bot className="h-4 w-4 mt-1 flex-shrink-0" />
                          )}
                          {message.sender === "user" && (
                            <User className="h-4 w-4 mt-1 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm leading-relaxed">
                              {message.content}
                            </p>
                            {message.sources && message.sources.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-xs opacity-75 mb-1">
                                  Sources:
                                </p>
                                <div className="space-y-1">
                                  {message.sources.map((source, idx) => (
                                    <p key={idx} className="text-xs opacity-75">
                                      • {source}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}
                            <p className="text-xs opacity-75 mt-1">
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 max-w-[70%]">
                        <div className="flex items-center space-x-2">
                          <Bot className="h-4 w-4" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Ask a question about ${
                      id ? "this document" : "your documents"
                    }...`}
                    className="min-h-[80px] resize-none"
                    disabled={
                      chatWithDocumentMutation.isPending ||
                      chatWithMultipleMutation.isPending
                    }
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <Button
                    onClick={handleSendMessage}
                    disabled={
                      !inputMessage.trim() ||
                      chatWithDocumentMutation.isPending ||
                      chatWithMultipleMutation.isPending
                    }
                    icon={Send}
                    size="lg"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatView;
