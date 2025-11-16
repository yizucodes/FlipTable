# Deploying Backend with ngrok

This guide will help you expose your Flask backend to the internet using ngrok, so it can be accessed from anywhere.

## Prerequisites

1. **Install ngrok**
   - Visit https://ngrok.com/download
   - Or install via Homebrew (macOS): `brew install ngrok`
   - Or install via npm: `npm install -g ngrok`

2. **Sign up for ngrok** (free account works)
   - Go to https://dashboard.ngrok.com/signup
   - Get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken

## Step 1: Authenticate ngrok

```bash
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

## Step 2: Start Your Flask Backend

In one terminal window:

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
```

Your backend should now be running on `http://localhost:5001`

## Step 3: Start ngrok Tunnel

In a **new terminal window**, run:

```bash
ngrok http 5001
```

You'll see output like:
```
Forwarding   https://abc123.ngrok-free.app -> http://localhost:5001
```

**Copy the HTTPS URL** (e.g., `https://abc123.ngrok-free.app`) - this is your public backend URL!

## Step 4: Update Frontend to Use ngrok URL

### Option A: Quick Test (Manual Update)

Update `frontend/src/App.jsx` and replace all instances of:
- `http://localhost:5001` → `https://YOUR_NGROK_URL.ngrok-free.app`

For example:
```jsx
fetch('https://abc123.ngrok-free.app/api/escrow-pool')
```

### Option B: Environment Variable (Recommended)

1. Create `frontend/.env`:
```bash
VITE_API_URL=https://abc123.ngrok-free.app
```

2. Update `frontend/src/App.jsx` to use the environment variable:
```jsx
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
```

Then replace all fetch calls:
```jsx
fetch(`${API_URL}/api/escrow-pool`)
```

## Step 5: Handle ngrok Browser Warning

When accessing your ngrok URL in a browser, you may see a warning page. Click "Visit Site" to proceed.

For API calls from your frontend, ngrok may require a header. Add this to your Flask backend:

```python
@app.after_request
def after_request(response):
    response.headers.add('ngrok-skip-browser-warning', 'true')
    return response
```

## Step 6: Test Your Deployment

1. Start your frontend:
```bash
cd frontend
npm run dev
```

2. Visit your frontend (usually `http://localhost:5173`)
3. The frontend should now connect to your backend via the ngrok URL
4. Test all features:
   - Escrow pool loads
   - Match results work
   - Payment processing works

## Important Notes

### ngrok URL Changes
- **Free tier**: Your ngrok URL changes every time you restart ngrok
- **Paid tier**: You can get a static domain
- Update your frontend `.env` file whenever the URL changes

### Keep ngrok Running
- Keep the ngrok terminal window open while testing
- If you close it, the tunnel stops and your backend won't be accessible

### CORS
Your Flask app already has CORS enabled, so it should work with ngrok URLs.

### Security
- ngrok URLs are public - anyone with the URL can access your backend
- Don't commit ngrok URLs to version control
- For production, use a proper hosting service (Heroku, Railway, Render, etc.)

## Troubleshooting

### "Connection refused"
- Make sure your Flask backend is running on port 5001
- Check that ngrok is forwarding to the correct port

### "CORS error"
- Verify `CORS(app)` is in your Flask app (it already is)
- Check browser console for specific error messages

### "ngrok URL not working"
- Make sure ngrok is still running
- Check the ngrok dashboard: https://dashboard.ngrok.com/status/tunnels
- Restart ngrok if needed

### Frontend can't connect
- Verify the ngrok URL in your `.env` file is correct
- Make sure you're using HTTPS (not HTTP) for the ngrok URL
- Check browser console for network errors

## Alternative: Use ngrok with Static Domain (Paid)

If you have a paid ngrok account, you can use a static domain:

```bash
ngrok http 5001 --domain=your-static-domain.ngrok-free.app
```

This way, your URL won't change between restarts.

