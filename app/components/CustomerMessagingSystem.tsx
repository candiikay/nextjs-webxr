// Pizza Game-Style Sneaker Customizer with Dynamic Customers
// Features: Level progression, customer orders, design budget system

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Customer {
  id: string;
  name: string;
  title: string;
  level: number;
  budget: number;
  colorPreference: string;
  urgency: 'low' | 'medium' | 'high';
  personality: string;
  avatar: string;
}

interface CustomerOrder {
  id: string;
  customer: Customer;
  description: string;
  timeLimit: number;
  budget: number;
  colorChanges: number;
  maxChanges: number;
  satisfaction: number;
}

interface Message {
  id: string;
  text: string;
  type: 'customer' | 'user' | 'system';
  timestamp: number;
  isTyping?: boolean;
  responses?: string[];
}

interface CustomerMessagingSystemProps {
  onOrderStart: (order: CustomerOrder) => void;
  onOrderComplete: (score: number) => void;
  onColorChange: (cost: number) => void;
  onBudgetUpdate: (remaining: number) => void;
  colorChangeRef?: React.MutableRefObject<((cost: number) => void) | null>;
}

export function CustomerMessagingSystem({
  onOrderStart,
  onOrderComplete,
  onColorChange,
  onBudgetUpdate,
  colorChangeRef
}: CustomerMessagingSystemProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [conversationState, setConversationState] = useState<'initial' | 'order' | 'ready' | 'active' | 'completed'>('initial');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentOrder, setCurrentOrder] = useState<CustomerOrder | null>(null);
  const [remainingBudget, setRemainingBudget] = useState(0);
  const [colorChanges, setColorChanges] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const messageUpdateRef = useRef<NodeJS.Timeout | null>(null);

  // Customer database - different levels with unique personalities
  const customers = {
    1: [
      {
        id: 'sarah',
        name: 'Sarah',
        title: 'Intern',
        level: 1,
        budget: 50,
        colorPreference: 'pink',
        urgency: 'low',
        personality: 'friendly but indecisive',
        avatar: '👩‍💼'
      }
    ],
    2: [
      {
        id: 'andre',
        name: 'Andre',
        title: 'Basketball Player',
        level: 2,
        budget: 100,
        colorPreference: 'blue',
        urgency: 'medium',
        personality: 'confident and specific',
        avatar: '🏀'
      }
    ],
    3: [
      {
        id: 'creative_director',
        name: 'Alex',
        title: 'Creative Director',
        level: 3,
        budget: 200,
        colorPreference: 'custom',
        urgency: 'high',
        personality: 'demanding but appreciative',
        avatar: '🎨'
      }
    ]
  };

  // Customer order templates
  const orderTemplates = {
    1: [
      "Hey! I heard you're an amazing shoe designer! I just got my first real job and I need something that makes me feel confident walking into the office. Can you help me design the perfect pair? I'm so nervous about my first day!",
      "Hi! I've been following your work and I'm obsessed with your designs! I just landed my dream internship and I need shoes that say 'I belong here' but also 'I'm ready to learn'. What do you think?",
      "Hey there! I'm starting my first job next week and I'm freaking out! I need shoes that will make me feel like I can conquer anything. I've seen your designs and they're incredible - can you work your magic for me?"
    ],
    2: [
      "Yo! I heard you're the best sneaker designer in the game! I'm Andre, I play college basketball and I need something that screams 'I'm unstoppable' on the court. My team colors are blue and white, but I want something that stands out from everyone else. Can you make me look like a champion?",
      "Hey! I've been following your Instagram and your designs are fire! I'm a basketball player and I need shoes that match my aggressive playing style. I want something that looks fast, powerful, and makes my opponents scared. What can you create for me?",
      "What's up! I'm Andre and I play ball at State University. I need shoes that are going to make me look like the best player on the court. I want something bold, something that says 'I'm here to dominate'. Can you design something that matches my energy?"
    ],
    3: [
      "Hello! I'm Alex, Creative Director at a major design agency. I've been following your work and I'm genuinely impressed by your aesthetic sense. I need something that's going to turn heads at the design conference next week. I want something that shows I understand color theory, modern design principles, and have impeccable taste. This needs to be perfect - I'm presenting to potential clients. Can you create something that reflects my professional standards?",
      "Hi there! I'm Alex, and I work in the creative industry. I've seen your portfolio and I'm blown away by your attention to detail and innovative approach. I need shoes for a major presentation to the board tomorrow - something that shows I understand both creativity and business. I want something sophisticated, unique, and that demonstrates my understanding of modern aesthetics. What can you create that will make a statement?",
      "Hello! I'm Alex, Creative Director, and I've been admiring your work from afar. I need something extraordinary for a high-stakes client meeting. I want shoes that show I understand color theory, have an eye for detail, and can think outside the box. This needs to be perfect - I'm representing our entire creative team. Can you design something that reflects my professional expertise and creative vision?"
    ]
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add a customer message with typing animation
  const addCustomerMessage = useCallback((text: string, responses?: string[]) => {
    const messageId = `msg-${Date.now()}-${Math.random()}`;
    
    // Show typing indicator
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      const newMessage: Message = {
        id: messageId,
        text,
        type: 'customer',
        timestamp: Date.now(),
        isTyping: false,
        responses
      };
      setMessages(prev => [...prev, newMessage]);
    }, 1500 + Math.random() * 1000); // Random typing delay
  }, []);

  // Add a user message
  const addUserMessage = useCallback((text: string) => {
    const messageId = `msg-${Date.now()}-${Math.random()}`;
    const newMessage: Message = {
      id: messageId,
      text,
      type: 'user',
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  // Generate a new customer order
  const generateOrder = useCallback((level: number) => {
    const levelCustomers = customers[level as keyof typeof customers];
    const customer = levelCustomers[Math.floor(Math.random() * levelCustomers.length)];
    const templates = orderTemplates[level as keyof typeof orderTemplates];
    const description = templates[Math.floor(Math.random() * templates.length)];
    
    const order: CustomerOrder = {
      id: `order-${Date.now()}`,
      customer: customer as Customer,
      description,
      timeLimit: level === 1 ? 180 : level === 2 ? 120 : 90, // 3min, 2min, 1.5min
      budget: customer.budget,
      colorChanges: 0,
      maxChanges: Math.floor(customer.budget / 10), // 10 points per change
      satisfaction: 100
    };
    
    setCurrentOrder(order);
    setRemainingBudget(order.budget);
    setColorChanges(0);
    
    return order;
  }, []);

  // Handle color change with budget deduction
  const handleColorChange = useCallback((cost: number = 10) => {
    if (remainingBudget >= cost && colorChanges < currentOrder?.maxChanges!) {
      setRemainingBudget(prev => prev - cost);
      setColorChanges(prev => prev + 1);
      onColorChange(cost);
      onBudgetUpdate(remainingBudget - cost);
    }
  }, [remainingBudget, colorChanges, currentOrder, onColorChange, onBudgetUpdate]);

  // Start a new order
  const startNewOrder = useCallback(() => {
    const order = generateOrder(currentLevel);
    setConversationState('order');
    
    // Customer introduction
    setTimeout(() => {
      addCustomerMessage(
        `${order.description}`,
        ["Absolutely! I'd love to help!", "Of course! Let's create something amazing!", "Yes! I'm excited to work with you!"]
      );
    }, 1000);
  }, [currentLevel, generateOrder, addCustomerMessage]);

  // Handle user response
  const handleUserResponse = useCallback((response: string) => {
    addUserMessage(response);
    
    if (conversationState === 'order') {
      // Show budget and time info after user responds
      setTimeout(() => {
        addCustomerMessage(
          `Perfect! My budget is $${currentOrder?.budget} and I need this done in 2 minutes - I'm on a tight schedule! Are you ready to start designing?`,
          ["Let's do this!", "I'm ready to create magic!", "Absolutely! Let's go!"]
        );
        setConversationState('ready');
      }, 1000);
    } else if (conversationState === 'ready') {
      // All responses lead to starting the challenge
      setConversationState('active');
      startChallenge();
    }
  }, [conversationState, currentOrder, addUserMessage, addCustomerMessage]);

  // Start the challenge
  const startChallenge = useCallback(() => {
    if (!currentOrder) return;
    
    setIsGameActive(true);
    setTimeLeft(currentOrder.timeLimit);
    onOrderStart(currentOrder);
    
    // Start periodic customer feedback
    startMessageUpdates();
  }, [currentOrder, onOrderStart]);

  // Start periodic customer messages during challenge
  const startMessageUpdates = useCallback(() => {
    if (!currentOrder) return;
    
    messageUpdateRef.current = setInterval(() => {
      if (isGameActive && timeLeft > 0) {
        const feedbacks = {
          1: [
            "Oh my gosh, this is looking amazing! I'm so excited!",
            "I love what you're doing! This is exactly what I imagined!",
            "Time is flying! How are we doing? I'm getting nervous!",
            "This is perfect! I can already see myself wearing these!",
            "Can we try something a little more... professional? I want to look put together!",
            "I'm loving this direction! You really understand what I need!",
            "This is taking longer than I thought... I'm getting anxious!",
            "You're doing incredible work! I'm so grateful!"
          ],
          2: [
            "Yo, this is looking sick! I'm getting hyped!",
            "That color combo is fire! What else you got?",
            "Time's running out! How close are we to being done?",
            "I'm loving where this is going! This is going to be legendary!",
            "Can you make it more aggressive? I want to look intimidating!",
            "This is exactly what I was hoping for! You get it!",
            "We're cutting it close on time... but this looks worth it!",
            "You're killing it! This is going to be my signature look!"
          ],
          3: [
            "This is looking quite sophisticated. I'm impressed with your approach.",
            "The color palette is interesting... can we explore something more refined?",
            "Time is of the essence. How close are we to completion?",
            "I'm appreciating the direction this is taking. Very professional.",
            "Can we try something more avant-garde? I want to make a statement.",
            "This demonstrates excellent design sensibility. Well done.",
            "We're approaching the deadline... but quality over speed, of course.",
            "Your attention to detail is remarkable. This is exactly what I envisioned."
          ]
        };
        
        const levelFeedbacks = feedbacks[currentOrder.customer.level as keyof typeof feedbacks] || feedbacks[1];
        const randomFeedback = levelFeedbacks[Math.floor(Math.random() * levelFeedbacks.length)];
        addCustomerMessage(randomFeedback);
      }
    }, 20000); // Every 20 seconds
  }, [isGameActive, timeLeft, currentOrder, addCustomerMessage]);

  // Handle time running out
  const handleTimeUp = useCallback(() => {
    if (!currentOrder) return;
    
    setIsGameActive(false);
    setConversationState('completed');
    
    // Clear timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (messageUpdateRef.current) {
      clearInterval(messageUpdateRef.current);
      messageUpdateRef.current = null;
    }
    
    // Calculate satisfaction based on budget usage and time remaining
    const budgetUsed = currentOrder.budget - remainingBudget;
    const budgetEfficiency = (budgetUsed / currentOrder.budget) * 100; // How much of budget was used
    const timeEfficiency = (timeLeft / currentOrder.timeLimit) * 100; // How much time was left
    const changesEfficiency = (colorChanges / currentOrder.maxChanges) * 100; // How many changes were made
    
    // Satisfaction is based on balanced usage of budget, time, and changes
    const satisfaction = Math.round((budgetEfficiency * 0.4) + (timeEfficiency * 0.3) + (changesEfficiency * 0.3));
    
    let reaction = "";
    
    if (satisfaction >= 80) {
      reaction = currentOrder.customer.level === 1 ? 
        "OH MY GOSH! This is absolutely perfect! I'm going to look amazing on my first day! You're incredible! Thank you so much!" :
        currentOrder.customer.level === 2 ? 
        "YO! This is absolutely FIRE! I'm going to dominate the court in these! You're a legend! This is exactly what I needed!" :
        "This is exceptional work. You've exceeded my expectations and created something truly remarkable. This will make a perfect impression at the presentation. Outstanding job.";
    } else if (satisfaction >= 60) {
      reaction = currentOrder.customer.level === 1 ? 
        "This is really nice! I think this will work well for my first day. Thank you for your help!" :
        currentOrder.customer.level === 2 ? 
        "Not bad! This should work for the season. Thanks for putting in the effort!" :
        "This is acceptable work. It meets the basic requirements and should serve its purpose for the presentation.";
    } else if (satisfaction >= 40) {
      reaction = currentOrder.customer.level === 1 ? 
        "It's... okay. I guess this will have to do for now. Maybe I can upgrade later." :
        currentOrder.customer.level === 2 ? 
        "It's alright, I guess. Not exactly what I was hoping for, but it'll work." :
        "This is... adequate. It meets the minimum standards, though it lacks the sophistication I was hoping for.";
    } else {
      reaction = currentOrder.customer.level === 1 ? 
        "I'm not sure this is what I was looking for... I'm kind of disappointed. Maybe I should have been clearer about what I wanted." :
        currentOrder.customer.level === 2 ? 
        "This isn't really my style... I was hoping for something more aggressive. Maybe next time." :
        "This doesn't meet the professional standards I was expecting. I'm quite disappointed with the result.";
    }
    
    // Add satisfaction score to the reaction
    reaction += ` (Satisfaction: ${satisfaction}%)`;
    
    addCustomerMessage(reaction);
    
    // Calculate score based on satisfaction
    const newScore = Math.max(0, satisfaction * 2);
    
    setScore(prev => prev + newScore);
    onOrderComplete(newScore);
    
    // Check for level up
    if (satisfaction >= 80 && currentLevel < 3) {
      setTimeout(() => {
        addCustomerMessage(
          `Congratulations! You've been promoted to Level ${currentLevel + 1}! You're ready for more challenging customers.`,
          ["Awesome!", "What's next?"]
        );
        setCurrentLevel(prev => prev + 1);
      }, 2000);
    }
  }, [currentOrder, addCustomerMessage, onOrderComplete, timeLeft, remainingBudget, currentLevel]);

  // Timer countdown
  useEffect(() => {
    if (isGameActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && isGameActive) {
      handleTimeUp();
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isGameActive, timeLeft, handleTimeUp]);

  // Handle challenge completion
  const handleChallengeComplete = useCallback(() => {
    if (!isGameActive || !currentOrder) return;
    
    setIsGameActive(false);
    setConversationState('completed');
    
    // Clear timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (messageUpdateRef.current) {
      clearInterval(messageUpdateRef.current);
      messageUpdateRef.current = null;
    }
    
    // Calculate satisfaction based on budget usage and time remaining
    const budgetUsed = currentOrder.budget - remainingBudget;
    const budgetEfficiency = (budgetUsed / currentOrder.budget) * 100; // How much of budget was used
    const timeEfficiency = (timeLeft / currentOrder.timeLimit) * 100; // How much time was left
    const changesEfficiency = (colorChanges / currentOrder.maxChanges) * 100; // How many changes were made
    
    // Satisfaction is based on balanced usage of budget, time, and changes
    const satisfaction = Math.round((budgetEfficiency * 0.4) + (timeEfficiency * 0.3) + (changesEfficiency * 0.3));
    
    // Calculate score based on satisfaction
    const newScore = Math.max(0, satisfaction * 2);
    
    setScore(prev => prev + newScore);
    onOrderComplete(newScore);
    
    // Customer reaction
    let reaction = "";
    if (satisfaction >= 80) {
      reaction = currentOrder.customer.level === 1 ? 
        "I'm literally crying! This is beyond my wildest dreams! You're not just a designer, you're a magician! I'm going to be the best-dressed person at work!" :
        currentOrder.customer.level === 2 ? 
        "BRO! This is absolutely LEGENDARY! You just created a masterpiece! I'm going to be unstoppable in these! You're the GOAT!" :
        "This is absolutely extraordinary. You've created a masterpiece that perfectly captures my vision and exceeds all professional standards. This will undoubtedly make a profound impact at the presentation.";
    } else if (satisfaction >= 60) {
      reaction = currentOrder.customer.level === 1 ? 
        "This is amazing! I'm so happy with how it turned out! You really understood what I needed!" :
        currentOrder.customer.level === 2 ? 
        "This is sick! You really delivered! I'm going to look incredible in these!" :
        "This is excellent work. You've created something that perfectly aligns with my professional needs and aesthetic preferences.";
    } else if (satisfaction >= 40) {
      reaction = currentOrder.customer.level === 1 ? 
        "This is nice! I think it will work well for what I need. Thanks for your help!" :
        currentOrder.customer.level === 2 ? 
        "It's decent! Should work for the season. Appreciate the effort!" :
        "This is satisfactory work. It meets the basic requirements and should serve its intended purpose.";
    } else {
      reaction = currentOrder.customer.level === 1 ? 
        "It's okay... I guess this will have to do for now. Maybe I can find something better later." :
        currentOrder.customer.level === 2 ? 
        "It's alright... not exactly what I was hoping for, but it'll work." :
        "This is... adequate. It meets the minimum requirements, though it falls short of the excellence I was expecting.";
    }
    
    // Add satisfaction score to the reaction
    reaction += ` (Satisfaction: ${satisfaction}%)`;
    
    addCustomerMessage(reaction);
    
    // Check for level up
    if (newScore >= 100 && currentLevel < 3) {
      setTimeout(() => {
        addCustomerMessage(
          `Congratulations! You've been promoted to Level ${currentLevel + 1}! You're ready for more challenging customers.`,
          ["Awesome!", "What's next?"]
        );
        setCurrentLevel(prev => prev + 1);
      }, 2000);
    }
  }, [isGameActive, currentOrder, timeLeft, remainingBudget, addCustomerMessage, onOrderComplete, currentLevel]);

  // Start the conversation
  const startConversation = useCallback(() => {
    setMessages([]);
    setScore(0);
    setCurrentLevel(1);
    setConversationState('initial');
    startNewOrder();
  }, [startNewOrder]);

  // Store the handleColorChange function in the ref so it can be called from outside
  useEffect(() => {
    if (colorChangeRef) {
      colorChangeRef.current = handleColorChange;
    }
    return () => {
      if (colorChangeRef) {
        colorChangeRef.current = null;
      }
    };
  }, [handleColorChange, colorChangeRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (messageUpdateRef.current) {
        clearInterval(messageUpdateRef.current);
      }
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      left: 20,
      width: 350,
      maxHeight: '80vh',
      background: 'linear-gradient(145deg, #1a1a1a, #0f0f0f)',
      border: '1px solid rgba(255,105,180,0.2)',
      borderRadius: 16,
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      fontFamily: 'Inter, ui-sans-serif, system-ui'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ff69b4, #ffc0cb)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16
        }}>
          {currentOrder?.customer.avatar || '👨‍💼'}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>
            {currentOrder?.customer.name || 'Customer'}
          </div>
          <div style={{ fontSize: 10, opacity: 0.8 }}>
            {currentOrder?.customer.title || 'Sneaker Designer'}
          </div>
        </div>
      </div>

      {/* Budget & Stats */}
      {currentOrder && conversationState === 'active' && (
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          padding: '8px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 12
        }}>
          <div style={{ color: '#22c55e' }}>
            Budget: ${remainingBudget}
          </div>
          <div style={{ color: '#ff69b4' }}>
            Changes: {colorChanges}/{currentOrder.maxChanges}
          </div>
          <div style={{ color: '#3b82f6' }}>
            Cost: $10 per change
          </div>
        </div>
      )}

      {/* Timer */}
      {isGameActive && (
        <div style={{
          background: 'rgba(255,68,68,0.1)',
          padding: '8px 16px',
          borderBottom: '1px solid rgba(255,68,68,0.2)',
          textAlign: 'center',
          fontSize: 14,
          fontWeight: 700,
          color: '#ff4444'
        }}>
          ⏰ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      )}

      {/* Messages */}
      <div style={{
        flex: 1,
        padding: '12px 16px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}>
        {messages.map((message) => (
          <div key={message.id} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }}>
            <div style={{
              padding: '8px 12px',
              borderRadius: 12,
              background: message.type === 'customer' 
                ? 'rgba(255,105,180,0.1)' 
                : message.type === 'user'
                ? 'rgba(34,197,94,0.1)'
                : 'rgba(255,255,255,0.05)',
              border: `1px solid ${
                message.type === 'customer' 
                  ? '#ff69b4' 
                  : message.type === 'user'
                  ? '#22c55e'
                  : 'rgba(255,255,255,0.1)'
              }`,
              color: '#f8f8ff',
              fontSize: 13,
              lineHeight: 1.4,
              animation: 'slideIn 0.3s ease-out',
              marginLeft: message.type === 'user' ? '20px' : '0',
              marginRight: message.type === 'customer' ? '20px' : '0'
            }}>
              {message.text}
            </div>
            
            {/* Response buttons */}
            {message.responses && message.responses.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {message.responses.map((response, index) => (
                  <button
                    key={index}
                    onClick={() => handleUserResponse(response)}
                    style={{
                      background: 'linear-gradient(135deg, #ff69b4, #ffc0cb)',
                      color: '#0f0f0f',
                      border: 'none',
                      borderRadius: 8,
                      padding: '6px 12px',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,105,180,0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {response}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#ff69b4',
            fontSize: 12,
            fontStyle: 'italic'
          }}>
            <div style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff69b4, #ffc0cb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10
            }} />
            {currentOrder?.customer.name || 'Customer'} is typing...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Controls */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        gap: 8
      }}>
        {conversationState === 'initial' && (
          <button
            onClick={startConversation}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #ff69b4, #ffc0cb)',
              color: '#0f0f0f',
              border: 'none',
              borderRadius: 12,
              padding: '10px 16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,105,180,0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            🎮 Start Game
          </button>
        )}
        
        {conversationState === 'active' && (
          <button
            onClick={handleChallengeComplete}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 12,
              padding: '10px 16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(34,197,94,0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            ✅ Submit Design
          </button>
        )}
        
        {conversationState === 'completed' && (
          <button
            onClick={() => {
              setConversationState('initial');
              setTimeLeft(0);
              setCurrentOrder(null);
              setRemainingBudget(0);
              setColorChanges(0);
              if (messageUpdateRef.current) {
                clearInterval(messageUpdateRef.current);
              }
            }}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 12,
              padding: '10px 16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            👥 Next Customer
          </button>
        )}
      </div>
    </div>
  );
}
