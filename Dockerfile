# Use Python 3.11 slim as base image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive

# Install system dependencies (minimal for FFmpeg)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install Poetry
RUN pip install --no-cache-dir poetry==1.8.3

# Set work directory
WORKDIR /app

# Copy only the dependency files first (for better layer caching)
# Skip poetry.lock to avoid compatibility issues - let Poetry resolve dependencies
COPY pyproject.toml ./

# Configure Poetry and install dependencies
RUN poetry config virtualenvs.create false && \
    poetry install --only main --no-interaction --no-ansi

# Copy application code
COPY spotifysaver/ ./spotifysaver/

# Create directories for music and logs
RUN mkdir -p /app/Music /app/logs

# Create a non-root user (more secure)
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app
USER appuser

# Expose ports for API and Web UI
EXPOSE 8000 3000

# Set environment variables for the application
ENV SPOTIFYSAVER_OUTPUT_DIR=/app/Music \
    API_HOST=0.0.0.0 \
    API_PORT=8000

# Default command - run the CLI
ENTRYPOINT ["python", "-m", "spotifysaver"]
CMD ["--help"]

# Labels for metadata
LABEL maintainer="gabrielbaute@gmail.com" \
      description="SpotifySaver - Download Spotify tracks with metadata" \
      version="0.6.0"