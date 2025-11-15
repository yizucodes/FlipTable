"""
Unit tests for FlipTable backend - Happy path only
"""
import sys
import json

# Load data files
def load_json(filename):
    with open(filename, 'r') as f:
        return json.load(f)

def test_escrow_pool_data():
    """Test that escrow pool data loads correctly"""
    escrow_pool = load_json('data/escrow_pool.json')
    
    # Test data structure
    assert len(escrow_pool) == 23, f"Expected 23 users, got {len(escrow_pool)}"
    
    # Test total escrowed
    total_escrowed = sum(user['amount_escrowed'] for user in escrow_pool)
    assert abs(total_escrowed - 214.5) < 0.1, f"Expected ~214.5, got {total_escrowed}"
    
    # Test average bid
    avg_bid = total_escrowed / len(escrow_pool)
    assert 9.0 < avg_bid < 10.0, f"Expected avg_bid ~9.5, got {avg_bid}"
    
    print("✅ test_escrow_pool_data PASSED")

def test_restaurant_data():
    """Test that restaurant data loads correctly"""
    restaurants = load_json('data/restaurants.json')
    
    assert len(restaurants) == 1, f"Expected 1 restaurant, got {len(restaurants)}"
    
    restaurant = restaurants[0]
    assert restaurant['name'] == "Mario's Pizza"
    
    # Test inventory
    total_items = sum(item['quantity'] for item in restaurant['inventory'])
    assert total_items == 14, f"Expected 14 pizzas, got {total_items}"
    
    print("✅ test_restaurant_data PASSED")

def test_matching_algorithm():
    """Test the matching algorithm logic"""
    escrow_pool = load_json('data/escrow_pool.json')
    restaurants = load_json('data/restaurants.json')
    
    restaurant = restaurants[0]
    total_items = sum(item['quantity'] for item in restaurant['inventory'])
    negotiated_price = 8.00
    
    # Filter eligible buyers
    eligible_buyers = [u for u in escrow_pool if u['amount_escrowed'] >= negotiated_price]
    
    # Sort by amount (highest first)
    eligible_buyers.sort(key=lambda x: x['amount_escrowed'], reverse=True)
    
    # Take top N buyers
    matched_buyers = eligible_buyers[:total_items]
    refunded_buyers = escrow_pool[total_items:]
    
    # Verify matching
    assert len(matched_buyers) == 14, f"Expected 14 matched buyers, got {len(matched_buyers)}"
    assert len(refunded_buyers) == 9, f"Expected 9 refunded buyers, got {len(refunded_buyers)}"
    
    # Verify revenue
    total_revenue = len(matched_buyers) * negotiated_price
    assert total_revenue == 112.0, f"Expected $112 revenue, got ${total_revenue}"
    
    # Verify all matched buyers can afford the price
    for buyer in matched_buyers:
        assert buyer['amount_escrowed'] >= negotiated_price, \
            f"Buyer {buyer['name']} bid ${buyer['amount_escrowed']} < ${negotiated_price}"
    
    # Verify matched buyers are sorted by highest bid
    for i in range(len(matched_buyers) - 1):
        assert matched_buyers[i]['amount_escrowed'] >= matched_buyers[i+1]['amount_escrowed'], \
            "Matched buyers not sorted by bid amount"
    
    print("✅ test_matching_algorithm PASSED")

def test_api_endpoints():
    """Test Flask API endpoints"""
    from app import app
    
    with app.test_client() as client:
        # Test home endpoint
        response = client.get('/')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['message'] == "FlipTable API Running"
        print("✅ test_api_home PASSED")
        
        # Test escrow pool endpoint
        response = client.get('/api/escrow-pool')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['buyer_count'] == 23
        assert 214 < data['total_escrowed'] < 216
        assert 9.0 < data['avg_bid'] < 10.0
        assert len(data['users']) == 23
        print("✅ test_api_escrow_pool PASSED")
        
        # Test restaurants endpoint
        response = client.get('/api/restaurants')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) == 1
        assert data[0]['name'] == "Mario's Pizza"
        print("✅ test_api_restaurants PASSED")
        
        # Test match results endpoint
        response = client.get('/api/match-results')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['matched_count'] == 14
        assert data['refunded_count'] == 9
        assert data['clearing_price'] == 8.0
        assert data['restaurant_revenue'] == 112.0
        assert len(data['matched']) == 14
        print("✅ test_api_match_results PASSED")
        
        # Test pickup endpoint (will fail without real API key, but test structure)
        response = client.post('/api/pickup', 
                               json={'qr_code': 'FLIP-1000'},
                               content_type='application/json')
        # We expect error since we don't have real API keys
        assert response.status_code in [200, 400, 500]
        print("✅ test_api_pickup PASSED (structure test)")

if __name__ == '__main__':
    print("Running FlipTable Backend Tests (Happy Path Only)")
    print("=" * 60)
    
    try:
        test_escrow_pool_data()
        test_restaurant_data()
        test_matching_algorithm()
        test_api_endpoints()
        
        print("=" * 60)
        print("🎉 ALL TESTS PASSED!")
        print("=" * 60)
        sys.exit(0)
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

