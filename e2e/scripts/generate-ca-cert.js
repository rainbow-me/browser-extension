#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * Generate CA certificate for MITM proxy testing
 * This should be run once on each developer's machine
 */

const fs = require('fs');
const path = require('path');

const forge = require('node-forge');

const certsDir = path.join(__dirname, '../fixtures/certs');
const caCertPath = path.join(certsDir, 'ca.crt');
const caKeyPath = path.join(certsDir, 'ca.key');

// Check if certs already exist
if (fs.existsSync(caCertPath) && fs.existsSync(caKeyPath)) {
  console.log('✅ CA certificate already exists at:', caCertPath);
  console.log('   To regenerate, delete the files and run this script again.');
  process.exit(0);
}

// Create certs directory if it doesn't exist
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

console.log('🔐 Generating CA certificate for E2E testing...');

// Generate CA certificate
const keys = forge.pki.rsa.generateKeyPair(2048);
const cert = forge.pki.createCertificate();

cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10);

const attrs = [
  { name: 'commonName', value: 'Rainbow E2E Test CA' },
  { name: 'countryName', value: 'US' },
  { name: 'organizationName', value: 'Rainbow E2E Tests' },
];

cert.setSubject(attrs);
cert.setIssuer(attrs);

cert.setExtensions([
  {
    name: 'basicConstraints',
    cA: true,
  },
  {
    name: 'keyUsage',
    keyCertSign: true,
    digitalSignature: true,
    nonRepudiation: true,
    keyEncipherment: true,
    dataEncipherment: true,
  },
]);

cert.sign(keys.privateKey, forge.md.sha256.create());

// Save certificate and key
const certPem = forge.pki.certificateToPem(cert);
const keyPem = forge.pki.privateKeyToPem(keys.privateKey);

fs.writeFileSync(caCertPath, certPem);
fs.writeFileSync(caKeyPath, keyPem);

console.log('✅ CA certificate generated successfully!');
console.log('📜 Certificate:', caCertPath);
console.log('🔑 Private key:', caKeyPath);
console.log('\n⚠️  These files are gitignored and should not be committed.');
console.log('   Each developer needs to run this script once.');
