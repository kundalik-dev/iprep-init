import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bot,
  Check,
  Clock,
  FileText,
  Mic,
  MicOff,
  Rocket,
  Sparkles,
  Square,
  UserRound,
} from 'lucide-react';
import type { ViewId } from '@/config/navigation';
import { cn } from '@/lib/utils';

type InterviewPackage = {
  slug: string;
  name: string;
  type: string;
  icon: typeof FileText;
  difficulty: string;
  duration: number;
  description: string;
  topics: string[];
  questionCount: number;
  isPro: boolean;
};

type InterviewTutor = {
  slug: string;
  name: string;
  initials: string;
  color: string;
  specialty: string;
  personality: string[];
  description: string;
  sessionCount: number;
  avgScore: number;
  isPro: boolean;
};

type TranscriptTurn = {
  speaker: 'ai' | 'user';
  text: string;
};

type InterviewScreenProps = {
  activeView: Extract<ViewId, 'new-interview' | 'session'>;
  setActiveView: (view: ViewId) => void;
};

const interviewPackages: InterviewPackage[] = [
  {
    slug: 'behavioral',
    name: 'Behavioral Interview',
    type: 'behavioral',
    icon: UserRound,
    difficulty: 'Medium',
    duration: 30,
    description:
      'Practice STAR stories for leadership, conflict, teamwork, failure, and measurable impact.',
    topics: ['Leadership', 'Conflict', 'Teamwork', 'Growth'],
    questionCount: 10,
    isPro: false,
  },
  {
    slug: 'technical',
    name: 'Technical Screen',
    type: 'technical',
    icon: FileText,
    difficulty: 'Hard',
    duration: 45,
    description:
      'Cover programming judgment, APIs, data modeling, debugging, and architecture fundamentals.',
    topics: ['OOP', 'REST APIs', 'SQL', 'Debugging'],
    questionCount: 8,
    isPro: false,
  },
  {
    slug: 'dsa',
    name: 'DSA Deep Dive',
    type: 'dsa',
    icon: Sparkles,
    difficulty: 'Hard',
    duration: 60,
    description:
      'Work through algorithm prompts with complexity analysis, edge cases, and trade-off pressure.',
    topics: ['Arrays', 'Trees', 'Dynamic Programming', 'Two Pointers'],
    questionCount: 5,
    isPro: false,
  },
  {
    slug: 'hr-round',
    name: 'HR Round',
    type: 'hr',
    icon: Bot,
    difficulty: 'Easy',
    duration: 20,
    description:
      'Rehearse culture fit, compensation expectations, career goals, and notice period answers.',
    topics: ['Culture Fit', 'Salary', 'Career Goals', 'Expectations'],
    questionCount: 8,
    isPro: false,
  },
  {
    slug: 'product-manager',
    name: 'Product Manager',
    type: 'product',
    icon: FileText,
    difficulty: 'Hard',
    duration: 50,
    description:
      'Sharpen product sense, prioritization, stakeholder reasoning, and metrics decisions.',
    topics: ['Product Sense', 'Metrics', 'Roadmaps', 'Trade-offs'],
    questionCount: 6,
    isPro: true,
  },
  {
    slug: 'system-design',
    name: 'System Design',
    type: 'system-design',
    icon: Sparkles,
    difficulty: 'Expert',
    duration: 60,
    description:
      'Design scalable systems with caching, load balancing, data storage, and observability.',
    topics: ['Scale', 'Caching', 'Storage', 'Reliability'],
    questionCount: 3,
    isPro: true,
  },
];

