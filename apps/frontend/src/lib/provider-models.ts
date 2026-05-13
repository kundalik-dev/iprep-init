export type ProviderKey = 'claude' | 'codex' | 'gemini' | 'ollama' | 'openrouter';

export type ProviderMode = 'CLI' | 'API_KEY';

export type ProviderModelOption = {
  id: string;
  label: string;
  description: string;
  recommended?: boolean;
};

export type ProviderOption = {
  key: ProviderKey;
  label: string;
  defaultMode: ProviderMode;
  supportedModes: ProviderMode[];
  defaultModelId: string;
  models: ProviderModelOption[];
};

export const PROVIDER_OPTIONS: ProviderOption[] = [
  {
    key: 'claude',
    label: 'Claude',
    defaultMode: 'CLI',
    supportedModes: ['CLI', 'API_KEY'],
    defaultModelId: 'claude-sonnet-4-20250514',
    models: [
      {
        id: 'claude-sonnet-4-20250514',
        label: 'Claude Sonnet 4',
        description: 'Default balanced Claude model for interviews and coaching.',
        recommended: true,
      },
      {
        id: 'claude-opus-4-1-20250805',
        label: 'Claude Opus 4.1',
        description: 'Highest-capability Claude option for deep analysis.',
      },
      {
        id: 'claude-3-5-haiku-20241022',
        label: 'Claude Haiku 3.5',
        description: 'Fast lower-cost option for lightweight coaching.',
      },
    ],
  },
  {
    key: 'codex',
    label: 'Codex',
    defaultMode: 'CLI',
    supportedModes: ['CLI', 'API_KEY'],
    defaultModelId: 'gpt-5.3-codex',
    models: [
      {
        id: 'gpt-5.3-codex',
        label: 'GPT-5.3-Codex',
        description: 'Default Codex model for agentic coding and technical practice.',
        recommended: true,
      },
      {
        id: 'gpt-5.2-codex',
        label: 'GPT-5.2-Codex',
        description: 'Strong fallback for long-horizon coding tasks.',
      },
      {
        id: 'gpt-5.1-codex',
        label: 'GPT-5.1-Codex',
        description: 'Lower-cost Codex fallback where available.',
      },
    ],
  },
  {
    key: 'gemini',
    label: 'Gemini',
    defaultMode: 'CLI',
    supportedModes: ['CLI', 'API_KEY'],
    defaultModelId: 'gemini-2.5-flash',
    models: [
      {
        id: 'gemini-2.5-flash',
        label: 'Gemini 2.5 Flash',
        description: 'Default price-performance model for coaching and interview flows.',
        recommended: true,
      },
      {
        id: 'gemini-2.5-pro',
        label: 'Gemini 2.5 Pro',
        description: 'Higher-capability reasoning model for deeper analysis.',
      },
      {
        id: 'gemini-2.5-flash-lite',
        label: 'Gemini 2.5 Flash-Lite',
        description: 'Fastest, cost-efficient Gemini option.',
      },
    ],
  },
  {
    key: 'ollama',
    label: 'Ollama',
    defaultMode: 'API_KEY',
    supportedModes: ['API_KEY'],
    defaultModelId: 'qwen3',
    models: [
      {
        id: 'qwen3',
        label: 'Qwen3',
        description: 'Default local model option with broad reasoning coverage.',
        recommended: true,
      },
      {
        id: 'gpt-oss',
        label: 'GPT-OSS',
        description: 'OpenAI open-weight local model family for agentic tasks.',
      },
      {
        id: 'llama3.3',
        label: 'Llama 3.3',
        description: 'Large multilingual local chat model.',
      },
    ],
  },
  {
    key: 'openrouter',
    label: 'OpenRouter',
    defaultMode: 'API_KEY',
    supportedModes: ['API_KEY'],
    defaultModelId: 'anthropic/claude-sonnet-4',
    models: [
      {
        id: 'anthropic/claude-sonnet-4',
        label: 'Claude Sonnet 4',
        description: 'Default OpenRouter route for general coaching quality.',
        recommended: true,
      },
      {
        id: 'google/gemini-2.5-flash',
        label: 'Gemini 2.5 Flash',
        description: 'Price-performance fallback through OpenRouter.',
      },
      {
        id: 'openai/gpt-5.2',
        label: 'GPT-5.2',
        description: 'OpenAI frontier model option through OpenRouter when available.',
      },
    ],
  },
];

export const DEFAULT_PROVIDER_KEY: ProviderKey = 'claude';

export const getProviderOption = (providerKey: ProviderKey) =>
  PROVIDER_OPTIONS.find((provider) => provider.key === providerKey);
