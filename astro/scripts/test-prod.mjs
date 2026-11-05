// 生产验证一条命令：build → 独立端口 preview → 全量 Playwright。
// 独立端口 + FORCE_PREVIEW 避免复用 4321 上的 dev server 造成「测的不是产物」。
import { spawnSync } from 'node:child_process';

const build = spawnSync('npm', ['run', 'build'], { stdio: 'inherit', shell: true });
if (build.status) process.exit(build.status);

const test = spawnSync('npx', ['playwright', 'test'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, FORCE_PREVIEW: '1', PREVIEW_PORT: '4390' },
});
process.exit(test.status ?? 1);
