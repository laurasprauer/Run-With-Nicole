#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Required Node.js version
const REQUIRED_NODE_VERSION = "22.13.1";
const REQUIRED_NPM_VERSION = "10.0.0";

// Get current Node.js and npm versions
const currentNodeVersion = process.version.slice(1); // Remove 'v' prefix
const currentNpmVersion = process.env.npm_version || "unknown";

// Parse version numbers for comparison
function parseVersion(version) {
  return version.split(".").map((num) => parseInt(num, 10));
}

function compareVersions(current, required) {
  const currentParts = parseVersion(current);
  const requiredParts = parseVersion(required);

  for (
    let i = 0;
    i < Math.max(currentParts.length, requiredParts.length);
    i++
  ) {
    const currentPart = currentParts[i] || 0;
    const requiredPart = requiredParts[i] || 0;

    if (currentPart > requiredPart) return 1;
    if (currentPart < requiredPart) return -1;
  }

  return 0;
}

// Check Node.js version
const nodeVersionCheck = compareVersions(
  currentNodeVersion,
  REQUIRED_NODE_VERSION
);
if (nodeVersionCheck < 0) {
  console.error(`❌ Node.js version ${currentNodeVersion} is not supported.`);
  console.error(`   Required: Node.js >= ${REQUIRED_NODE_VERSION}`);
  console.error(
    `   Please update Node.js using nvm, n, or download from nodejs.org`
  );
  process.exit(1);
}

// Check npm version (if available)
if (currentNpmVersion !== "unknown") {
  const npmVersionCheck = compareVersions(
    currentNpmVersion,
    REQUIRED_NPM_VERSION
  );
  if (npmVersionCheck < 0) {
    console.warn(`⚠️  npm version ${currentNpmVersion} is below recommended.`);
    console.warn(`   Recommended: npm >= ${REQUIRED_NPM_VERSION}`);
    console.warn(`   Run: npm install -g npm@latest`);
  }
}

console.log(`✅ Node.js version ${currentNodeVersion} is supported`);
if (currentNpmVersion !== "unknown") {
  console.log(`✅ npm version ${currentNpmVersion} is supported`);
}

// Check for .nvmrc files
const nvmrcFiles = [
  path.join(__dirname, "..", ".nvmrc"),
  path.join(__dirname, "..", "studio", ".nvmrc"),
];

nvmrcFiles.forEach((nvmrcPath) => {
  if (fs.existsSync(nvmrcPath)) {
    const nvmrcVersion = fs.readFileSync(nvmrcPath, "utf8").trim();
    if (nvmrcVersion !== REQUIRED_NODE_VERSION) {
      console.warn(
        `⚠️  .nvmrc file contains version ${nvmrcVersion}, expected ${REQUIRED_NODE_VERSION}`
      );
    }
  }
});
