# 🔄 FlipTable

**Flip waste into revenue in minutes**

FlipTable is an AI-powered platform that uses escrow-backed demand aggregation to help restaurants liquidate surplus food while saving buyers money. Built at the YC Locus Hackathon 2025.

---

## 🎯 The Problem

U.S. restaurants waste over **[$100 billion](https://gofilta.com/restaurant-food-waste-stats-solutions/)** in surplus food annually—climbing to **[$162 billion](https://therestauranthq.com/restaurant-food-waste-statistics/)** when including packaging, disposal, and waste-related costs. Full-service restaurants account for **[$77 billion](https://gofilta.com/restaurant-food-waste-stats-solutions/)** and limited-service restaurants for **[$27 billion](https://gofilta.com/restaurant-food-waste-stats-solutions/)** in food value alone. The root cause? They can't liquidate surplus inventory fast enough at the end of the day, leading to massive financial losses and environmental waste.

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

### 🎥 **[Watch the Demo on YouTube](https://youtu.be/87bVUQeYr0g)** - See FlipTable in action with live AI agent negotiations and payment processing.

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
- **Locus MCP Server** - Model Context Protocol for payment tools
- **Claude Agent SDK** - Anthropic's agent framework for intelligent payment processing
- **Locus Payment API** - USDC payments on Base blockchain
- **Base Network** - Low-cost, fast settlement layer

### AI & Agents
- **ElevenLabs Conversational AI** - Voice agent for restaurant negotiations
- **Anthropic Claude Agent SDK** - Intelligent payment processing agent
- **Locus MCP Tools** - `get_payment_context`, `send_to_address` for payments

---

## 🏗 Architecture

```
┌─────────────────┐
│   React UI      │  ← User sees escrow pool, agent status, match results
│   (Frontend)    │
└────┬──────┬─────┘
     │      │
     │      │ HTTP/REST
     │      ↓
     │  ┌──────────────────────────┐
     │  │  Locus Payment Agent      │  ← Claude Agent SDK + Locus MCP
     │  │  Service (Express)       │
     │  └───────────┬───────────────┘
     │              │ MCP Protocol
     │              ↓
     │         ┌─────────────────┐
     │         │  Locus MCP      │  ← Model Context Protocol
     │         │  Server         │
     │         └────────┬─────────┘
     │                  │ API Calls
     │                  ↓
     │         ┌─────────────────┐
     │         │  Base Blockchain │  ← USDC payments
     │         └─────────────────┘
     │
     ↓ HTTP/REST
┌─────────────────┐
│   Flask API     │  ← Escrow pool, matching algorithm
│   (Backend)     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Data Storage   │  ← escrow_pool.json, restaurants.json
└─────────────────┘

┌─────────────────┐
│  ElevenLabs     │  ← Voice agent for restaurant negotiation
│  Conversational │
│  AI Widget      │
└─────────────────┘
```

### Key Components

1. **Escrow Pool** (`/api/escrow-pool`): 23 committed buyers with $207 total
2. **ElevenLabs Voice Agent**: Calls restaurants with escrow-backed proof of demand
3. **Matching Algorithm** (`/api/match-results`): Clears market at negotiated price
4. **Locus Payment Agent Service** (`/api/payment`): Claude agent processes payments via Locus MCP
5. **Payment Settlement**: USDC transfer on Base blockchain with transaction verification

---

## 🤖 ElevenLabs Escrow-Backed Demand Agent Negotiation

FlipTable leverages **ElevenLabs Conversational AI** to create a powerful voice agent that negotiates with restaurants using real-time escrow data as proof of committed demand. This integration transforms traditional cold calling into intelligent, data-driven negotiations.

### How It Works

The ElevenLabs agent is embedded directly in the FlipTable frontend and operates with full context of the escrow pool:

1. **Escrow Data Integration**: The agent receives real-time escrow pool metrics:
   - Total number of committed buyers (e.g., 23 buyers)
   - Total capital escrowed (e.g., $207)
   - Average bid price (e.g., $9/pizza)
   - Location and food preferences

2. **Voice-First Negotiation**: The agent makes live phone calls to restaurants with a compelling pitch:
   ```
   "Hi Mario's, this is Alex from FlipTable. I have 23 customers with money 
   already escrowed wanting pizza in your area tonight. They've committed $207 
   total, willing to pay $6-12 per pizza. What surplus do you have? I can 
   guarantee you sell everything you name in the next 10 minutes."
   ```

3. **Proof of Demand**: Unlike traditional sales calls, the agent presents **verifiable proof**:
   - Money is already committed in escrow (not just interest)
   - Specific buyer count and total capital
   - Average bid range showing market willingness to pay
   - Guaranteed sales within minutes

4. **Intelligent Price Negotiation**: The agent negotiates based on:
   - Restaurant's surplus inventory
   - Buyer pool size and average bid
   - Market-clearing price that benefits both parties
   - Example: "My buyers' average bid is $0.09. I can take all 14 at $0.08 each."

### Technical Implementation

**Frontend Integration** (`frontend/src/App.jsx`):
- ElevenLabs Conversational AI widget embedded via custom element `<elevenlabs-convai>`
- Widget script loaded from CDN: `@elevenlabs/convai-widget-embed`
- Agent ID: `agent_6801ka2pyjzae7xbjkkdbcz059y4`
- Responsive design with mobile-first approach

**Agent Configuration**:
- Real-time voice conversation capabilities
- Context-aware responses based on escrow pool data
- Natural language negotiation with restaurant staff
- Automatic call completion and deal confirmation

**Escrow Data Flow**:
```
Escrow Pool API → Frontend State → ElevenLabs Agent Context
     ↓
Agent presents: "23 buyers, $207 committed, $6-12 price range"
     ↓
Restaurant responds with inventory
     ↓
Agent negotiates clearing price
     ↓
Deal confirmed → Matching algorithm triggered
```

### Key Benefits

✅ **Credibility**: Escrow-backed proof eliminates "tire-kicking" - restaurants know buyers are serious  
✅ **Speed**: Real-time voice negotiation faster than email/text exchanges  
✅ **Scale**: One agent can handle multiple restaurant calls simultaneously  
✅ **Conversion**: Proof of committed capital dramatically increases deal acceptance  
✅ **Transparency**: Both parties see clear numbers (buyer count, total capital, price range)

### Example Negotiation Flow

```
Agent: "I have 23 committed buyers with $207 in escrow wanting pizza tonight."
Restaurant: "We have 8 Margherita and 6 Pepperoni pizzas left."
Agent: "Perfect, 14 pizzas total. I can take all 14 at $0.08 each. 
        That's $1.12 guaranteed revenue right now instead of throwing them away."
Restaurant: "Deal! Let's do it."
Agent: "Great! You'll see 14 orders coming through in the next 2 minutes."
```

---

## 💳 Locus Payment Integration with Claude Agent

FlipTable uses **Anthropic's Claude Agent SDK** integrated with **Locus MCP (Model Context Protocol)** to create an intelligent payment processing system. This agent-based approach provides superior error handling, retry logic, and transaction verification compared to direct API integration.

### Architecture Overview

```
Frontend (React)
    ↓ HTTP POST /api/payment
Locus Payment Agent Service (Express + Claude SDK)
    ↓ MCP Protocol
Locus MCP Server (https://mcp.paywithlocus.com/mcp)
    ↓ API Calls
Locus Payment API → Base Blockchain (USDC)
```

### How It Works

1. **Payment Request**: When a buyer completes pickup, the frontend sends payment details to the Locus Payment Agent Service:
   ```json
   {
     "amount": "0.8",
     "recipient_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
     "recipient": "Mario's Pizza",
     "memo": "Payment for Mario's Pizza - Order #1234567890"
   }
   ```

2. **Claude Agent Processing**: The Claude agent receives the payment request and executes a two-step process:
   - **Step 1**: Calls `mcp__locus__get_payment_context` to check wallet balance
   - **Step 2**: Calls `mcp__locus__send_to_address` with recipient address, amount, and memo

3. **Intelligent Error Handling**: The agent includes:
   - Automatic retry logic with more explicit instructions if initial attempt fails
   - Transaction ID extraction using multiple regex patterns
   - Comprehensive tool call tracking for debugging
   - Graceful error recovery

4. **Transaction Verification**: The agent extracts transaction IDs from various response formats:
   - UUID format: `54298166-8079-447c-8439-b91793733948`
   - Ethereum transaction hash: `0xf4a2b8c1d9e3f7a6b5c4d2e1f9a8b7c6d5e4f3a2b1`
   - Custom transaction IDs from Locus API

### Technical Implementation

**Payment Agent Service** (`locus-agent/server.ts`):
- Express.js REST API server running on port 5002
- Endpoint: `POST /api/payment`
- Uses Claude Agent SDK with Locus MCP server connection
- Tool authorization restricted to Locus payment tools only
- Comprehensive logging and error tracking

**MCP Configuration**:
```typescript
const getBuyerLocusMCPConfig = () => ({
  'locus': {
    type: 'http',
    url: 'https://mcp.paywithlocus.com/mcp',
    headers: {
      'Authorization': `Bearer ${process.env.LOCUS_API_KEY_SENDER}`
    }
  }
});
```

**Tool Authorization**:
- Only allows `mcp__locus__*` tools
- Blocks unauthorized tool access
- Validates tool inputs before execution

**Sequential Tool Execution**:
```typescript
// Step 1: Check balance
mcp__locus__get_payment_context()

// Step 2: Send payment
mcp__locus__send_to_address({
  address: recipientAddress,
  amount: amount,
  memo: memo
})
```

### Key Features

✅ **Agent-Driven Intelligence**: Claude agent makes decisions about payment execution, retries, and error handling  
✅ **MCP Protocol**: Uses Model Context Protocol for standardized tool communication  
✅ **Retry Logic**: Automatic retry with more explicit instructions if payment fails  
✅ **Transaction Tracking**: Comprehensive logging of all tool calls and results  
✅ **Error Recovery**: Intelligent handling of edge cases and payment failures  
✅ **Base Blockchain**: Payments settle instantly on Base network via USDC

### Payment Flow

```
1. Buyer scans QR code at pickup
   ↓
2. Frontend calls /api/payment endpoint
   ↓
3. Claude agent receives payment request
   ↓
4. Agent calls get_payment_context (check balance)
   ↓
5. Agent calls send_to_address (execute payment)
   ↓
6. Transaction ID extracted from response
   ↓
7. Payment confirmed on Base blockchain
   ↓
8. Frontend displays success with transaction ID
```

### Environment Configuration

**Locus Payment Agent Service** (`.env`):
```env
LOCUS_API_KEY_SENDER=your_sender_api_key
ANTHROPIC_API_KEY=your_claude_api_key
PORT=5002
```

**Frontend** (`.env`):
```env
VITE_LOCUS_PAYMENT_API_URL=http://localhost:5002
```

### Error Handling

The agent implements sophisticated error handling:

- **Tool Not Called**: Retries with more explicit instructions
- **Transaction ID Missing**: Extracts from response using multiple patterns
- **Payment Failed**: Returns detailed error message to frontend
- **Network Issues**: Graceful timeout and error reporting
- **Insufficient Balance**: Clear error message (handled by Locus API)

### Benefits Over Direct API Integration

| Feature | Direct API | Claude Agent |
|---------|-----------|--------------|
| Error Handling | Manual retry logic | Intelligent retry with context |
| Transaction ID Extraction | Single pattern | Multiple regex patterns |
| Debugging | Limited logging | Comprehensive tool tracking |
| Edge Cases | Manual handling | Agent adapts automatically |
| Future Enhancements | Code changes required | Prompt engineering |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **Locus API credentials** (for real payments)
- **Anthropic Claude API key** (for payment agent)
- **ElevenLabs account** (for voice agent - agent ID provided)

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

3. **Locus Payment Agent Service Setup**
```bash
cd locus-agent

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your Locus and Claude API keys
```

4. **Frontend Setup**
```bash
cd frontend

# Install dependencies
npm install

# Configure environment (optional)
cat > .env << EOF
VITE_API_URL=http://localhost:5001
VITE_LOCUS_PAYMENT_API_URL=http://localhost:5002
EOF
```

### Running Locally

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python app.py
# Server runs on http://localhost:5001
```

**Terminal 2 - Locus Payment Agent Service:**
```bash
cd locus-agent
npm install
npm run server
# Server runs on http://localhost:5002
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm install
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

# Locus Payment Agent Service URL (defaults to http://localhost:5002)
VITE_LOCUS_PAYMENT_API_URL=http://localhost:5002
```

### Locus Payment Agent Service Environment Variables

Create a `.env` file in the `locus-agent/` directory:

```env
# Locus API Key for sender wallet
LOCUS_API_KEY_SENDER=your_sender_api_key_here

# Anthropic Claude API Key
ANTHROPIC_API_KEY=your_claude_api_key_here

# Server port (defaults to 5002)
PORT=5002
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

### `POST /api/pickup` (Legacy - Backend)
Legacy payment endpoint (direct Locus API). For new implementations, use the Locus Payment Agent Service.

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
  "amount": "0.8"
}
```

### `POST /api/payment` (Locus Payment Agent Service)
Processes payment using Claude Agent with Locus MCP tools. **Recommended for production use.**

**Endpoint**: `http://localhost:5002/api/payment`

