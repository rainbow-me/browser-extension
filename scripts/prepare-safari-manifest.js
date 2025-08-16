#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Preparing Safari manifest...');

// Read the original manifest
const manifestPath = path.join(__dirname, '..', 'build', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Remove Chrome-specific fields
delete manifest.minimum_chrome_version;
delete manifest.key;
delete manifest.update_url;
delete manifest.default_locale; // Safari handles locales differently

// Update for Safari compatibility
manifest.browser_specific_settings = {
  safari: {
    strict_min_version: "16.4"
  }
};

// Remove unsupported permissions
// Safari doesn't support 'unlimitedStorage'
if (manifest.permissions) {
  manifest.permissions = manifest.permissions.filter(p => 
    !['unlimitedStorage'].includes(p)
  );
}

// Update manifest version info
manifest.name = manifest.name.replace('DEVELOPMENT BUILD', 'Safari');
manifest.description = 'Rainbow Wallet for Safari';

// Safari prefers specific icon sizes
if (manifest.icons) {
  // Keep only the sizes Safari uses
  const safariIcons = {};
  ['16', '32', '64', '128', '256', '512'].forEach(size => {
    const sizeNum = parseInt(size);
    // Find the closest available icon
    if (manifest.icons[size]) {
      safariIcons[size] = manifest.icons[size];
    } else if (sizeNum <= 19 && manifest.icons['19']) {
      safariIcons[size] = manifest.icons['19'];
    } else if (sizeNum <= 38 && manifest.icons['38']) {
      safariIcons[size] = manifest.icons['38'];
    } else if (sizeNum >= 128 && manifest.icons['128']) {
      safariIcons[size] = manifest.icons['128'];
    }
  });
  manifest.icons = safariIcons;
}

// Ensure web_accessible_resources uses the correct format
if (manifest.web_accessible_resources) {
  // Already in MV3 format, just ensure it's valid for Safari
  manifest.web_accessible_resources = manifest.web_accessible_resources.map(resource => {
    if (typeof resource === 'object' && resource.resources) {
      return {
        resources: resource.resources,
        matches: resource.matches || ['<all_urls>']
      };
    }
    return resource;
  });
}

// Write the Safari-compatible manifest
const safariManifestPath = path.join(__dirname, '..', 'build', 'safari-manifest.json');
fs.writeFileSync(safariManifestPath, JSON.stringify(manifest, null, 2));

console.log('Safari manifest created at:', safariManifestPath);

// Also create a backup of the original
const backupPath = path.join(__dirname, '..', 'build', 'manifest.original.json');
fs.copyFileSync(manifestPath, backupPath);

// Replace the original manifest with Safari version
fs.copyFileSync(safariManifestPath, manifestPath);

console.log('Original manifest backed up to:', backupPath);
console.log('Safari manifest is now active');