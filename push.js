import { exec } from 'child_process';

exec('npx drizzle-kit push --force', (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
  console.error(stderr);
});