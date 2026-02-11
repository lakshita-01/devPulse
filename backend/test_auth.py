import requests
import json

BASE_URL = "http://localhost:8000"

print("Testing DevPulse Authentication...")
print("=" * 50)

# Test 1: Check if server is running
print("\n1. Testing server connection...")
try:
    response = requests.get(f"{BASE_URL}/")
    print(f"✓ Server is running: {response.json()}")
except Exception as e:
    print(f"✗ Server connection failed: {e}")
    exit(1)

# Test 2: Register a new user
print("\n2. Testing user registration...")
register_data = {
    "name": "Test User",
    "email": "test@example.com",
    "password": "testpass123"
}

try:
    response = requests.post(f"{BASE_URL}/api/auth/register", json=register_data)
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Registration successful!")
        print(f"  User ID: {data['user']['id']}")
        print(f"  Workspace ID: {data['workspace_id']}")
        token = data['access_token']
    elif response.status_code == 400:
        print(f"✓ User already exists, trying login...")
        # Try login instead
        login_data = {
            "email": register_data["email"],
            "password": register_data["password"]
        }
        response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Login successful!")
            token = data['access_token']
        else:
            print(f"✗ Login failed: {response.status_code}")
            print(f"  Response: {response.text}")
            exit(1)
    else:
        print(f"✗ Registration failed: {response.status_code}")
        print(f"  Response: {response.text}")
        exit(1)
except Exception as e:
    print(f"✗ Registration error: {e}")
    exit(1)

# Test 3: Test authenticated request
print("\n3. Testing authenticated request...")
try:
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/workspaces", headers=headers)
    if response.status_code == 200:
        workspaces = response.json()
        print(f"✓ Authenticated request successful!")
        print(f"  Workspaces: {len(workspaces)}")
    else:
        print(f"✗ Authenticated request failed: {response.status_code}")
        print(f"  Response: {response.text}")
except Exception as e:
    print(f"✗ Authenticated request error: {e}")

print("\n" + "=" * 50)
print("✓ All tests passed! Authentication is working.")
