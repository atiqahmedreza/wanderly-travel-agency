import { spawn } from 'node:child_process';

const port = process.env.PORT || '3000';
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const child = spawn(npx, ['next', 'start', '-H', '0.0.0.0', '-p', port], {
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code) => process.exit(code ?? 0));
