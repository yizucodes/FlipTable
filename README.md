# 🔄 FlipTable

**Flip waste into revenue in minutes**

FlipTable is an AI-powered platform that uses escrow-backed demand aggregation to help restaurants liquidate surplus food while saving buyers money. Built at the YC Locus Hackathon 2025.


---

## 🎯 The Problem

U.S. restaurants waste over **$100 billion** in surplus food annually—climbing to **$162 billion** when including packaging, disposal, and waste-related costs. Full-service restaurants account for **$77B** and limited-service for **$27B** in food value alone. The root cause? They can't liquidate surplus inventory fast enough at the end of the day, leading to massive financial losses and environmental waste.

## 💡 The Solution

FlipTable uses AI agents to negotiate bulk surplus food purchases with proof of committed buyers:

1. **Escrow Aggregation**: Users commit money in escrow with food preferences (e.g., "pizza, Mission District, 7-9 PM")
2. **AI Negotiation**: At 6 PM daily, our AI agent calls restaurants with proof: "23 buyers, $207 committed, willing to pay $6-12 per pizza"
3. **Instant Matching**: Agent negotiates clearing price (e.g., $8/pizza), matches top buyers, refunds others
4. **Seamless Payment**: Buyers get QR codes, scan at pickup, payment releases to restaurant via USDC on Base

### Real Impact
- **2m 47s**: Complete transaction time
- **$112**: Restaurant revenue recovered (vs. $0 waste)
- **$140**: Total savings for buyers
- **14 lbs**: Food saved from landfill

---

## ✨ Features

- **🤖 AI Voice Agent**: ElevenLabs-powered conversational agent that negotiates with restaurants
- **💰 Escrow-Backed Demand**: Proof of committed capital gives agents negotiating power
- **⚡ Instant Settlement**: USDC payments on Base blockchain via Locus
- **🎯 Smart Matching**: Price-clearing algorithm matches buyers to available inventory
- **📱 Mobile-First UI**: Responsive dashboard with live demo capabilities
- **🔐 Secure Payments**: Blockchain-verified transactions with instant refunds

---

## 🛠 Tech Stack

### Frontend
- **React 19** + **Vite** - Fast, modern UI framework
- **Tailwind CSS 4** - Utility-first styling with custom willow theme
- **ElevenLabs Conversational AI** - Live voice agent widget

### Backend
- **Flask** - Lightweight Python API
- **Flask-CORS** - Cross-origin resource sharing
- **Python-dotenv** - Environment configuration

### Payments & Blockchain
- **Locus API** - USDC payments on Base blockchain
- **Base Network** - Low-cost, fast settlement layer

---

## 🏗 Architecture

```
┌─────────────────┐
│   React UI      │  ← User sees escrow pool, agent status, match results
│   (Frontend)    │
└────────┬────────┘
         │
         ↓ HTTP/REST
┌─────────────────┐
│   Flask API     │  ← Escrow pool, matching algorithm, payment processing
│   (Backend)     │
└────┬──────┬─────┘
     │      │
     │      └──────→  ┌──────────────┐
     │                │  Locus API   │  ← USDC payments on Base
     │                └──────────────┘
     ↓
┌─────────────────┐
│  Data Storage   │  ← escrow_pool.json, restaurants.json
└─────────────────┘
```

### Key Components

1. **Escrow Pool** (`/api/escrow-pool`): 23 committed buyers with $207 total
2. **AI Agent** (ElevenLabs): Calls restaurants with proof of demand
3. **Matching Algorithm** (`/api/match-results`): Clears market at negotiated price
4. **Payment Processing** (`/api/pickup`): USDC transfer on scan

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **Locus API credentials** (for real payments)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/fliptable.git
cd fliptable
```

2. **Backend Setup**
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your Locus credentials
```

3. **Frontend Setup**
```bash
cd frontend

# Install dependencies
npm install

# Configure environment (optional)
echo "VITE_API_URL=http://localhost:5001" > .env
```

### Running Locally

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python app.py
# Server runs on http://localhost:5001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

Visit **http://localhost:5173** and click **"START DEMO"** to see FlipTable in action!

---

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Locus API Configuration
LOCUS_API_KEY=your_api_key_here
LOCUS_WALLET_ID=your_wallet_id_here
RESTAURANT_WALLET=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

