#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Map of workspace dependencies to their package paths
const workspaceDeps = {
  '@langchain/classic': '../../langchain-classic/package.json',
  '@langchain/openai': '../../providers/langchain-openai/package.json',
};

let modified = false;

// Resolve workspace dependencies in dependencies
if (pkg.dependencies) {
  for (const [depName, depPath] of Object.entries(workspaceDeps)) {
    if (pkg.dependencies[depName] === 'workspace:*') {
      const depPkgPath = path.join(__dirname, depPath);
      if (fs.existsSync(depPkgPath)) {
        const depPkg = JSON.parse(fs.readFileSync(depPkgPath, 'utf8'));
        pkg.dependencies[depName] = `^${depPkg.version}`;
        modified = true;
        console.log(`Resolved ${depName} from workspace:* to ^${depPkg.version}`);
      }
    }
  }
}

// Resolve workspace dependencies in devDependencies
if (pkg.devDependencies) {
  for (const [depName, depPath] of Object.entries(workspaceDeps)) {
    if (pkg.devDependencies[depName] === 'workspace:*') {
      const depPkgPath = path.join(__dirname, depPath);
      if (fs.existsSync(depPkgPath)) {
        const depPkg = JSON.parse(fs.readFileSync(depPkgPath, 'utf8'));
        pkg.devDependencies[depName] = `^${depPkg.version}`;
        modified = true;
        console.log(`Resolved ${depName} from workspace:* to ^${depPkg.version} in devDependencies`);
      }
    }
  }
}

if (modified) {
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log('Updated package.json with resolved workspace dependencies');
} else {
  console.log('No workspace dependencies to resolve');
}

