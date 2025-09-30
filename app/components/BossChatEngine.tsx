// Boss Chat Engine - Interactive conversational sneaker customizer!
// Features back-and-forth chat, response options, and timed challenges

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface BossMessage {
  id: string;
  text: string;
  type: 'boss' | 'user' | 'system';
  timestamp: number;
  isTyping?: boolean;
  responses?: string[];
}

interface BossChatEngineProps {
  isActive: boolean;
  onChallengeStart: (timeLimit: number, challenge: string) => void;
  onChallengeComplete: (score: number) => void;
  onBossMessage: (message: string) => void;
}

export function BossChatEngine({ 
  isActive, 
  onChallengeStart, 
  onChallengeComplete, 
  onBossMessage 
}: BossChatEngineProps) {
  const [messages, setMessages] = useState<BossMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [conversationState, setConversationState] = useState<'initial' | 'ready' | 'countdown' | 'active' | 'completed'>('initial');
  const [countdown, setCountdown] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const messageUpdateRef = useRef<NodeJS.Timeout | null>(null);

  // Conversation flow states - more natural workplace conversation
  const conversationFlow = {
    initial: {
      bossMessage: "Hey, do you have a minute?",
      responses: ["Yes, of course", "My schedule is busy but yes", "What's up?"]
    },
    ready: {
      bossMessage: "Great! So I need you to take a look at this sneaker design. The client is coming in 2 minutes and it's... well, it needs work. Can you fix it up real quick?",
      responses: ["Sure thing, boss", "I'll do my best", "How much time do I have?"]
    },
    countdown: {
      bossMessage: "Perfect! Alright, let's go - 3... 2... 1... start!",
      responses: []
    }
  };

  // Boss criticism messages during the challenge - more natural workplace pressure
  const bossCriticisms = [
    "How's it looking? The client will be here any minute...",
    "We're running out of time here. How much longer?",
    "That color might not work for them. What else you got?",
    "Come on, we need to wrap this up soon.",
    "The client's in the lobby. How close are we?",
    "This needs to be good. They're a big account.",
    "We're cutting it close. Almost done?",
    "They're going to see this in like 30 seconds..."
  ];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add a boss message with typing animation
  const addBossMessage = useCallback((text: string, responses?: string[]) => {
    const messageId = `msg-${Date.now()}-${Math.random()}`;
    
    // Show typing indicator
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      const newMessage: BossMessage = {
        id: messageId,
        text,
        type: 'boss',
        timestamp: Date.now(),
        isTyping: false,
        responses
      };
      
      setMessages(prev => [...prev, newMessage]);
      onBossMessage(text);
    }, 1500 + Math.random() * 1000); // Random typing delay
  }, [onBossMessage]);

  // Add a user message
  const addUserMessage = useCallback((text: string) => {
    const messageId = `msg-${Date.now()}-${Math.random()}`;
    const newMessage: BossMessage = {
      id: messageId,
      text,
      type: 'user',
      timestamp: Date.now(),
      isTyping: false
    };
    
    setMessages(prev => [...prev, newMessage]);
  }, []);

  // Handle user response selection
  const handleUserResponse = useCallback((response: string) => {
    addUserMessage(response);
    
    // Process response based on conversation state
    if (conversationState === 'initial') {
      // All responses lead to the same outcome - boss needs you
      setConversationState('ready');
      setTimeout(() => {
        addBossMessage(conversationFlow.ready.bossMessage, conversationFlow.ready.responses);
      }, 1000);
    } else if (conversationState === 'ready') {
      // All responses lead to starting the work
      if (response.includes("time")) {
        setTimeout(() => {
          addBossMessage("About 2 minutes. They're literally walking in the door. Ready?", ["Let's do it", "I'll make it work"]);
        }, 1000);
      } else {
        setConversationState('countdown');
        startCountdown();
      }
    }
  }, [conversationState, addBossMessage, addUserMessage]);

  // Start countdown sequence
  const startCountdown = useCallback(() => {
    setCountdown(3);
    addBossMessage("Perfect! Alright, let's go - 3... 2... 1... start!");
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setConversationState('active');
          startChallenge();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [addBossMessage]);

  // Start the actual challenge
  const startChallenge = useCallback(() => {
    setIsGameActive(true);
    setTimeLeft(120); // 2 minutes
    onChallengeStart(120, "Fix up this sneaker design for the client!");
    
    // Start 30-second message updates
    startMessageUpdates();
  }, [onChallengeStart]);

  // Start periodic boss messages during challenge
  const startMessageUpdates = useCallback(() => {
    messageUpdateRef.current = setInterval(() => {
      if (isGameActive && timeLeft > 0) {
        const randomCriticism = bossCriticisms[Math.floor(Math.random() * bossCriticisms.length)];
        addBossMessage(randomCriticism);
      }
    }, 30000); // Every 30 seconds
  }, [isGameActive, timeLeft, addBossMessage]);

  // Handle time running out
  const handleTimeUp = useCallback(() => {
    setIsGameActive(false);
    setConversationState('completed');
    
    if (messageUpdateRef.current) {
      clearInterval(messageUpdateRef.current);
    }
    
    // Boss is disappointed
    addBossMessage("Time's up. The client is here. We'll have to show them what we have...");
    
    // Calculate score (0 for failure)
    setScore(0);
    onChallengeComplete(0);
  }, [addBossMessage, onChallengeComplete]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && isGameActive) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isGameActive) {
      // Time's up!
      handleTimeUp();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, isGameActive, handleTimeUp]);

  // Handle challenge completion
  const handleChallengeComplete = useCallback(() => {
    if (!isGameActive) return;
    
    setIsGameActive(false);
    setConversationState('completed');
    
    if (messageUpdateRef.current) {
      clearInterval(messageUpdateRef.current);
    }
    
    // Calculate score based on time remaining
    const timeBonus = Math.floor(timeLeft * 2);
    const newScore = Math.max(10, timeBonus);
    setScore(prev => prev + newScore);
    
    // Boss reaction based on score
    if (newScore >= 100) {
      addBossMessage("Wow, that looks great! The client is going to love this. Nice work!");
    } else if (newScore >= 50) {
      addBossMessage("Not bad! This should work for the presentation. Good job!");
    } else {
      addBossMessage("It's... okay. We'll see what the client thinks. Thanks for trying.");
    }
    
    onChallengeComplete(newScore);
  }, [isGameActive, timeLeft, addBossMessage, onChallengeComplete]);

  // Start the conversation
  const startConversation = useCallback(() => {
    setMessages([]);
    setScore(0);
    setConversationState('initial');
    addBossMessage(conversationFlow.initial.bossMessage, conversationFlow.initial.responses);
  }, [addBossMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (messageUpdateRef.current) clearInterval(messageUpdateRef.current);
    };
  }, []);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isActive) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      left: 20,
      width: 350,
      maxHeight: '80vh',
      background: 'linear-gradient(145deg, #1a1a1a, #0f0f0f)',
      border: '2px solid #ff69b4',
      borderRadius: 16,
      boxShadow: '0 8px 32px rgba(255,105,180,0.3)',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, ui-sans-serif, system-ui'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #ff69b4, #ffc0cb)',
        color: '#0f0f0f',
        padding: '12px 16px',
        borderRadius: '14px 14px 0 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: '#0f0f0f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16
          }}>
            👨‍💼
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>THE BOSS</div>
            <div style={{ fontSize: 10, opacity: 0.8 }}>Sneaker Design Manager</div>
          </div>
        </div>
        <div style={{ fontSize: 12, fontWeight: 600 }}>
          Score: {score}
        </div>
      </div>

      {/* Timer */}
      {isGameActive && (
        <div style={{
          background: timeLeft < 30 ? '#ff4444' : timeLeft < 60 ? '#ffaa00' : '#ff69b4',
          color: '#fff',
          padding: '8px 16px',
          textAlign: 'center',
          fontWeight: 700,
          fontSize: 18,
          animation: timeLeft < 30 ? 'pulse 1s infinite' : 'none'
        }}>
          ⏰ {formatTime(timeLeft)}
        </div>
      )}

      {/* Messages */}
      <div style={{
        flex: 1,
        padding: 16,
        overflowY: 'auto',
        maxHeight: '300px',
        background: 'rgba(255,255,255,0.02)'
      }}>
        {messages.map((message) => (
          <div key={message.id} style={{ marginBottom: 12 }}>
            {/* Message bubble */}
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 12,
                background: message.type === 'boss' 
                  ? 'rgba(255,105,180,0.1)' 
                  : message.type === 'user'
                  ? 'rgba(34,197,94,0.1)'
                  : 'rgba(255,255,255,0.05)',
                border: `1px solid ${
                  message.type === 'boss' 
                    ? '#ff69b4' 
                    : message.type === 'user'
                    ? '#22c55e'
                    : '#666'
                }`,
                color: '#f8f8ff',
                fontSize: 13,
                lineHeight: 1.4,
                animation: 'slideIn 0.3s ease-out',
                marginLeft: message.type === 'user' ? '20px' : '0',
                marginRight: message.type === 'boss' ? '20px' : '0'
              }}
            >
              {message.text}
            </div>
            
            {/* Response options */}
            {message.responses && message.responses.length > 0 && (
              <div style={{ 
                marginTop: 8, 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 4 
              }}>
                {message.responses.map((response, index) => (
                  <button
                    key={index}
                    onClick={() => handleUserResponse(response)}
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 8,
                      color: '#f8f8ff',
                      fontSize: 12,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,105,180,0.2)';
                      e.currentTarget.style.borderColor = '#ff69b4';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                    }}
                  >
                    {response}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div style={{
            marginBottom: 12,
            padding: '8px 12px',
            borderRadius: 12,
            background: 'rgba(255,105,180,0.1)',
            border: '1px solid #ff69b4',
            color: '#f8f8ff',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <div style={{ display: 'flex', gap: 4 }}>
              <div style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#ff69b4',
                animation: 'bounce 1.4s infinite ease-in-out'
              }} />
              <div style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#ff69b4',
                animation: 'bounce 1.4s infinite ease-in-out 0.2s'
              }} />
              <div style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#ff69b4',
                animation: 'bounce 1.4s infinite ease-in-out 0.4s'
              }} />
            </div>
            The Boss is typing...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Controls */}
      <div style={{
        padding: 16,
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        gap: 8
      }}>
        {messages.length === 0 && (
          <button
            onClick={startConversation}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #ff69b4, #ffc0cb)',
              color: '#0f0f0f',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,105,180,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            💬 Start Chat
          </button>
        )}
        
        {isGameActive && conversationState === 'active' && (
          <button
            onClick={handleChallengeComplete}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #22c55e, #4ade80)',
              color: '#0f0f0f',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(34,197,94,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            ✅ Done!
          </button>
        )}
        
        {conversationState === 'countdown' && (
          <div style={{
            flex: 1,
            padding: '12px 16px',
            background: 'rgba(255,170,0,0.2)',
            border: '1px solid #ffaa00',
            borderRadius: 8,
            textAlign: 'center',
            fontSize: 18,
            fontWeight: 700,
            color: '#ffaa00'
          }}>
            {countdown > 0 ? countdown : 'GO!'}
          </div>
        )}
        
        <button
          onClick={() => {
            setMessages([]);
            setScore(0);
            setIsGameActive(false);
            setConversationState('initial');
            setTimeLeft(0);
            setCountdown(0);
            if (messageUpdateRef.current) {
              clearInterval(messageUpdateRef.current);
            }
          }}
          style={{
            padding: '12px 16px',
            background: 'rgba(255,255,255,0.1)',
            color: '#f8f8ff',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          🔄 Reset
        </button>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