**Request:**
```json
{
  "amount": "0.8",
  "recipient_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "recipient": "Mario's Pizza",
  "memo": "Payment for Mario's Pizza - Order #1234567890"
}
```

**Response:**
```json
{
  "status": "success",
  "transaction_id": "54298166-8079-447c-8439-b91793733948",
  "amount": "0.8",
  "recipient": "Mario's Pizza",
  "timestamp": "2025-01-XX...",
  "message": "Payment successful. Transaction ID: 54298166-8079-447c-8439-b91793733948"
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Payment failed: insufficient balance",
  "tools_called": ["mcp__locus__get_payment_context", "mcp__locus__send_to_address"]
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
- Scan at pickup triggers payment request to Claude agent
- Claude agent processes payment via Locus MCP tools
- Payment executes on Base blockchain via USDC
- Restaurant receives funds immediately
- Blockchain-verified, instant settlement with transaction ID

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
1. Start backend, Locus Payment Agent Service, and frontend
2. Click "START DEMO"
3. Watch ElevenLabs agent negotiate with restaurant (live voice conversation)
4. Verify matching algorithm (14 matched, 9 refunded)
5. Test payment flow with "Complete Payment with Claude Agent"
6. Verify transaction ID appears in payment confirmation

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

Team: Yi and Nabarun

### Acknowledgments

- **Locus** - For the amazing payment infrastructure and hackathon opportunity
- **ElevenLabs** - For conversational AI capabilities
- **Base** - For the fast and affordable blockchain layer
- **Y Combinator** - For organizing and supporting the hackathon


---

## 🌟 Star History

If you find FlipTable useful, please star the repository! ⭐

---

**Made with 💚 for restaurants, buyers, and the planet**
