// Chat API functions
const API_BASE = '/api/v1';
const HEADERS = { 'Content-Type': 'application/json' };

export type ChatMessage = {
  id: string;
  role: 'AI' | 'USER';
  content: string;
  sentAt: string;
  createdAt: string;
  updatedAt: string;
  chatId: string;
  relatedInterviewId?: string | null;
};

export type Conversation = {
  id: string;
  title: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  messages?: ChatMessage[];
  usedNotes?: Array<{
    id: string;
    title?: string;
  }>;
};

export type InterviewPlan = {
  id: string;
  type: string;
  difficulty: string;
  durationMin: number;
  mode: string;
  tutorStyle: string;
  topics: string[];
  questionPlan: unknown[];
};

export async function listConversations(): Promise<Conversation[]> {
  const response = await fetch(`${API_BASE}/conversations`);
  if (!response.ok) throw new Error('Failed to fetch conversations');
  const json = await response.json();
  return json.data;
}

export async function getConversation(id: string): Promise<Conversation> {
  const response = await fetch(`${API_BASE}/conversations/${id}`);
  if (!response.ok) throw new Error('Failed to fetch conversation');
  const json = await response.json();
  return json.data;
}

export async function createConversation(
  title: string,
  documentIds?: string[],
): Promise<Conversation> {
  const response = await fetch(`${API_BASE}/conversations`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ title, documentIds }),
  });
  if (!response.ok) throw new Error('Failed to create conversation');
  const json = await response.json();
  return json.data;
}

export async function addMessage(
  conversationId: string,
  text: string,
  contextDocumentIds?: string[],
): Promise<{ userMessage: ChatMessage; aiMessage: ChatMessage }> {
  const response = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ text, contextDocumentIds }),
  });
  if (!response.ok) throw new Error('Failed to add message');
  const json = await response.json();
  return json.data;
}

export async function updateConversation(id: string, title: string): Promise<Conversation> {
  const response = await fetch(`${API_BASE}/conversations/${id}`, {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify({ title }),
  });
  if (!response.ok) throw new Error('Failed to update conversation');
  const json = await response.json();
  return json.data;
}

export async function deleteConversation(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/conversations/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete conversation');
}

export async function createInterviewPlan(id: string): Promise<InterviewPlan> {
  const response = await fetch(`${API_BASE}/conversations/${id}/interview-plan`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to create interview plan');
  const json = await response.json();
  return json.data;
}
