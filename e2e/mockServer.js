/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs').promises;
const path = require('path');

const express = require('express');

const app = express();
const PORT = 3001;

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('http').Server} Server
 */

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`\n�incoming Request: ${req.method} ${req.path}`);
  console.log('Query Parameters:', req.query);
  next();
});

/**
 * Middleware to serve JSON files based on request paths and query parameters.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
app.use(async (req, res) => {
  try {
    const filePath = req.path.slice(1).replace(/\//g, '_');
    let filename = '_' + filePath;
    for (const [key, value] of Object.entries(req.query)) {
      filename += `_${key}_${value}`;
    }
    filename = filename.slice(0, 200) + '.json';

    const dir = path.join(__dirname, 'responses');
    const jsonPath = path.join(dir, filename);

    console.log('\n📂 File Operation Details:');
    console.log('Directory:', dir);
    console.log('Generated Filename:', filename);
    console.log('Full Path:', jsonPath);

    // Check if directory exists
    try {
      await fs.access(dir);
      console.log('✅ Responses directory found');
    } catch (error) {
      console.error('❌ Responses directory not found:', error.message);
      return res.status(500).json({
        error: 'Server configuration error',
        details: 'Responses directory not found',
      });
    }

    // Check if file exists before trying to read it
    try {
      await fs.access(jsonPath);
      console.log('✅ Response file found');
    } catch (error) {
      console.error('❌ Response file not found:', error.message);
      return res.status(404).json({
        error: 'Response not found',
        details: 'No matching response file found for this request',
      });
    }

    // Read and parse the file
    try {
      const data = await fs.readFile(jsonPath, 'utf8');
      console.log('✅ File successfully read');

      const parsedData = JSON.parse(data);
      console.log('✅ JSON successfully parsed');

      res.json(parsedData);
      console.log('✅ Response sent successfully');
    } catch (error) {
      console.error('❌ Error reading or parsing file:', error.message);
      return res.status(500).json({
        error: 'File processing error',
        details: error.message,
      });
    }
  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    res.status(500).json({
      error: 'Server error',
      details: error.message,
    });
  }
});

/**
 * Starts the mock server.
 * @returns {Promise<Server|null>} A promise that resolves to the HTTP server instance or null if the server is already running.
 */
const startMockServer = () => {
  return new Promise((resolve) => {
    const server = app.listen(PORT, () => {
      console.log('\n🚀 Mock API server running on http://localhost:' + PORT);
      resolve(server);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(
          `\n❌ Port ${PORT} already in use, not starting a new server`,
        );
        resolve(null);
      } else {
        console.error('\n❌ Error starting server:', error);
        resolve(null);
      }
    });
  });
};

if (require.main === module) {
  startMockServer();
}

module.exports = { startMockServer };
