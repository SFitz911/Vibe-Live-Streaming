# LiveKit Development Server Setup

To enable browser-based streaming, you need a LiveKit server running locally or in the cloud.

## Option 1: Run with Docker (Recommended for Local Dev)

1. Install Docker Desktop if you don't have it: https://www.docker.com/products/docker-desktop
2. In your project root, run:

```
docker run --rm -it -p 7880:7880 -p 7881:7881 -p 7882:7882 livekit/livekit-server \
  --dev --bind 0.0.0.0
```

- The server UI will be at http://localhost:7880
- API/WebSocket at ws://localhost:7880

## Option 2: Use LiveKit Cloud (for production or easy testing)
- Sign up at https://cloud.livekit.io/
- Create a project and get your API key/secret
- Use the provided URL and credentials in your app

## Next Steps
- Once the server is running, you can connect to it from your Next.js app using the LiveKit JS/React SDK.
- Continue with SDK integration and Go Live UI enhancements.
