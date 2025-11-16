from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
from dotenv import load_dotenv
import requests

load_dotenv()

app = Flask(__name__)
# Configure CORS to allow all origins (needed for ngrok and localhost)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# Add header to skip ngrok browser warning and ensure CORS headers
@app.after_request
def after_request(response):
    response.headers.add('ngrok-skip-browser-warning', 'true')
    # Explicitly add CORS headers to ensure they're present
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,ngrok-skip-browser-warning')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    return response

# Fallback data
DEFAULT_RESTAURANTS = [
    {
        "restaurant_id": "rest_001",
        "name": "Mario's Pizza",
        "phone": "+1-415-555-0123",
        "address": "742 Valencia St, San Francisco, CA 94110",
        "contact": "Tony",
        "inventory": [
            {"item": "Margherita Pizza", "quantity": 8, "original_price": 18.00},
            {"item": "Pepperoni Pizza", "quantity": 6, "original_price": 20.00}
        ]
    }
]

DEFAULT_ESCROW_POOL = [
    {"user_id": "usr_001", "name": "Sarah M.", "amount_escrowed": 11.50, "food_ordered": "pizza", "location": "Mission District", "pickup_window": "7-9 PM"},
    {"user_id": "usr_002", "name": "Mike T.", "amount_escrowed": 8.50, "food_ordered": "pizza", "location": "Mission District", "pickup_window": "7-9 PM"},
    {"user_id": "usr_003", "name": "Jane K.", "amount_escrowed": 9.00, "food_ordered": "pizza", "location": "Mission District", "pickup_window": "7-9 PM"},
    {"user_id": "usr_004", "name": "Alex P.", "amount_escrowed": 8.00, "food_ordered": "pizza", "location": "Mission District", "pickup_window": "7-9 PM"},
    {"user_id": "usr_005", "name": "Chris L.", "amount_escrowed": 9.50, "food_ordered": "pizza", "location": "Mission District", "pickup_window": "7-9 PM"},
    {"user_id": "usr_006", "name": "Jordan T.", "amount_escrowed": 9.00, "food_ordered": "pizza", "location": "Mission District", "pickup_window": "7-9 PM"},
    {"user_id": "usr_007", "name": "Casey W.", "amount_escrowed": 10.00, "food_ordered": "pizza", "location": "Mission District", "pickup_window": "7-9 PM"},
    {"user_id": "usr_008", "name": "Morgan F.", "amount_escrowed": 8.50, "food_ordered": "pizza", "location": "Mission District", "pickup_window": "7-9 PM"},
    {"user_id": "usr_009", "name": "Riley H.", "amount_escrowed": 11.50, "food_ordered": "pizza", "location": "Mission District", "pickup_window": "7-9 PM"},
    {"user_id": "usr_010", "name": "Quinn B.", "amount_escrowed": 7.50, "food_ordered": "pizza", "location": "Mission District", "pickup_window": "7-9 PM"},
    {"user_id": "usr_011", "name": "Dakota S.", "amount_escrowed": 11.00, "food_ordered": "pizza", "location": "Mission District", "pickup_window": "7-9 PM"},
    {"user_id": "usr_012", "name": "Avery M.", "amount_escrowed": 9.00, "food_ordered": "pizza", "location": "Mission District", "pickup_window": "7-9 PM"},
    {"user_id": "usr_013", "name": "Skyler D.", "amount_escrowed": 10.00, "food_ordered": "pizza", "location": "Mission District", "pickup_window": "7-9 PM"},
    {"user_id": "usr_014", "name": "River C.", "amount_escrowed": 8.00, "food_ordered": "pizza", "location": "Mission District", "pickup_window": "7-9 PM"},
    {"user_id": "usr_015", "name": "Phoenix L.", "amount_escrowed": 6.00, "food_ordered": "pizza", "location": "Mission District", "pickup_window": "7-9 PM"},
    {"user_id": "usr_016", "name": "Sage K.", "amount_escrowed": 10.50, "food_ordered": "pizza", "location": "Mission District", "pickup_window": "7-9 PM"},
    {"user_id": "usr_017", "name": "Rowan P.", "amount_escrowed": 9.00, "food_ordered": "pizza", "location": "Mission District", "pickup_window": "7-9 PM"},
    {"user_id": "usr_018", "name": "Ember J.", "amount_escrowed": 7.00, "food_ordered": "pizza", "location": "Mission District", "pickup_window": "7-9 PM"},
    {"user_id": "usr_019", "name": "Aspen G.", "amount_escrowed": 10.00, "food_ordered": "pizza", "location": "Mission District", "pickup_window": "7-9 PM"},
    {"user_id": "usr_020", "name": "Wren V.", "amount_escrowed": 8.50, "food_ordered": "pizza", "location": "Mission District", "pickup_window": "7-9 PM"},
    {"user_id": "usr_021", "name": "Kai N.", "amount_escrowed": 6.50, "food_ordered": "pizza", "location": "Mission District", "pickup_window": "7-9 PM"},
    {"user_id": "usr_022", "name": "Ellis R.", "amount_escrowed": 11.00, "food_ordered": "pizza", "location": "Mission District", "pickup_window": "7-9 PM"},
    {"user_id": "usr_023", "name": "Finley Y.", "amount_escrowed": 7.50, "food_ordered": "pizza", "location": "Mission District", "pickup_window": "7-9 PM"}
]

