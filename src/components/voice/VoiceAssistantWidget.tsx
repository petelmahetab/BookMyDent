"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { Card } from "../ui/card";
import Image from "next/image";
import { Button } from "../ui/button";

function VoiceAssistantWidget() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const { user, isLoaded } = useUser();
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll for messages
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Check browser support and API key on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
        setError("⚠️ Speech recognition not supported. Please use Chrome, Edge, or Safari.");
      }
      if (!("speechSynthesis" in window)) {
        setError("⚠️ Speech synthesis not supported in this browser.");
      }

      // Check if API key is configured
      if (!process.env.NEXT_PUBLIC_GROQ_API_KEY) {
        setError("⚠️ GROQ API key not found. Please add NEXT_PUBLIC_GROQ_API_KEY to your .env.local file");
      } else if (!process.env.NEXT_PUBLIC_GROQ_API_KEY.startsWith('gsk_')) {
        setError("⚠️ Invalid GROQ API key format. Key should start with 'gsk_'");
      }
    }
  }, []);

  // Initialize speech recognition
  const initRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true; // Show interim results for feedback
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError("");
      console.log("🎤 Listening started...");

      // Start countdown from 3
      let count = 3;
      setCountdown(count);
      const timer = setInterval(() => {
        count--;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(timer);
          setCountdown(null);
        }
      }, 1000);
    };

    recognition.onresult = async (event: any) => {
      const lastResult = event.results[event.results.length - 1];
      const transcript = lastResult[0].transcript;

      // Only process if this is a final result
      if (lastResult.isFinal) {
        console.log("📝 Final transcript:", transcript);

        // Add user message
        setMessages((prev) => [...prev, { role: "user", content: transcript }]);

        // Stop listening while processing
        recognition.stop();
        setIsListening(false);

        // Get AI response from Groq
        await getGroqResponse(transcript);
      } else {
        // Show interim results for user feedback
        console.log("🎤 Listening... (interim):", transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("❌ Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        setError("🎤 Microphone access denied. Please allow microphone permissions.");
      } else if (event.error === "no-speech") {
        setError("🔇 No speech detected. Please speak within 3 seconds of clicking 'Start Talking'.");
      } else if (event.error === "aborted") {
        console.log("Speech recognition aborted (this is normal)");
        // Don't show error for aborted - it happens when we manually stop
      } else {
        setError(`Error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log("🎤 Listening ended");
    };

    return recognition;
  };

  // Get AI response from Groq (FREE API)
  const getGroqResponse = async (userMessage: string) => {
    setIsProcessing(true);

    try {
      console.log("🤖 Sending to Groq AI...");

      // Verify API key exists
      const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
      if (!apiKey) {
        throw new Error("GROQ API key is not configured");
      }

      // Build conversation history for context
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const requestBody = {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are DentWise AI, a helpful and friendly AI dental assistant. 
            
           Guidelines:
              - Provide accurate, helpful dental advice in 2-3 sentences
              - Be empathetic and professional
              - For serious issues, recommend seeing a dentist
              - Keep responses conversational and concise for voice
              - Never diagnose serious conditions, only provide general guidance
              - Use simple language that's easy to understand when spoken aloud`,
          },
          ...conversationHistory,
          { role: "user", content: userMessage },
        ],
        max_tokens: 200,
        temperature: 0.7,
      };

      console.log("📤 Request body:", JSON.stringify(requestBody, null, 2));

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log("📥 Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Groq API error details:", errorData);

        if (response.status === 401) {
          throw new Error("Invalid API key. Please check your GROQ API key in .env.local");
        } else if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please wait a moment and try again.");
        } else if (response.status === 400) {
          throw new Error(`Bad request: ${errorData.error?.message || 'Invalid request format'}`);
        } else {
          throw new Error(`Groq API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      console.log("✅ AI responded:", aiResponse);

      // Add AI message
      setMessages((prev) => [...prev, { role: "assistant", content: aiResponse }]);

      // Speak the response
      speakText(aiResponse);
    } catch (error) {
      console.error("❌ Groq API Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to get AI response";
      setError(errorMessage);

      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Sorry, I encountered an error: ${errorMessage}` }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Text-to-speech
  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsSpeaking(true);
        console.log("🔊 AI speaking...");
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        console.log("🔇 AI finished speaking");
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  // Toggle listening
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (!recognitionRef.current) {
        recognitionRef.current = initRecognition();
      }
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("Failed to start recognition:", error);
        setError("Failed to start microphone. Please refresh and try again.");
      }
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Clear conversation
  const clearConversation = () => {
    setMessages([]);
    setError("");
  };

  if (!isLoaded) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 flex flex-col overflow-hidden pb-20">
      {/* TITLE */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold font-mono">
          <span>Talk to Your </span>
          <span className="text-primary uppercase">AI Dental Assistant</span>
        </h1>
        <p className="text-muted-foreground mt-2">
          Free unlimited voice conversations powered by Groq AI + Web Speech API
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          <p className="font-semibold">⚠️ Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* VIDEO CALL AREA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* AI ASSISTANT CARD */}
        <Card className="bg-card/90 backdrop-blur-sm border border-border overflow-hidden relative">
          <div className="aspect-video flex flex-col items-center justify-center p-6 relative">
            {/* AI VOICE ANIMATION */}
            <div
              className={`absolute inset-0 ${isSpeaking ? "opacity-30" : "opacity-0"
                } transition-opacity duration-300`}
            >
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-center items-center h-20">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`mx-1 h-16 w-1 bg-primary rounded-full ${isSpeaking ? "animate-pulse" : ""
                      }`}
                    style={{
                      animationDelay: `${i * 0.1}s`,
                      height: isSpeaking ? `${Math.random() * 50 + 20}%` : "5%",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* AI LOGO */}
            <div className="relative size-32 mb-4">
              <div
                className={`absolute inset-0 bg-primary opacity-10 rounded-full blur-lg ${isSpeaking ? "animate-pulse" : ""
                  }`}
              />

              <div className="relative w-full h-full rounded-full bg-card flex items-center justify-center border border-border overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-primary/5"></div>
                <Image
                  src="/logo.png"
                  alt="AI Dental Assistant"
                  width={80}
                  height={80}
                  className="w-20 h-20 object-contain"
                />
              </div>
            </div>

            <h2 className="text-xl font-bold text-foreground">DentWise AI</h2>
            <p className="text-sm text-muted-foreground mt-1">Powered by Groq</p>

            {/* SPEAKING INDICATOR */}
            <div
              className={`mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border ${isSpeaking ? "border-primary" : isListening ? "border-green-500" : ""
                }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${isSpeaking
                  ? "bg-primary animate-pulse"
                  : isListening
                    ? "bg-green-500 animate-pulse"
                    : isProcessing
                      ? "bg-yellow-500 animate-pulse"
                      : "bg-muted"
                  }`}
              />

              <span className="text-xs text-muted-foreground">
                {isSpeaking
                  ? "Speaking..."
                  : isListening
                    ? countdown !== null
                      ? `Speak now! (${countdown}s)`
                      : "Listening..."
                    : isProcessing
                      ? "Thinking..."
                      : "Ready"}
              </span>
            </div>
          </div>
        </Card>

        {/* USER CARD */}
        <Card className={`bg-card/90 backdrop-blur-sm border overflow-hidden relative`}>
          <div className="aspect-video flex flex-col items-center justify-center p-6 relative">
            <div className="relative size-32 mb-4">
              <Image
                src={user?.imageUrl!}
                alt="User"
                width={128}
                height={128}
                className="size-full object-cover rounded-full"
              />
            </div>

            <h2 className="text-xl font-bold text-foreground">You</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {user ? (user.firstName + " " + (user.lastName || "")).trim() : "Guest"}
            </p>

            <div className={`mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-card border`}>
              <div className={`w-2 h-2 rounded-full bg-green-500`} />
              <span className="text-xs text-muted-foreground">Ready</span>
            </div>
          </div>
        </Card>
      </div>

      {/* MESSAGE CONTAINER */}
      {messages.length > 0 && (
        <div
          ref={messageContainerRef}
          className="w-full bg-card/90 backdrop-blur-sm border border-border rounded-xl p-4 mb-8 h-64 overflow-y-auto transition-all duration-300 scroll-smooth"
        >
          <div className="space-y-3">
            {messages.map((msg, index) => (
              <div key={index} className="message-item animate-in fade-in duration-300">
                <div className="font-semibold text-xs text-muted-foreground mb-1">
                  {msg.role === "assistant" ? "🦷 DentWise AI" : "👤 You"}:
                </div>
                <p className="text-foreground">{msg.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CALL CONTROLS */}
      <div className="w-full flex justify-center gap-4 mb-4">
        <Button
          className={`w-44 text-xl rounded-3xl ${isListening
            ? "bg-destructive hover:bg-destructive/90"
            : "bg-primary hover:bg-primary/90"
            } text-white relative`}
          onClick={toggleListening}
          disabled={isProcessing || isSpeaking}
        >
          {isListening && (
            <span className="absolute inset-0 rounded-full animate-ping bg-primary/50 opacity-75 p-15"></span>
          )}
          <span>
            {isListening ? "Stop Listening" : isProcessing ? "Processing..." : "Start Talking"}
          </span>
        </Button>

        {isSpeaking && (
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-3xl px-6"
            onClick={stopSpeaking}
          >
            Stop AI Voice
          </Button>
        )}

        {messages.length > 0 && (
          <Button
            variant="outline"
            className="rounded-3xl px-6"
            onClick={clearConversation}
          >
            Clear Chat
          </Button>
        )}
      </div>

      {/* Instructions */}
      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
        <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
          💡 100% Free - Unlimited Usage
        </h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>✅ Click "Start Talking" and speak your dental question</li>
          <li>✅ Powered by Groq AI (free, ultra-fast responses)</li>
          <li>✅ No time limits or usage restrictions</li>
          <li>⚠️ Works best in Chrome, Edge, or Safari browsers</li>
        </ul>
      </div>
    </div>
  );
}

export default VoiceAssistantWidget;