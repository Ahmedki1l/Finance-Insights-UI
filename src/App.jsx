import { useState, useCallback, useRef, useEffect } from 'react'
import { ConversationProvider, useConversation } from './contexts/ConversationContext'
import Sidebar from './components/Sidebar/Sidebar'
import Header from './components/Header/Header'
import ChatContainer from './components/ChatContainer'
import ChatInput from './components/ChatInput'
import './App.css'

const API_URL = 'http://localhost:8000/api/chat/stream'

function ChatApp() {
  const { 
    messages, 
    currentConversationId, 
    addMessage, 
    updateMessage,
    createConversation 
  } = useConversation()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const typingIntervalRef = useRef(null)

  // Typing animation effect - animates displayedAnswer to match answer
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (!lastMessage || lastMessage.role !== 'bot') return
    
    const { answer, displayedAnswer, isStreaming, id } = lastMessage
    
    // If there's more text to display
    if (answer && displayedAnswer !== answer && isStreaming) {
      // Clear any existing interval
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current)
      }
      
      // Animate characters one by one
      let currentIndex = displayedAnswer ? displayedAnswer.length : 0
      
      typingIntervalRef.current = setInterval(() => {
        if (currentIndex < answer.length) {
          const nextChars = answer.slice(0, currentIndex + 1)
          updateMessage(id, { displayedAnswer: nextChars })
          currentIndex++
        } else {
          clearInterval(typingIntervalRef.current)
        }
      }, 15) // 15ms per character for smooth typing
      
      return () => {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current)
        }
      }
    }
    
    // When streaming stops, ensure full text is shown
    if (!isStreaming && answer && displayedAnswer !== answer) {
      updateMessage(id, { displayedAnswer: answer })
    }
  }, [messages, updateMessage])

  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || isLoading) return

    // Clear any ongoing typing animation
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current)
    }

    // Auto-create conversation if none exists
    let convId = currentConversationId
    if (!convId) {
      const newConv = createConversation('New Chat')
      convId = newConv.id
    }

    // Add user message
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString()
    }
    addMessage(userMessage)
    setIsLoading(true)

    // Create bot message placeholder - starts in "thinking" state
    const botMessageId = `bot-${Date.now()}`
    const botMessage = {
      id: botMessageId,
      role: 'bot',
      answer: '',
      displayedAnswer: '',
      chart: null,
      table: null,
      evidence: null,
      isStreaming: false,
      isThinking: true,
      timestamp: new Date().toISOString()
    }
    addMessage(botMessage)

    try {
      // Build conversation history for context (last 10 turns max)
      const conversationHistory = messages
        .slice(-20) // Get last 20 messages (10 user + 10 bot max)
        .filter(msg => msg.role === 'user' || (msg.role === 'bot' && msg.answer))
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.role === 'user' ? msg.content : msg.answer
        }))

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: content.trim(),
          conversation_history: conversationHistory
        })
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              switch (data.type) {
                case 'text':
                  updateMessage(botMessageId, { 
                    answer: data.data,
                    isThinking: false,
                    isStreaming: true
                  })
                  break
                case 'table':
                  updateMessage(botMessageId, { table: data.data })
                  break
                case 'chart':
                  updateMessage(botMessageId, { chart: data.data })
                  break
                case 'evidence':
                  updateMessage(botMessageId, { evidence: data.data })
                  break
                case 'done':
                  updateMessage(botMessageId, { 
                    isStreaming: false, 
                    isThinking: false
                  })
                  break
                default:
                  break
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error)
      updateMessage(botMessageId, {
        answer: 'Sorry, a connection error occurred. Please try again.',
        displayedAnswer: 'Sorry, a connection error occurred. Please try again.',
        isStreaming: false,
        isThinking: false,
        isError: true
      })
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, currentConversationId, addMessage, updateMessage, createConversation])

  return (
    <div className="app-layout">
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="main-area">
        <Header 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          isSidebarOpen={isSidebarOpen}
        />
        
        <main className="main-content">
          <ChatContainer messages={messages} onDrillDown={sendMessage} />
          <ChatInput onSend={sendMessage} disabled={isLoading} />
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <ConversationProvider>
      <ChatApp />
    </ConversationProvider>
  )
}

export default App