# Flask Configuration
FLASK_ENV=development
```

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory (optional):

```env
# Backend API URL (defaults to http://localhost:5001)
VITE_API_URL=http://localhost:5001
```

---

## 📡 API Endpoints

### `GET /api/escrow-pool`
Returns current escrow pool status and user list.

**Response:**
```json
{
  "buyer_count": 23,
  "total_escrowed": 207.0,
  "avg_bid": 9.0,
  "location": "Mission District",
  "food_type": "pizza",
  "users": [...]
}
```

### `GET /api/restaurants`
Returns available restaurant inventory.

**Response:**
```json
[
  {
    "restaurant_id": "rest_001",
    "name": "Mario's Pizza",
    "phone": "+1-415-555-0123",
    "inventory": [...]
  }
]
```

### `GET /api/match-results`
Runs matching algorithm and returns cleared market results.

**Response:**
```json
{
  "matched": [...],
  "matched_count": 14,
  "refunded_count": 9,
  "clearing_price": 8.0,
  "restaurant_revenue": 112.0,
  "total_buyer_savings": 28.0,
  "food_saved_lbs": 14.0
}
```

### `POST /api/pickup`
Processes payment on pickup via Locus API.

**Request:**
```json
{
  "qr_code": "FLIP-1000"
}
```

**Response:**
```json
{
  "status": "success",
  "transaction_id": "0xf4a2b8...",
  "amount": "8.00"
}
```

---

## 🎮 How It Works

### 1. Demand Aggregation Phase
- Users commit funds to escrow with preferences (food type, location, time, max price)
- FlipTable aggregates demand into a "proof of buyers" pool
- Example: 23 users, $207 committed, avg bid $9/pizza

### 2. AI Agent Negotiation
- At scheduled time (6 PM), AI agent calls restaurants
- Pitch: "I have 23 committed buyers with $207 in escrow wanting pizza tonight"
- Agent negotiates price based on surplus inventory and buyer pool
- Clearing price: $8/pizza (below avg bid, above restaurant's alternative of $0)

### 3. Market Clearing
- Matches buyers to inventory by highest bid
- Top 14 buyers (out of 23) matched to 14 available pizzas
- Remaining 9 buyers instantly refunded
- Total: $112 revenue for restaurant, $28 savings for buyers

### 4. Settlement
- Matched buyers receive QR codes
- Scan at pickup triggers USDC payment release
- Restaurant receives funds immediately
- Blockchain-verified, instant settlement

---

## 🎨 Design System

FlipTable uses a **willow green + white + light gray** color scheme for a fresh, eco-friendly feel:

- **Primary (Willow)**: `#9BCF53` - CTAs, highlights, success states
- **Background**: White (`#FFFFFF`)
- **Cards**: Light gray (`#F9FAFB`)
- **Text**: Gray-800 (`#1F2937`)
- **Accents**: Willow gradients for impact metrics

All UI components are mobile-first and responsive.

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
python test_backend.py
```

### Integration Tests
```bash
python test_integration.py
```

### Manual Demo Testing
1. Start both frontend and backend
2. Click "START DEMO"
3. Watch AI agent negotiate with restaurant
4. Verify matching algorithm (14 matched, 9 refunded)
5. Test payment flow with "Simulate Pickup"

---

## 📦 Deployment

### Backend (Ngrok for Quick Testing)
```bash
cd backend
python app.py  # Runs on port 5001
ngrok http 5001  # Get public URL
```

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder to your hosting platform
```

Update `VITE_API_URL` to point to your deployed backend.

---

## 🚧 Future Enhancements

- [ ] Multi-restaurant support across multiple neighborhoods
- [ ] SMS notifications for matched buyers
- [ ] Restaurant dashboard for inventory management
- [ ] Dynamic pricing algorithm with ML predictions
- [ ] Integration with major POS systems (Toast, Square)
- [ ] Subscription model for power users
- [ ] Carbon footprint tracking and gamification
- [ ] Mobile app (iOS/Android)

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🏆 Built For

**YC Locus Hackathon 2025**

Team: [Your Name/Team Name]

### Acknowledgments

- **Locus** - For the amazing payment infrastructure and hackathon opportunity
- **ElevenLabs** - For conversational AI capabilities
- **Base** - For the fast and affordable blockchain layer
- **Y Combinator** - For organizing and supporting the hackathon

---

---

## 🌟 Star History

If you find FlipTable useful, please star the repository! ⭐

---

**Made with 💚 for restaurants, buyers, and the planet**
