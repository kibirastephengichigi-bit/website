#!/bin/bash

echo "Starting Stephen Asatsa Website Admin Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "Please update the SECRET_KEY in .env file"
fi

# Start the server
echo "Starting FastAPI server on http://localhost:8000"
python main.py
