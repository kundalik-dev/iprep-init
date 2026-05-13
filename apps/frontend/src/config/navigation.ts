import { BarChart3, Bot, FolderOpen, History, Mic, Play } from 'lucide-react';
import type { ComponentType } from 'react';

export type ViewId =
  | 'dashboard'
  | 'new-interview'
  | 'history'
  | 'chat'
  | 'files'
  | 'communication'
  | 'settings';

export type NavItem = {
  id: ViewId;
  label: string;
  icon: ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  badge?: string;
};

export const practiceNav: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'new-interview', label: 'New Interview', icon: Play, badge: 'Start' },
  { id: 'history', label: 'History', icon: History },
];

export const toolNav: NavItem[] = [
  { id: 'chat', label: 'AI Coach', icon: Bot },
  { id: 'files', label: 'Notes & Files', icon: FolderOpen },
  { id: 'communication', label: 'Communication', icon: Mic },
];
