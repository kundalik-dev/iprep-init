import { Plus, SendHorizonal } from 'lucide-react';

type Conversation = {
  id: string;
  title: string;
  preview: string;
  time: string;
  group: 'today' | 'earlier';
};

const conversations: Conversation[] = [
  {
    id: 'last-session',
    title: 'How did my last session go?',
    preview: 'Your most recent session was Behavior...',
    time: '10:16 am',
    group: 'today',
  },
  {
    id: 'behavioral-review',
    title: 'Behavioral session review',
    preview: 'Based on your last 3 sessions, here are...',
    time: '6 May',
    group: 'earlier',
  },
  {
    id: 'dsa-strategy',
    title: 'DSA improvement strategy',
    preview: 'DSA Performance — 2 sessions, avg 6...',
    time: '5 May',
    group: 'earlier',
  },
  {
    id: 'system-design',
    title: 'System design gaps',
    preview: 'System Design — 7.5/10 with Morgan: Y...',
    time: '4 May',
    group: 'earlier',
  },
];

export function ChatScreen() {
  const today = conversations.filter((conversation) => conversation.group === 'today');
  const earlier = conversations.filter((conversation) => conversation.group === 'earlier');

  return (
    <div className="chat-layout view-enter">
      <aside className="chat-sidebar">
        <ConversationGroup label="Today" conversations={today} activeId="last-session" />
        <ConversationGroup label="Earlier" conversations={earlier} activeId="last-session" />
      </aside>

      <section className="chat-main">
        <header className="chat-header">
          <div>
            <div className="chat-title">iPrep AI Assistant</div>
            <div className="chat-meta">Ask anything about your interview prep</div>
          </div>
          <button className="btn btn-primary btn-sm chat-new-btn">
            <Plus size={14} /> New Chat
          </button>
        </header>

        <div className="chat-messages">
          <div className="message user">
            <div className="msg-avatar user">K</div>
            <div className="msg-body">
              <div className="msg-bubble">How did my last session go?</div>
              <div className="msg-time">10:16 am</div>
            </div>
          </div>

          <div className="message ai">
            <div className="msg-avatar ai">iP</div>
            <div className="msg-body">
              <div className="msg-bubble">
                <p>
                  Your most recent session was <strong>Behavioral with Priya</strong> on 6 May
                  2026.
                </p>
                <p>
                  <strong>Overall Score: 8.2/10</strong>
                </p>
                <p>
                  <strong>Score breakdown:</strong>
                  <br />
                  - Communication: 9/10
                  <br />
                  - Technical: 6/10
                  <br />
                  - Problem Solving: 8/10
                  <br />
                  - Confidence: 8/10
                </p>
                <p>
                  <strong>Top strength:</strong> Excellent use of STAR method throughout all
                  answers
                </p>
                <p>
                  <strong>Key improvement:</strong> Quantify impact more - 'increased efficiency'
                  needs a number
                </p>
                <p>Want the full analysis or tips on what to practice next?</p>
              </div>
              <div className="msg-actions">
                <button className="msg-action-btn">View Full Analysis</button>
                <button className="msg-action-btn">What to Practice Next</button>
              </div>
              <div className="msg-time">10:18 am</div>
            </div>
          </div>
        </div>

        <form className="chat-input-area">
          <div className="chat-input-row">
            <textarea
              className="chat-input"
              placeholder="Ask about your sessions, get tips, or start a new interview..."
              rows={1}
            />
            <button className="btn btn-primary chat-send-btn" type="button" aria-label="Send message">
              <SendHorizonal size={18} />
            </button>
          </div>
          <div className="chat-input-footnote">Stored in local database · Powered by iPrep AI</div>
        </form>
      </section>
    </div>
  );
}

function ConversationGroup({
  label,
  conversations,
  activeId,
}: {
  label: string;
  conversations: Conversation[];
  activeId: string;
}) {
  return (
    <div className="conv-group">
      <div className="conv-group-label">{label}</div>
      {conversations.map((conversation) => (
        <button
          className={`conv-item ${conversation.id === activeId ? 'active' : ''}`}
          key={conversation.id}
          type="button"
        >
          <div className="conv-item-title">{conversation.title}</div>
          <div className="conv-item-meta">{conversation.preview}</div>
          <div className="conv-item-time">{conversation.time}</div>
        </button>
      ))}
    </div>
  );
}
