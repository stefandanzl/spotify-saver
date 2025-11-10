# Docker Deployment for SpotifySaver

This guide explains how to run SpotifySaver using Docker and Docker Compose.

## Prerequisites

- Docker and Docker Compose installed
- Spotify Developer Account with client credentials

## Quick Start with Docker Compose

1. **Clone and navigate to the project:**
   ```bash
   git clone https://github.com/gabrielbaute/spotify-saver.git
   cd spotify-saver
   ```

2. **Set up environment variables:**
   ```bash
   cp .example.env .env
   # Edit .env with your Spotify credentials
   ```

3. **Run with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

4. **Access the application:**
   - Web UI: http://localhost:3000
   - API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Environment Variables

Create a `.env` file in the project root:

```bash
# Required
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Optional
SPOTIFY_REDIRECT_URI=http://localhost:8888/callback
SPOTIFYSAVER_OUTPUT_DIR=/app/Music
API_PORT=8000
YTDLP_COOKIES_PATH=/app/cookies.txt
```

## Manual Docker Build

If you prefer to build and run manually:

1. **Build the image:**
   ```bash
   docker build -t spotifysaver .
   ```

2. **Run the CLI:**
   ```bash
   docker run --rm \
     -e SPOTIFY_CLIENT_ID=your_id \
     -e SPOTIFY_CLIENT_SECRET=your_secret \
     -v $(pwd)/Music:/app/Music \
     spotifysaver download "https://open.spotify.com/track/..."
   ```

3. **Run the API server:**
   ```bash
   docker run -d \
     --name spotifysaver-api \
     -p 8000:8000 \
     -e SPOTIFY_CLIENT_ID=your_id \
     -e SPOTIFY_CLIENT_SECRET=your_secret \
     -v $(pwd)/Music:/app/Music \
     spotifysaver api
   ```

4. **Run the Web UI:**
   ```bash
   docker run -d \
     --name spotifysaver-ui \
     -p 3000:3000 \
     -p 8000:8000 \
     -e SPOTIFY_CLIENT_ID=your_id \
     -e SPOTIFY_CLIENT_SECRET=your_secret \
     -v $(pwd)/Music:/app/Music \
     spotifysaver ui
   ```

## Volume Mounting

- **Music Downloads**: Mount to `/app/Music` in the container
- **Logs**: Mount to `/app/logs` in the container
- **YouTube Cookies**: Mount to `/app/cookies.txt` (optional)

## Docker Compose Services

The docker-compose.yml file provides:

- **Web UI Service**: Runs both the web interface (port 3000) and API (port 8000)
- **Volume Mounts**: Persistent storage for music and logs
- **Environment Variables**: Easy configuration through .env file

## Health Checks

The container includes the application entry point but doesn't include built-in health checks. You can monitor the logs:

```bash
docker-compose logs -f spotifysaver
```

## Building for Production

For production deployments:

```bash
# Build production image
docker build -t spotifysaver:latest .

# Tag with version
docker tag spotifysaver:latest spotifysaver:0.6.0
```

## Troubleshooting

1. **Permission Issues**: The container runs as a non-root user (`appuser`)
2. **Network Issues**: Ensure ports 3000 and 8000 are available
3. **Environment Variables**: Verify all required variables are set in .env
4. **Volume Mounts**: Check that local directories exist and are accessible

## Development with Docker

For development with live reloading:

```bash
# Mount source code for development
docker run -it --rm \
  -v $(pwd):/app \
  -p 3000:3000 \
  -p 8000:8000 \
  -e SPOTIFY_CLIENT_ID=your_id \
  -e SPOTIFY_CLIENT_SECRET=your_secret \
  spotifysaver:dev ui
```

Note: You may need to create a separate Dockerfile for development with dev dependencies installed.