# Load data files with fallback
def load_json(filename, fallback=None):
    try:
        # Get the directory where this script is located
        script_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(script_dir, filename)
        with open(file_path, 'r') as f:
            data = json.load(f)
            print(f"Successfully loaded {filename} with {len(data) if isinstance(data, list) else 'data'} entries")
            return data
    except (FileNotFoundError, json.JSONDecodeError, IOError) as e:
        print(f"Warning: Could not load {filename}, using fallback data. Error: {e}")
        return fallback if fallback is not None else []

escrow_pool = load_json('data/escrow_pool.json', fallback=DEFAULT_ESCROW_POOL)
restaurants = load_json('data/restaurants.json', fallback=DEFAULT_RESTAURANTS)

LOCUS_API_KEY = os.getenv('LOCUS_API_KEY')
LOCUS_WALLET_ID = os.getenv('LOCUS_WALLET_ID')
RESTAURANT_WALLET = os.getenv('RESTAURANT_WALLET')

@app.route('/')
def home():
    return jsonify({"message": "FlipTable API Running"})

# Handle OPTIONS preflight requests
@app.route('/api/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    return '', 200

@app.route('/api/escrow-pool')
def get_escrow_pool():
    total_escrowed = sum(user['amount_escrowed'] for user in escrow_pool)
    buyer_count = len(escrow_pool)
    avg_bid = total_escrowed / buyer_count if buyer_count > 0 else 0
    
    return jsonify({
        "buyer_count": buyer_count,
        "total_escrowed": round(total_escrowed, 2),
        "avg_bid": round(avg_bid, 2),
        "location": "Mission District",
        "food_type": "pizza",
        "users": escrow_pool
    })

@app.route('/api/restaurants')
def get_restaurants():
    return jsonify(restaurants)

@app.route('/api/match-results')
def get_match_results():
    # Restaurant inventory
    restaurant = restaurants[0]
    total_items = sum(item['quantity'] for item in restaurant['inventory'])  # 14 pizzas
    negotiated_price = 0.8
    
    # Filter eligible buyers (bid >= negotiated price)
    eligible_buyers = [u for u in escrow_pool if u['amount_escrowed'] >= negotiated_price]
    
    # Sort by amount (highest first)
    eligible_buyers.sort(key=lambda x: x['amount_escrowed'], reverse=True)
    
    # Take top N buyers where N = total items
    matched_buyers = eligible_buyers[:total_items]
    refunded_buyers = escrow_pool[total_items:]
    
    # Assign items to buyers
    inventory_list = []
    for item in restaurant['inventory']:
        inventory_list.extend([item['item']] * item['quantity'])
    
    matches = []
    for i, buyer in enumerate(matched_buyers):
        matches.append({
            "user_id": buyer['user_id'],
            "name": buyer['name'],
            "item": inventory_list[i] if i < len(inventory_list) else "Pizza",
            "price": negotiated_price,
            "original_bid": buyer['amount_escrowed'],
            "savings": buyer['amount_escrowed'] - negotiated_price,
            "qr_code": f"FLIP-{1000 + i}"
        })
    
    # Calculate totals
    total_revenue = len(matched_buyers) * negotiated_price
    total_savings = sum(m['savings'] for m in matches)
    
    return jsonify({
        "matched": matches,
        "matched_count": len(matched_buyers),
        "refunded_count": len(refunded_buyers),
        "clearing_price": negotiated_price,
        "restaurant_revenue": total_revenue,
        "total_buyer_savings": total_savings,
        "food_saved_lbs": len(matched_buyers) * 1.0,  # 1 lb per pizza
        "restaurant": {
            "name": restaurant['name'],
            "wallet_address": RESTAURANT_WALLET or None
        }
    })

@app.route('/api/pickup', methods=['POST'])
def process_pickup():
    qr_code = request.json.get('qr_code', 'FLIP-1000')
    
    try:
        # Call Locus API
        response = requests.post(
            f"https://api.paywithlocus.com/v1/wallets/{LOCUS_WALLET_ID}/send",
            headers={
                "Authorization": f"Bearer {LOCUS_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "recipient": RESTAURANT_WALLET,
                "amount": "0.8",
                "currency": "USDC",
                "memo": f"FlipTable-{qr_code}"
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            return jsonify({
                "status": "success",
                "transaction_id": data.get('transaction_id', 'tx_demo_123'),
                "amount": "0.8"
            })
        else:
            return jsonify({
                "status": "error",
                "message": response.text
            }), 400
            
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)

