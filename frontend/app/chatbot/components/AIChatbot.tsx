"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";
import {
  Fish,
  ArrowLeftRight,
  LineChart,
  Newspaper,
  Send,
  Copy,
  Volume2,
  RefreshCw,
  Globe,
  Mic,
  Bot,
  Brain,
  Pencil,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams, useParams } from "next/navigation";
import { useChatStore } from "../store";
import { Message as BaseMessage } from "@/types/chat";
import ThinkingMessage from "./ThinkingMessage";
import { sendChatMessage } from "../service";
import { ChatSwapInterface } from "./ChatSwapInterface/index";
import type { Message, SwapMessageContent } from "@/types/chat";
import { TransactionCard } from "./TransactionCard";

// Define local types to avoid dependency on @elizaos/core
type UUID = string;
type Content = {
  text: string;
  attachments?: Array<{
    url: string;
    contentType: string;
    title: string;
  }>;
};

import { apiClient } from "@/app/lib/chat";

import {
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { toast, useToast } from "@/hooks/use-toast";
import { NewsTickerWidget } from "./NewsTickerWidget";
import { ThinkingDots } from "@/components/ui/thinking-dots";
import { useWalletClient, usePublicClient } from "wagmi";
import { parseEther } from "viem";
import { unPinFromIPFS } from "@/app/lib/pinata";

// Map of icon components
const icons = {
  Fish,
  ArrowLeftRight,
  LineChart,
  Newspaper,
};

interface ActionType {
  iconName: keyof typeof icons;
  label: string;
  prompt: string;
}

interface IAttachment {
  url: string;
  contentType: string;
  title: string;
}
type News = {
  author: string;
  content: string;
  description: string;
  publishedAt: string;
  source: { id: null; name: string };
  title: string;
  url: string;
  urlToImage: string;
};

type ExtraContentFields = {
  user: string;
  createdAt: number;
  isLoading?: boolean;
  data?: {
    articles: News[];
  };
  walletId?: string;
  transaction?: Transaction[];
};

// Export the Transaction type
export type Transaction = {
  to: string;
  data: string;
  value: string;
  estimatedOutput?: string;
  tokenDetails?: TokenDetails;
  transactionType: "swap" | "buy" | "create" | "approve";
  gas?: string;
  nonce?: string;
  chainId?: string;
};

type TokenDetails = {
  name: string;
  symbol: string;
  description: string;
  imageURI: string;
  metadataURI: string;
};

type ContentWithUser = Content & ExtraContentFields;

function AIChatbotContent() {
  const agentId: UUID = "c3bd776c-4465-037f-9c7a-bf94dfba78d9";
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(
    null
  );
  const [editingContent, setEditingContent] = useState("");
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const [showSwapInterface, setShowSwapInterface] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [userWalletId, setUserWalletId] = useState<string | null>(null);

  useEffect(() => {
    // This code only runs on the client side
    const storedWalletId = localStorage.getItem("userAddress");
    setUserWalletId(storedWalletId);
  }, []);

  console.log("user wallet ID", userWalletId);

  // Type guard for SwapMessageContent
  const isSwapContent = (content: any): content is SwapMessageContent =>
    typeof content === "object" && content.type === "swap";

  const queryClient = useQueryClient();

  const messages =
    queryClient.getQueryData<ContentWithUser[]>(["messages", agentId]) || [];

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input) return;

    setHasInteracted(true);

    const attachments: IAttachment[] | undefined = selectedFile
      ? [
          {
            url: URL.createObjectURL(selectedFile),
            contentType: selectedFile.type,
            title: selectedFile.name,
          },
        ]
      : undefined;

    const userMessage = {
      text: input,
      user: "user",
      createdAt: Date.now(),
      attachments,
      userWalletId,
    };

    const thinkingMessage = {
      text: "Cooking up my response...",
      user: "Sage",
      createdAt: Date.now() + 1,
      isLoading: true,
    };

    queryClient.setQueryData(
      ["messages", agentId],
      (old: ContentWithUser[] = []) => [...old, userMessage, thinkingMessage]
    );

    sendMessageMutation.mutate({
      message: input,
      selectedFile: selectedFile ? selectedFile : null,
    });

    setSelectedFile(null);
    setInput("");
    formRef.current?.reset();
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const sendMessageMutation = useMutation({
    mutationKey: ["send_message", agentId],
    mutationFn: ({
      message,
      selectedFile,
    }: {
      message: string;
      selectedFile?: File | null;
    }) => apiClient.sendMessage(agentId, message, selectedFile, userWalletId),
    onSuccess: (newMessages: ContentWithUser[]) => {
      queryClient.setQueryData(
        ["messages", agentId],
        (old: ContentWithUser[] = []) => [
          ...old.filter((msg) => !msg.isLoading),
          ...newMessages.map((msg) => ({
            ...msg,
            createdAt: Date.now(),
          })),
        ]
      );
    },
    onError: (e) => {
      // Remove the thinking message on error
      queryClient.setQueryData(
        ["messages", agentId],
        (old: ContentWithUser[] = []) => old.filter((msg) => !msg.isLoading)
      );

      // Add an error message
      const errorMessage = {
        text: `Sorry, I encountered an error: ${e.message}. Please try again.`,
        user: "Sage",
        createdAt: Date.now(),
      };

      queryClient.setQueryData(
        ["messages", agentId],
        (old: ContentWithUser[] = []) => [...old, errorMessage]
      );

      toast({
        variant: "destructive",
        title: "Unable to send message",
        description: e.message,
      });
    },
  });

  // Check if we need to start a new chat
  useEffect(() => {
    if (searchParams.get("new") === "true") {
      startNewChat();
    }
  }, [searchParams.get("new"), searchParams.get("t")]);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (input.length > 0) {
      scrollToBottom();
    }
  }, [input, scrollToBottom]);

  const handleSwapComplete = (
    fromAmount: string,
    fromToken: string,
    toAmount: string,
    toToken: string
  ) => {
    // Add a success message to the chat
    const successMessage = {
      text: `✅ Successfully swapped ${fromAmount} ${fromToken} to ${toAmount} ${toToken}`,
      user: "assistant",
      createdAt: Date.now(),
    };

    queryClient.setQueryData(
      ["messages", agentId],
      (old: ContentWithUser[] = []) => [...old, successMessage]
    );

    setShowSwapInterface(false);
  };

  // Function to start a new chat
  const startNewChat = () => {
    queryClient.setQueryData(["messages", agentId], []);
    setInput("");
    setHasInteracted(false);
  };

  const handleCopy = (content: string | SwapMessageContent) => {
    if (typeof content === "string") {
      navigator.clipboard.writeText(content);
      toast({
        title: "Copied to clipboard",
        duration: 2000,
      });
    }
  };

  const handleSpeak = (content: string | SwapMessageContent) => {
    if (typeof content === "string") {
      const utterance = new SpeechSynthesisUtterance(content);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleEdit = (index: number, message: ContentWithUser) => {
    setEditingMessageIndex(index);
    if (typeof message.text === "string") {
      setEditingContent(message.text);
    }
  };

  const handleSaveEdit = () => {
    if (editingMessageIndex === null) return;

    // Update the message in the store
    queryClient.setQueryData(
      ["messages", agentId],
      (old: ContentWithUser[] = []) =>
        old.map((msg, idx) =>
          idx === editingMessageIndex ? { ...msg, text: editingContent } : msg
        )
    );

    setEditingMessageIndex(null);
    setEditingContent("");
  };

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result) => result.transcript)
        .join("");

      setInput(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setInput(`Uploaded file: ${file.name}`);
    }
  };

  const handleRegenerate = async (index: number) => {
    // Get the previous user message
    const previousUserMessage = messages
      .slice(0, index)
      .reverse()
      .find((m) => m.user === "user");

    if (!previousUserMessage) return;

    // Remove the bot message and all messages after it
    const newMessages = messages.slice(0, index);

    // Update the store with the new messages
    queryClient.setQueryData(["messages", agentId], newMessages);

    // Add thinking message
    const thinkingMessage = {
      text: "Cooking up my response...",
      user: "Sage",
      createdAt: Date.now(),
      isLoading: true,
    };

    queryClient.setQueryData(
      ["messages", agentId],
      (old: ContentWithUser[] = []) => [...old, thinkingMessage]
    );

    // Regenerate response
    sendMessageMutation.mutate({
      message: previousUserMessage.text,
      selectedFile: null,
    });
  };

  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const handleTransactionSubmit = async (transaction: Transaction) => {
    if (!walletClient) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return { error: new Error("Wallet not connected") };
    }

    if (!publicClient) {
      toast({
        title: "Error",
        description: "Network client not available",
        variant: "destructive",
      });
      return { error: new Error("Network client not available") };
    }

    // Format the transaction data
    const formattedTx = {
      to: transaction.to as `0x${string}`,
      data: transaction.data as `0x${string}`,
      value: BigInt(transaction.value || "0"),
      ...(transaction.gas ? { gas: BigInt(transaction.gas) } : {}),
      ...(transaction.nonce ? { nonce: Number(transaction.nonce) } : {}),
      ...(transaction.chainId ? { chainId: Number(transaction.chainId) } : {}),
    };

    try {
      // Send the transaction
      const hash = await walletClient.sendTransaction(formattedTx);

      // Wait for transaction confirmation with timeout
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Transaction confirmation timeout"));
        }, 30000);

        const checkReceipt = async () => {
          try {
            const receipt = await publicClient.getTransactionReceipt({ hash });
            if (receipt) {
              if (receipt.status === "success") {
                clearTimeout(timeout);
                resolve(receipt);
              } else {
                clearTimeout(timeout);
                reject(new Error("Transaction failed"));
              }
            } else {
              setTimeout(checkReceipt, 2000);
            }
          } catch (error) {
            setTimeout(checkReceipt, 2000);
          }
        };
        checkReceipt();
      });

      return { hash };
    } catch (error: any) {
      console.error("Transaction error:", error);

      // Handle user rejection specifically
      if (
        error.message.includes("rejected") ||
        error.message.includes("denied") ||
        error.code === 4001 // MetaMask rejection code
      ) {
        toast({
          title: "Transaction Cancelled",
          description: "You cancelled the transaction",
          variant: "destructive",
        });
        return { error: new Error("Transaction cancelled by user") };
      }

      // Handle other errors
      toast({
        title: "Transaction Failed",
        description: error.message || "Transaction failed",
        variant: "destructive",
      });
      return { error };
    }
  };

  const renderMessageContent = (message: ContentWithUser) => {
    console.log("Rendering message", message);
    if (message.data) {
      return (
        <div className="w-full">
          <NewsTickerWidget news={message.data.articles} />
        </div>
      );
    }

    if (message.transaction) {
      console.log("message.transaction", message.transaction);
      // Check if this is a token swap (approve + swap)
      if (
        message.transaction.length === 2 &&
        message.transaction[0].transactionType === "approve" &&
        message.transaction[1].transactionType === "swap"
      ) {
        const approveTransaction = message.transaction[0];
        const swapTransaction = message.transaction[1];
        console.log("approveTransaction", approveTransaction);
        console.log("swapTransaction", swapTransaction);
        // For token swaps, show one card but handle both transactions
        return (
          <TransactionCard
            key={message.createdAt}
            transaction={message.transaction[1]} // Show the swap details
            onSubmit={async () => {
              // First do the approval
              const approveResult = await handleTransactionSubmit(
                approveTransaction
              );
              if (approveResult.error) {
                return approveResult;
              }

              // If approval was successful, do the swap
              const swapResult = await handleTransactionSubmit(swapTransaction);
              return swapResult;
            }}
          />
        );
      }

      // For other cases (single transaction)
      if (message.transaction.length === 1) {
        const transaction = message.transaction[0]; //create
        if (message.transaction[0].transactionType === "create") {
          return (
            <TransactionCard
              key={message.createdAt}
              transaction={transaction}
              onSubmit={async () => {
                const createResult = await handleTransactionSubmit(transaction);
                if (createResult.error && transaction.tokenDetails) {
                  unPinFromIPFS(
                    transaction.tokenDetails.imageURI,
                    transaction.tokenDetails.metadataURI
                  );
                }
                return createResult;
              }}
            />
          );
        } else {
          // swap or buy
          return (
            <TransactionCard
              key={message.createdAt}
              transaction={transaction}
              onSubmit={() => handleTransactionSubmit(transaction)}
            />
          );
        }
      }
    }

    // Default text rendering
    return (
      <div className="prose prose-invert">
        <ReactMarkdown>{message.text}</ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="ml-10 mr-10 mx-auto flex flex-col h-[calc(100vh-5rem)] max-h-[calc(100vh-5rem)] pt-12">
      {!hasInteracted && (
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-primary/10">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">
            CaffiFi{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-yellow-600">
              Bot
            </span>
          </h1>
        </div>
      )}

      {/* Chat Area */}
      {messages.map((message, index) => {
        const isBot = message.user === "Sage" || message.data;
        return (
          <div
            key={index}
            className={cn(
              "flex gap-3",
              isBot ? "items-start" : "items-start flex-row-reverse"
            )}
          >
            <Avatar>
              {isBot ? (
                <>
                  <AvatarImage src="https://example.com/bot-meme-avatar.png" />
                  <AvatarFallback>
                    <Bot className="w-5 h-5" />
                  </AvatarFallback>
                </>
              ) : (
                <>
                  <AvatarImage src="https://example.com/user-meme-avatar.png" />
                  <AvatarFallback>U</AvatarFallback>
                </>
              )}
            </Avatar>
            <div
              className={cn(
                "flex flex-col gap-2",
                isBot ? "items-start" : "items-end"
              )}
            >
              {editingMessageIndex === index ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="min-w-[300px]"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleSaveEdit}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingMessageIndex(null)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div
                  className={cn(
                    "rounded-lg px-4 py-2 max-w-[80%]",
                    isBot
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  {isBot ? (
                    message.isLoading ? (
                      <ThinkingMessage />
                    ) : (
                      <div className="text-sm whitespace-pre-wrap">
                        {renderMessageContent(message)}
                      </div>
                    )
                  ) : (
                    <div className="text-sm whitespace-pre-wrap">
                      {renderMessageContent(message)}
                    </div>
                  )}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="flex items-center gap-2 p-2 mt-2 rounded bg-background/10">
                      <Plus className="w-4 h-4" />
                      <a
                        href={message.attachments[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm underline"
                      >
                        {message.attachments[0].title}
                      </a>
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
                {isBot ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6"
                      onClick={() => handleCopy(message.text)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6"
                      onClick={() => handleSpeak(message.text)}
                    >
                      <Volume2 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6"
                      onClick={() => handleRegenerate(index)}
                    >
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6"
                      onClick={() => handleCopy(message.text)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6"
                      onClick={() => handleEdit(index, message)}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />

      {/* Input Area */}
      <div className="pt-4 mt-auto">
        <form ref={formRef} onSubmit={handleSendMessage} className="relative">
          <div className="relative flex items-center">
            <div className="absolute flex items-center gap-2 left-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="w-8 h-8"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus className="w-4 h-4" />
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="w-8 h-8"
              >
                <Globe className="w-4 h-4" />
              </Button>
            </div>
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  formRef.current?.requestSubmit();
                }
              }}
              placeholder="Ask me anything..."
              className="pl-20 pr-24"
            />
            <div className="absolute flex items-center gap-2 right-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", isListening && "text-red-500")}
                onClick={handleVoiceInput}
              >
                <Mic className="w-4 h-4" />
              </Button>
              <Button
                type="submit"
                size="icon"
                className="w-8 h-8"
                disabled={!input.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Export the main component with Suspense
export default function AIChatbot() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <ThinkingDots />
        </div>
      }
    >
      <AIChatbotContent />
    </Suspense>
  );
}
