// Boss Chat Engine - Gamified sneaker customizer with time pressure!
// Features animated messages, timer, and boss challenges

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface BossMessage {
  id: string;
  text: string;
  type: 'urgent' | 'warning' | 'praise' | 'challenge';
  timestamp: number;
  isTyping?: boolean;
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
  const [currentChallenge, setCurrentChallenge] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Boss challenge templates
  const bossChallenges = [
    {
      text: "Hey! These sneakers are UGLY! 😤 You have 2 minutes to make them look professional for our client meeting!",
      timeLimit: 120,
      type: 'urgent' as const
    },
    {
      text: "What is this mess?! 🤮 Our biggest client wants something BOLD and MODERN. You have 90 seconds!",
      timeLimit: 90,
      type: 'urgent' as const
    },
    {
      text: "This looks like a 5-year-old designed it! 😡 Make it look EXPENSIVE and LUXURIOUS. 3 minutes!",
      timeLimit: 180,
      type: 'urgent' as const
    },
    {
      text: "Are you kidding me?! 😤 The CEO is coming in 2 minutes and these look TERRIBLE! Fix them NOW!",
      timeLimit: 120,
      type: 'urgent' as const
    },
    {
      text: "This is EMBARRASSING! 😡 Our Instagram followers will roast us! Make it TRENDY and COOL. 2.5 minutes!",
      timeLimit: 150,
      type: 'urgent' as const
    }
  ];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add a boss message with typing animation
  const addBossMessage = useCallback((text: string, type: BossMessage['type'] = 'urgent') => {
    const messageId = `msg-${Date.now()}-${Math.random()}`;
    
    // Show typing indicator
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      const newMessage: BossMessage = {
        id: messageId,
        text,
        type,
        timestamp: Date.now(),
        isTyping: false
      };
      
      setMessages(prev => [...prev, newMessage]);
      onBossMessage(text);
    }, 1500 + Math.random() * 1000); // Random typing delay
  }, [onBossMessage]);

  // Handle time running out
  const handleTimeUp = useCallback(() => {
    setIsGameActive(false);
    setCurrentChallenge(null);
    
    // Boss is disappointed
    addBossMessage("Time&apos;s up! 😤 You FAILED! The client is NOT happy with this mess!", 'urgent');
    
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

  // Start a random challenge
  const startRandomChallenge = () => {
    const challenge = bossChallenges[Math.floor(Math.random() * bossChallenges.length)];
    setCurrentChallenge(challenge.text);
    setTimeLeft(challenge.timeLimit);
    setIsGameActive(true);
    onChallengeStart(challenge.timeLimit, challenge.text);
    
    // Add boss message
    addBossMessage(challenge.text, challenge.type);
  };

  // Handle challenge completion
  const handleChallengeComplete = () => {
    if (!isGameActive) return;
    
    setIsGameActive(false);
    setCurrentChallenge(null);
    
    // Calculate score based on time remaining
    const timeBonus = Math.floor(timeLeft * 2);
    const newScore = Math.max(10, timeBonus);
    setScore(prev => prev + newScore);
    
    // Boss reaction based on score
    if (newScore >= 100) {
      addBossMessage("WOW! 🤩 That's AMAZING! The client is going to LOVE this! You're a genius!", 'praise');
    } else if (newScore >= 50) {
      addBossMessage("Not bad! 👍 The client might actually like this. Good work!", 'praise');
    } else {
      addBossMessage("Hmm... 🤔 It's okay, I guess. The client might not hate it.", 'warning');
    }
    
    onChallengeComplete(newScore);
  };

  // Start the game
  const startGame = () => {
    setMessages([]);
    setScore(0);
    addBossMessage("Hey! 👋 Ready for your first challenge? Let's see what you've got!", 'challenge');
    
    setTimeout(() => {
      startRandomChallenge();
    }, 3000);
  };

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
      top: 20,
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
          <div
            key={message.id}
            style={{
              marginBottom: 12,
              padding: '8px 12px',
              borderRadius: 12,
              background: message.type === 'urgent' 
                ? 'rgba(255,68,68,0.1)' 
                : message.type === 'praise'
                ? 'rgba(34,197,94,0.1)'
                : message.type === 'warning'
                ? 'rgba(255,170,0,0.1)'
                : 'rgba(255,105,180,0.1)',
              border: `1px solid ${
                message.type === 'urgent' 
                  ? '#ff4444' 
                  : message.type === 'praise'
                  ? '#22c55e'
                  : message.type === 'warning'
                  ? '#ffaa00'
                  : '#ff69b4'
              }`,
              color: '#f8f8ff',
              fontSize: 13,
              lineHeight: 1.4,
              animation: 'slideIn 0.3s ease-out'
            }}
          >
            {message.text}
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
        {!isGameActive && messages.length === 0 && (
          <button
            onClick={startGame}
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
            🎮 Start Challenge
          </button>
        )}
        
        {isGameActive && (
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
            ✅ I&apos;m Done!
          </button>
        )}
        
        <button
          onClick={() => {
            setMessages([]);
            setScore(0);
            setIsGameActive(false);
            setCurrentChallenge(null);
            setTimeLeft(0);
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
