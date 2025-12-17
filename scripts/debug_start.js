const { spawn } = require('child_process');
const child = spawn('npm', ['run', 'dev'], { shell: true });

child.stdout.on('data', (data) => {
  console.log(`${data}`);
});

child.stderr.on('data', (data) => {
  console.error(`${data}`);
});

setTimeout(() => {
  child.kill();
}, 15000);
