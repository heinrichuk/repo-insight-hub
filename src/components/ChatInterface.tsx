
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message, RepoData } from '@/types';
import { askQuestion } from '@/services/apiService';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

interface ChatInterfaceProps {
  repoData: RepoData | null;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ repoData }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Add initial welcome message
  useEffect(() => {
    if (repoData) {
      setMessages([
        {
          id: uuidv4(),
          content: `I'm ready to answer questions about the repository "${repoData.name}". How can I help you?`,
          role: 'assistant',
          timestamp: new Date()
        }
      ]);
    } else {
      setMessages([]);
    }
  }, [repoData]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !repoData) return;
    
    const userMessage: Message = {
      id: uuidv4(),
      content: newMessage,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);
    
    try {
      const response = await askQuestion(newMessage, repoData);
      
      const assistantMessage: Message = {
        id: uuidv4(),
        content: response,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error('Failed to get a response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col shadow-lg border-2 border-ubs-gray">
      <CardHeader className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-ubs-blue">Chat with Your Code</h2>
      </CardHeader>
      
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <CardContent className="space-y-4">
          {messages.length > 0 ? (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-ubs-blue text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">{message.content}</div>
                  <div
                    className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-gray-300' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              {repoData 
                ? "Start asking questions about your code..." 
                : "Please load a repository to start the conversation"}
            </div>
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg max-w-[80%]">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </ScrollArea>
      
      <CardFooter className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={repoData ? "Ask a question about your code..." : "Load a repository first"}
            disabled={!repoData || isLoading}
            className="flex-grow"
          />
          <Button 
            type="submit" 
            disabled={!repoData || isLoading || !newMessage.trim()}
            className="bg-ubs-blue hover:bg-ubs-lightblue"
          >
            Send
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatInterface;
