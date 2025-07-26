const path = require('path');
const globalDirectory = require('global-directory');

function isGlobalInstall() {
  const globalPackagesDir = globalDirectory.default.npm.packages;
  const myPath = path.resolve(__dirname, '..');
  return {
    globalPackagesDir,
    isGlobal: myPath.startsWith(globalPackagesDir),
    myPath,
  }
}

try {
  if (isGlobalInstall().isGlobal) {
    console.log(`
Installed globally at: ${isGlobalInstall().myPath}
You can now use the \`shua\` command in your terminal.
To uninstall, run: \`npm uninstall -g shadow-ua\`

🎉 ShadowUA CLI installed successfully!

  👉 Try now: \`shua g --random\`

  📘 Full commands: \`shua --help\`

🐞 Report bugs or request features:
   https://github.com/arnonsang/shadow-ua/issues

🔗 Docs: https://github.com/arnonsang/shadow-ua?tab=readme-ov-file#-quick-start
`);
  } else {
    console.log(`
🎉  ShadowUA installed locally in your project as library mode 
    at: ${isGlobalInstall().myPath}

    To execute the CLI, use: \`npx shadow-ua\` 
    or install it globally with \`npm install -g shadow-ua\`

🐞 Report bugs or request features:
   https://github.com/arnonsang/shadow-ua/issues

🔗 Docs: https://github.com/arnonsang/shadow-ua?tab=readme-ov-file#library-usage
`);
  }
} catch (error) {
  console.warn(`
⚠️ ShadowUA post-install message failed to run.
ℹ️ The package was installed correctly, but the setup message could not be shown.

📘 Please visit the docs for usage:
   https://github.com/arnonsang/shadow-ua
`);
  process.exit(1);
}