const interviewTutors: InterviewTutor[] = [
  {
    slug: 'alex',
    name: 'Alex Chen',
    initials: 'AC',
    color: '#3B82F6',
    specialty: 'Technical & DSA',
    personality: ['Direct', 'Analytical', 'Challenge-driven'],
    description:
      'Pushes for clean reasoning, big-O clarity, edge cases, and implementation discipline.',
    sessionCount: 142,
    avgScore: 84,
    isPro: false,
  },
  {
    slug: 'priya',
    name: 'Priya Sharma',
    initials: 'PS',
    color: '#10B981',
    specialty: 'Behavioral & HR',
    personality: ['Supportive', 'Structured', 'Detail-oriented'],
    description:
      'Coaches concise STAR stories that connect ownership, collaboration, and measurable outcomes.',
    sessionCount: 198,
    avgScore: 88,
    isPro: false,
  },
  {
    slug: 'morgan',
    name: 'Morgan Blake',
    initials: 'MB',
    color: '#8B5CF6',
    specialty: 'System Design & Product',
    personality: ['Strategic', 'Precise', 'Industry-focused'],
    description:
      'Tests depth on trade-offs, product intuition, operational thinking, and scale constraints.',
    sessionCount: 89,
    avgScore: 91,
    isPro: true,
  },
];

const transcriptDemo: TranscriptTurn[] = [
  {
    speaker: 'ai',
    text: 'Let us start with context. Tell me about the role and interview style you want to prepare for.',
  },
  {
    speaker: 'user',
    text: 'I am preparing for a senior frontend role with a mix of React architecture and behavioral questions.',
  },
  {
    speaker: 'ai',
    text: 'Good. First question: describe a time you improved a user-facing workflow without increasing complexity.',
  },
  {
    speaker: 'user',
    text: 'In my last project I simplified an onboarding flow by reducing duplicated steps and moving validation earlier.',
  },
  {
    speaker: 'ai',
    text: 'Now quantify the result. What changed for users or for the team after that decision?',
  },
];

