import React, { useState, useRef, useEffect } from "react";
import { FaArrowRight } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { RxCross2 } from "react-icons/rx";
import { removeFile } from "../redux/slices/fileSlice";

// Generate a unique session ID
const generateSessionId = () => {
    return crypto.randomUUID();
};

function Chatbot() {
    const [isFileLoading, setIsFileLoading] = useState(false);
    const [isMessageLoading, setIsMessageLoading] = useState(false);
    const dispatch = useDispatch();
    const files = useSelector((state) => state.files?.files || []);
    const [chatHistory, setChatHistory] = useState([]);
    const [message, setMessage] = useState("");
    const textareaRef = useRef(null);
    const chatContainerRef = useRef(null);
    const [isTyping, setIsTyping] = useState(false);

    const handleInput = (event) => {
        const textarea = textareaRef.current;
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
        setMessage(event.target.value);
    };

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleRemove = async (fileName) => {
        try {
            setIsFileLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/delete-file`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fileName })
            });

            if (!response.ok) throw new Error('Failed to delete file');

            dispatch(removeFile(fileName));
        } catch (error) {
            console.error('Error deleting file:', error);
        } finally {
            setIsFileLoading(false);
        }
    };

    // Generate session ID when component mounts
    const [sessionId, setSessionId] = useState(() => generateSessionId());

    const handleSubmit = async () => {
        if (!message.trim()) {
            alert("Please enter a question.");
            return;
        }

        // Add user message to chat history
        const userMessage = message.trim();
        setChatHistory(prev => [...prev, { text: userMessage, type: "user" }]);
        setMessage("");
        setIsMessageLoading(true);
        setIsTyping(true);

        try {
            // Send request to backend
            const result = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/chat`, {
                sessionId,
                message: userMessage
            });

            // Add bot response to chat history
            if (result.status === 200) {
                console.log('Received response:', result.data);
                // Extract the output message from the response
                let botMessage = result.data?.output || JSON.stringify(result.data);
                
                // Format the message with markdown-like syntax
                botMessage = botMessage
                    // Bold text between ** **
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    // Bullet points starting with - or *
                    .replace(/^[-*]\s+(.*$)/gm, '• $1')
                    // Convert line breaks to <br/>
                    .replace(/\n/g, '<br/>');
                    
                setChatHistory(prev => [
                    ...prev,
                    { 
                        text: botMessage, 
                        type: "bot",
                        isHtml: true 
                    },
                ]);
                
            } else {
                console.error('Server response:', result.data);
                setChatHistory(prev => [...prev, { 
                    text: "Sorry, I couldn't process your request. Please try again.", 
                    type: "bot" 
                }]);
            }
        } catch (error) {
            console.error("Error submitting question:", error);
            setChatHistory(prev => [...prev, { 
                text: "An error occurred while processing your message. Please try again.", 
                type: "bot" 
            }]);
        } finally {
            setIsMessageLoading(false);
            setIsTyping(false);
            // Auto-scroll to bottom after state updates
            setTimeout(() => {
                if (chatContainerRef.current) {
                    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                }
            }, 100);
        }
    };

    return (
        <div className="w-11/12 mx-auto flex gap-4 h-screen p-4">
            {/* Left Panel - Uploaded Documents */}
            <div className="w-1/3 bg-white border rounded-xl p-4 overflow-y-auto">
                <h3 className="text-lg font-semibold text-center text-gray-700 mb-2">
                    Documents Uploaded
                </h3>
                {isFileLoading ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="w-12 h-12 border-4 border-custom-orange border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-custom-orange">Deleting file...</p>
                    </div>
                ) : (
                    <>
                        {files.length > 0 ? (
                            <div className="space-y-3">
                                {files.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between items-center bg-gray-100 p-3 rounded-lg"
                                    >
                                        <div>
                                            <span className="text-sm text-gray-700">{file.name}</span>
                                            <span className="ml-2 text-xs text-gray-500">({file.type})</span>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(file.name)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <RxCross2 />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 mt-4">
                                No documents uploaded yet.
                            </p>
                        )}
                    </>
                )}
            </div>

            {/* Right Panel - Chat */}
            <div className="flex-1 flex flex-col bg-white border rounded-xl p-4">
                <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto space-y-4 p-4"
                >
                    {chatHistory.map((chat, index) => (
                        <div
                            key={index}
                            className={`flex ${
                                chat.type === "user" ? "justify-end" : "justify-start"
                            }`}
                        >
                            <div
                                className={`max-w-[80%] p-3 rounded-lg ${
                                    chat.type === "user"
                                        ? "bg-blue-100 text-blue-900 rounded-tr-none"
                                        : "bg-gray-100 text-gray-800 rounded-tl-none"
                                }`}
                            >
                                {chat.isHtml ? (
                                    <div 
                                        className="break-words" 
                                        dangerouslySetInnerHTML={{ __html: chat.text }}
                                    />
                                ) : (
                                    <p className="break-words">{chat.text}</p>
                                )}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 text-gray-800 p-3 rounded-lg rounded-tl-none max-w-[80%]">
                                <div className="flex space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100"></div>
                                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Section */}
                <div className="relative mt-4">
                    <textarea
                        ref={textareaRef}
                        placeholder="Enter your queries regarding the legal document"
                        className="w-full min-h-24 max-h-[200px] p-3 pr-12 border bg-gray-50 rounded-xl resize-none overflow-y-auto"
                        onInput={handleInput}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                        value={message}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={isMessageLoading || !message.trim()}
                        className={`absolute bottom-3 right-3 p-2 rounded-full ${
                            isMessageLoading || !message.trim() 
                                ? 'bg-gray-300 cursor-not-allowed' 
                                : 'bg-custom-orange text-white hover:bg-orange-600'
                        }`}
                    >
                        {isMessageLoading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <FaArrowRight />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Chatbot;
