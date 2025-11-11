#! /bin/bash

echo "Building docker image..."
docker build -t katalog .

echo ""

echo "Running built image..."
docker run --rm --env-file .env -v "$(pwd)/output":/app/output katalog