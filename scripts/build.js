#!/usr/bin/env node

/**
 * Build script for the project
 * This script ensures clean builds by removing the dist folder first
 */

import { execSync } from 'child_process';
import { rmSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const distPath = join(projectRoot, 'dist');

console.log('🧹 Cleaning previous build...');

// Remove dist folder if it exists
if (existsSync(distPath)) {
    rmSync(distPath, { recursive: true, force: true });
    console.log('✅ Previous build cleaned');
} else {
    console.log('ℹ️ No previous build found');
}

console.log('🔨 Building TypeScript...');

try {
    // Run TypeScript compiler
    execSync('tsc -p tsconfig.json', {
        stdio: 'inherit',
        cwd: projectRoot
    });

    console.log('✅ Build completed successfully!');
    console.log('📦 Output directory: dist/');
    console.log('🚀 Run "npm start" to start the production server');

} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
}