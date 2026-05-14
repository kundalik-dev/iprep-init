import { useCallback, useEffect, useState, useRef } from 'react';
import { Loader2, MessageCircle, Plus, SendHorizonal, Sparkles, Trash2 } from 'lucide-react';
import {
  listConversations,
  getConversation,
  createConversation,
  addMessage,
  deleteConversation,
  type Conversation,
  type ChatMessage,
} from './api';

export function ChatScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    try {
      const data = await listConversations();
      setConversations(data);
      setActiveConversation((current) => current ?? data[0] ?? null);
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  }, []);

  const loadMessages = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const chat = await getConversation(id);
      setActiveConversation(chat);
      setMessages(chat.messages || []);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadConversations(), 0);
    return () => window.clearTimeout(timer);
  }, [loadConversations]);

  useEffect(() => {
    if (activeConversation?.id) {
      const timer = window.setTimeout(() => void loadMessages(activeConversation.id), 0);
      return () => window.clearTimeout(timer);
    }
  }, [activeConversation?.id, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  async function handleNewChat() {
    try {
      const newChat = await createConversation('New Conversation');
      setConversations([newChat, ...conversations]);
      setActiveConversation(newChat);
    } catch (err) {
      console.error('Failed to create conversation', err);
    }
  }

  async function handleDeleteChat(id: string) {
    try {
      await deleteConversation(id);
      setConversations(conversations.filter(c => c.id !== id));
      if (activeConversation?.id === id) {
        setActiveConversation(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to delete conversation', err);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    let chatId = activeConversation?.id;
    if (!chatId) {
      const newChat = await createConversation(inputText.slice(0, 30) + '...');
      setConversations([newChat, ...conversations]);
      setActiveConversation(newChat);
      chatId = newChat.id;
    }

    const textToSend = inputText;
    setInputText('');
    setIsSending(true);

    try {
      const result = await addMessage(chatId, textToSend);
      setMessages(prev => [...prev, result.userMessage, result.aiMessage]);
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setIsSending(false);
    }
  }

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="chat-layout view-enter">
      <aside className="chat-sidebar">
        <div className="conv-group">
          <div className="conv-group-label">
            <span>Recent Chats</span>
          </div>
          {conversations.length === 0 && (
            <div className="chat-empty-sidebar">
              <div className="chat-empty-sidebar-icon">
                <MessageCircle size={16} />
              </div>
              <div className="chat-empty-sidebar-title">No conversations yet</div>
              <div className="chat-empty-sidebar-copy">Ask a question to create your first chat.</div>
            </div>
          )}
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`conv-item ${conversation.id === activeConversation?.id ? 'active' : ''}`}
            >
              <button
                type="button"
                className="conv-item-inner"
                onClick={() => setActiveConversation(conversation)}
              >
                <div className="conv-item-title">{conversation.title}</div>
                <div className="conv-item-time">{formatTime(conversation.lastMessageAt || conversation.createdAt)}</div>
              </button>
              <button 
                className="conv-delete-btn"
                onClick={(e) => { e.stopPropagation(); handleDeleteChat(conversation.id); }}
                title="Delete Chat"
                type="button"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </aside>

      <section className="chat-main">
        <header className="chat-header">
          <div>
            <div className="chat-title">{activeConversation?.title || 'iPrep AI Assistant'}</div>
            <div className="chat-meta">Ask anything about your interview prep</div>
          </div>
          <button className="btn btn-primary btn-sm chat-new-btn" onClick={handleNewChat}>
            <Plus size={14} /> New Chat
          </button>
        </header>

        <div className="chat-messages">
          {isLoading ? (
            <div className="chat-loading-state">
              <Loader2 className="animate-spin" size={24} /> Loading conversation...
            </div>
          ) : messages.length === 0 ? (
            <EmptyChatState />
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.role.toLowerCase()}`}>
                <div className={`msg-avatar ${msg.role.toLowerCase()}`}>
                  {msg.role === 'USER' ? 'U' : 'iP'}
                </div>
                <div className="msg-body">
                  <div className="msg-bubble" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                  <div className="msg-time">{formatTime(msg.sentAt)}</div>
                </div>
              </div>
            ))
          )}
          {isSending && (
            <div className="message ai">
              <div className="msg-avatar ai">iP</div>
              <div className="msg-body">
                <div className="msg-bubble">
                  <Loader2 className="animate-spin" size={16} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-area" onSubmit={handleSendMessage}>
          <div className="chat-input-row">
            <input
              type="text"
              className="chat-input"
              placeholder="Ask about your sessions, get tips, or start a new interview..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isSending}
            />
            <button className="btn btn-primary chat-send-btn" type="submit" aria-label="Send message" disabled={isSending || !inputText.trim()}>
              <SendHorizonal size={18} />
            </button>
          </div>
          <div className="chat-input-footnote">Stored in local database · Powered by iPrep AI</div>
        </form>
      </section>
    </div>
  );
}

function EmptyChatState() {
  return (
    <div className="chat-empty-state">
      <div className="chat-empty-card">
        <div className="chat-empty-icon">
          <Sparkles size={22} />
        </div>
        <div className="chat-empty-title">Start with your iPrep assistant</div>
        <div className="chat-empty-copy">
          Ask about recent sessions, weak spots, practice plans, or how to use your notes as
          interview context.
        </div>
        <div className="chat-prompt-grid">
          <button type="button">Review my last interview</button>
          <button type="button">What should I practice next?</button>
          <button type="button">Make a 25 minute prep plan</button>
        </div>
      </div>
    </div>
  );
}
