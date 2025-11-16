from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
from dotenv import load_dotenv
import requests

load_dotenv()

app = Flask(__name__)
CORS(app)

# Add header to skip ngrok browser warning
@app.after_request
def after_request(response):
    response.headers.add('ngrok-skip-browser-warning', 'true')
    return response

# Load data files
def load_json(filename):
    with open(filename, 'r') as f:
        return json.load(f)

escrow_pool = load_json('data/escrow_pool.json')
restaurants = load_json('data/restaurants.json')

LOCUS_API_KEY = os.getenv('LOCUS_API_KEY')
LOCUS_WALLET_ID = os.getenv('LOCUS_WALLET_ID')
RESTAURANT_WALLET = os.getenv('RESTAURANT_WALLET')

@app.route('/')
def home():
    return jsonify({"message": "FlipTable API Running"})

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