// Formats elapsed seconds into a compact session timer label.
function formatTimer(seconds: number) {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

// Renders the package selection card icon from package metadata.
function PackageIcon({ pkg }: { pkg: InterviewPackage }) {
  const Icon = pkg.icon;
  return (
    <span className="pkg-icon">
      <Icon size={24} strokeWidth={2} />
    </span>
  );
}

// Renders the full new-interview wizard and live session route.
export function InterviewScreen({ activeView, setActiveView }: InterviewScreenProps) {
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedPackageSlug, setSelectedPackageSlug] = useState('behavioral');
  const [selectedTutorSlug, setSelectedTutorSlug] = useState('priya');
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [sessionMicOn, setSessionMicOn] = useState(true);
  const [transcriptIndex, setTranscriptIndex] = useState(2);
  const [sessionNotice, setSessionNotice] = useState('Your prep notes are loaded as interview context.');

  const selectedPackage = useMemo(
    () => interviewPackages.find((pkg) => pkg.slug === selectedPackageSlug) ?? interviewPackages[0],
    [selectedPackageSlug],
  );
  const selectedTutor = useMemo(
    () => interviewTutors.find((tutor) => tutor.slug === selectedTutorSlug) ?? interviewTutors[0],
    [selectedTutorSlug],
  );
  const visibleTranscript = transcriptDemo.slice(0, transcriptIndex);

  useEffect(() => {
    if (activeView !== 'session') {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setSessionSeconds((current) => current + 1);
    }, 1000);
    const transcriptTimer = window.setInterval(() => {
      setTranscriptIndex((current) => Math.min(current + 1, transcriptDemo.length));
    }, 3500);

    return () => {
      window.clearInterval(timer);
      window.clearInterval(transcriptTimer);
    };
  }, [activeView]);

  if (activeView === 'session') {
    return (
      <div className="session-view">
        <div className="session-topbar">
          <div className="session-info">
            <div className="session-pkg-badge">
              <selectedPackage.icon size={16} strokeWidth={2} />
              {selectedPackage.name}
            </div>
            <div className="session-tutor">
              <div className="session-tutor-av" style={{ background: selectedTutor.color }}>
                {selectedTutor.initials}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-s)' }}>
                {selectedTutor.name}
              </span>
            </div>
            <span className="badge badge-success">LIVE</span>
          </div>
          <div className="session-timer-val">{formatTimer(sessionSeconds)}</div>
          <button
            className="btn btn-danger"
            onClick={() => {
              setSessionNotice('Session ended. Analysis generation is simulated for this UI pass.');
              setWizardStep(1);
              setSessionSeconds(0);
              setTranscriptIndex(2);
              setActiveView('new-interview');
            }}
          >
            <Square size={14} strokeWidth={2} /> End Session
          </button>
        </div>

        <div className="session-body">
          <div className="session-stage">
            <div className={cn('waveform', sessionMicOn && 'active')} aria-hidden="true">
              {Array.from({ length: 12 }).map((_, index) => (
                <div className="wf-bar" key={index} />
              ))}
            </div>
            <div className="session-status-text">
              <strong>{visibleTranscript.at(-1)?.speaker === 'user' ? 'You' : selectedTutor.name}</strong>{' '}
              {visibleTranscript.at(-1)?.speaker === 'user' ? 'are responding' : 'is speaking'}
            </div>
            <div className="session-controls">
              <button
                className={cn('mic-btn', sessionMicOn ? 'active' : 'muted')}
                title={sessionMicOn ? 'Mute microphone' : 'Unmute microphone'}
                onClick={() => setSessionMicOn((current) => !current)}
              >
                {sessionMicOn ? <Mic size={19} strokeWidth={2} /> : <MicOff size={19} strokeWidth={2} />}
              </button>
              <span style={{ fontSize: 12, color: 'var(--text-m)' }}>
                {sessionMicOn ? 'Mic On' : 'Mic Off'}
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-m)', textAlign: 'center', maxWidth: 320 }}>
              {sessionNotice}
            </div>
          </div>

          <div className="transcript-panel">
            <div className="transcript-header">
              <div className="transcript-live-dot" />
              Live Transcript
            </div>
            <div className="transcript-scroll">
              {visibleTranscript.map((turn, index) => (
                <div className="transcript-turn" key={`${turn.speaker}-${index}`}>
                  <span className={cn('tt-speaker', turn.speaker)}>
                    {turn.speaker === 'ai' ? selectedTutor.name : 'You'}
                  </span>
                  <div className={cn('tt-text', turn.speaker)}>{turn.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const canContinue =
    (wizardStep === 1 && Boolean(selectedPackageSlug)) ||
    (wizardStep === 2 && Boolean(selectedTutorSlug));

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">New Interview</div>
          <div className="page-subtitle">Configure your mock interview session</div>
        </div>
      </div>

      <div className="page-body">
        <div className="wizard-wrap">
          <div className="step-indicator">
            {['Choose Package', 'Choose Tutor', 'Review & Start'].map((name, index) => {
              const step = index + 1;
              return (
                <div className="step-item" key={name}>
                  <div
                    className={cn(
                      'step-dot',
                      wizardStep > step && 'done',
                      wizardStep === step && 'active',
                    )}
                  >
                    {wizardStep > step ? <Check size={15} strokeWidth={2.5} /> : step}
                  </div>
                  <div className="step-info">
                    <div className="step-num">Step {step}</div>
                    <div className="step-name">{name}</div>
                  </div>
                  {step < 3 && <div className={cn('step-line', wizardStep > step && 'done')} />}
                </div>
              );
            })}
          </div>

          {wizardStep === 1 && (
            <>
              <div className="section-title mb-4">Select an interview package</div>
              <div className="pkg-grid">
                {interviewPackages.map((pkg) => (
                  <button
                    className={cn('pkg-card', selectedPackageSlug === pkg.slug && 'selected')}
                    key={pkg.slug}
                    onClick={() => setSelectedPackageSlug(pkg.slug)}
                  >
                    {pkg.isPro && (
                      <span className="badge badge-pro" style={{ position: 'absolute', top: 10, right: 10 }}>
                        PRO
                      </span>
                    )}
                    <PackageIcon pkg={pkg} />
                    <div className="pkg-name">{pkg.name}</div>
                    <div className="pkg-desc">{pkg.description}</div>
                    <div className="pkg-meta">
                      <span className="badge badge-muted">{pkg.difficulty}</span>
                      <span className="badge badge-muted">{pkg.duration}m</span>
                      <span className="badge badge-muted">{pkg.questionCount}Q</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {wizardStep === 2 && (
            <>
              <div className="section-title mb-4">Choose your AI tutor</div>
              <div className="tutor-grid">
                {interviewTutors.map((tutor) => (
                  <button
                    className={cn('tutor-card', selectedTutorSlug === tutor.slug && 'selected')}
                    key={tutor.slug}
                    onClick={() => setSelectedTutorSlug(tutor.slug)}
                  >
                    {tutor.isPro && (
                      <span className="badge badge-pro" style={{ position: 'absolute', top: 10, right: 10 }}>
                        PRO
                      </span>
                    )}
                    <div className="tutor-avatar" style={{ background: tutor.color }}>
                      {tutor.initials}
                    </div>
                    <div className="tutor-name">{tutor.name}</div>
                    <div className="tutor-spec">{tutor.specialty}</div>
                    <div className="tutor-tags">
                      {tutor.personality.map((trait) => (
                        <span className="tutor-tag" key={trait}>
                          {trait}
                        </span>
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-m)', marginBottom: 12, lineHeight: 1.5 }}>
                      {tutor.description}
                    </div>
                    <div className="tutor-stats">
                      <div style={{ textAlign: 'center' }}>
                        <div className="tutor-stat-val">{tutor.avgScore}</div>
                        <div className="tutor-stat-label">Avg Score</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div className="tutor-stat-val">{tutor.sessionCount}</div>
                        <div className="tutor-stat-label">Sessions</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {wizardStep === 3 && (
            <>
              <div className="section-title mb-4">Review your selection</div>
              <div className="review-card">
                <div className="review-item">
                  <div className="review-icon">
                    <selectedPackage.icon size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <div className="review-label">Interview Package</div>
                    <div className="review-val">{selectedPackage.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-m)', marginTop: 3 }}>
                      {selectedPackage.description}
                    </div>
                  </div>
                </div>
                <div className="review-item">
                  <div className="review-icon" style={{ background: `${selectedTutor.color}20` }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: selectedTutor.color }}>
                      {selectedTutor.initials}
                    </span>
                  </div>
                  <div>
                    <div className="review-label">AI Tutor</div>
                    <div className="review-val">{selectedTutor.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-m)', marginTop: 3 }}>
                      {selectedTutor.specialty}
                    </div>
                  </div>
                </div>
                <div className="review-item">
                  <div className="review-icon">
                    <Clock size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <div className="review-label">Estimated Duration</div>
                    <div className="review-val">{selectedPackage.duration} minutes</div>
                  </div>
                </div>
                <div className="review-item">
                  <div className="review-icon">
                    <Mic size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <div className="review-label">Mode</div>
                    <div className="review-val">Voice Interview</div>
                  </div>
                </div>
                <div className="review-item">
                  <div className="review-icon">
                    <FileText size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <div className="review-label">Questions</div>
                    <div className="review-val">{selectedPackage.questionCount} questions</div>
                  </div>
                </div>
              </div>
              <div className="files-context-banner" style={{ marginTop: 16 }}>
                <FileText size={15} strokeWidth={2} />
                <span>
                  <strong>Context ready:</strong> markdown notes, resume details, and recent session history
                  are included in this mock setup.
                </span>
              </div>
            </>
          )}

          <div className="wizard-footer">
            <button
              className="btn btn-secondary"
              onClick={() => (wizardStep > 1 ? setWizardStep((step) => step - 1) : setActiveView('dashboard'))}
            >
              {wizardStep > 1 ? <ArrowLeft size={14} strokeWidth={2} /> : null}
              {wizardStep > 1 ? 'Back' : 'Cancel'}
            </button>
            {wizardStep < 3 ? (
              <button
                className="btn btn-primary"
                disabled={!canContinue}
                onClick={() => setWizardStep((step) => Math.min(step + 1, 3))}
              >
                Continue
              </button>
            ) : (
              <button
                className="btn btn-primary btn-lg"
                onClick={() => {
                  setSessionNotice('Your prep notes are loaded as interview context.');
                  setSessionSeconds(0);
                  setTranscriptIndex(2);
                  setSessionMicOn(true);
                  setActiveView('session');
                }}
              >
                <Rocket size={16} strokeWidth={2} /> Start Interview
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
