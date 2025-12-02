#!/bin/bash
set -e
echo "Init script: install backend deps"
cd backend
npm install
echo "Done. Start server: node server.js"
