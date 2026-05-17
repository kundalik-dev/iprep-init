export const type = 'codex_local';
export const label = 'Codex Local';

export const models = [
  { id: 'gpt-5.3-codex', label: 'GPT-5.3 Codex' },
  { id: 'gpt-5.2-codex', label: 'GPT-5.2 Codex' },
  { id: 'gpt-5.1-codex', label: 'GPT-5.1 Codex' },
];

export const agentConfigurationDoc = `# codex_local configuration
Runs OpenAI Codex CLI locally for iPrep chat.

Core fields:
- cwd: absolute working directory for Codex.
- command: optional CLI command, defaults to codex or codex.cmd on Windows.
- model: optional Codex model.
- timeoutSec: optional process timeout.

Session persistence:
- First run starts codex exec.
- Later runs resume with codex exec resume <sessionId>.
`;

export { createServerAdapter } from './server/index.js';
