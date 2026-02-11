import requests
import json

# Test server is running
try:
    response = requests.get('http://localhost:8000/')
    print(f'[OK] Server is running: {response.json()}')
except Exception as e:
    print(f'[ERROR] Server not running: {e}')
    print('Please start the backend server: python server.py')
    exit(1)

# Test registration endpoint
try:
    test_user = {
        'name': 'Test User',
        'email': 'test@example.com',
        'password': 'testpass123'
    }
    
    response = requests.post(
        'http://localhost:8000/api/auth/register',
        json=test_user,
        headers={'Content-Type': 'application/json'}
    )
    
    if response.status_code == 200:
        print('[OK] Registration endpoint works!')
        print(f'Response: {json.dumps(response.json(), indent=2)}')
    else:
        print(f'[ERROR] Registration failed with status {response.status_code}')
        print(f'Response: {response.text}')
        
except Exception as e:
    print(f'[ERROR] Registration test failed: {e}')
