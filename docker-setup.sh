#!/bin/bash

# MDH 3D Store - Docker Setup Guide

# Production Build & Run
echo "📦 Building production image..."
docker build -t mdh-3d-store:latest .

echo "🚀 Starting production container..."
docker compose up -d

echo "✅ Application running at http://localhost:3000"
echo "📊 Check container logs: docker logs -f mdh-3d-store"

# Development Setup (Hot Reload)
# docker compose -f docker-compose.dev.yml up

# Cleanup
# docker compose down
# docker image rm mdh-3d-store:latest
