#!/bin/bash

# Combined watch script for Pug and Sass
echo "Starting watch processes for Pug and Sass..."

# Start Pug watcher in the background
echo "Starting Pug watcher..."
pug -w assets/templates/index.pug -o ../cp8-pa4io/ &
PUG_PID=$!

# Start Sass watcher in the background
echo "Starting Sass watcher..."
sass --watch assets/styles/index.scss index.css --style compressed &
SASS_PID=$!

# Function to cleanup background processes on exit
cleanup() {
    echo "Stopping watch processes..."
    kill $PUG_PID 2>/dev/null
    kill $SASS_PID 2>/dev/null
    exit 0
}

# Trap signals to cleanup on exit
trap cleanup SIGINT SIGTERM

echo "Both watchers are running. Press Ctrl+C to stop."
echo "Pug PID: $PUG_PID"
echo "Sass PID: $SASS_PID"

# Wait for both background processes
wait
