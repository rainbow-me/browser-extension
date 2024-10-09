/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs').promises;
const path = require('path');

const express = require('express');

const app = express();
const PORT = 3000;

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('http').Server} Server
 */

/**
 * Middleware to serve JSON files based on request paths and query parameters.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
app.use(async (req, res) => {
  try {
    const filePath = req.path.slice(1).replace(/\//g, '_');
    let filename = '_' + filePath; // Add leading underscore to match your file naming
    for (const [key, value] of Object.entries(req.query)) {
      filename += `_${key}_${value}`;
    }
    filename = filename.slice(0, 200) + '.json';

    const dir = path.join(__dirname, 'responses');
    const jsonPath = path.join(dir, filename);

    console.log('Attempting to read file:', jsonPath);

    const data = await fs.readFile(jsonPath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error(`Error serving request ${req.path}:`, error);
    res.status(404).json({ error: 'Not found', details: error.message });
  }
});

/**
 * Starts the mock server.
 * @returns {Promise<Server>} A promise that resolves to the HTTP server instance.
 */
const startMockServer = () => {
  return new Promise((resolve) => {
    const server = app.listen(PORT, () => {
      console.log(`Mock API server running on http://localhost:${PORT}`);
      resolve(server);
    });
  });
};

if (require.main === module) {
  startMockServer();
}

module.exports = { startMockServer };
