#!/bin/bash

# Exit on any error
set -e

echo "Starting backend setup..."

# Run database migrations
echo "Running database migrations..."
uv run python manage.py migrate

# Load fixture data
echo "Loading fixture data..."
uv run python manage.py loaddata fixtures/dua-collections-data.json

# Collect static files (in case they weren't collected during build)
echo "Collecting static files..."
uv run python manage.py collectstatic --noinput

# Start gunicorn server
echo "Starting gunicorn server..."
uv run gunicorn htmx_practice.wsgi:application --bind 0.0.0.0:8000 