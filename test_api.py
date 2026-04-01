#!/usr/bin/env python3
"""
Script de test pour AEROCHECK API
Teste toutes les routes API et rapporte les erreurs
"""

import json
import sys
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

BASE_URL = "http://localhost:3001"
TOKEN = None

def api_request(method, path, data=None, headers=None):
    """Make an API request and return response"""
    url = f"{BASE_URL}{path}"
    req_headers = headers or {}
    
    if data and isinstance(data, dict):
        data = json.dumps(data).encode('utf-8')
        req_headers['Content-Type'] = 'application/json'
    
    try:
        req = Request(url, data=data, headers=req_headers, method=method)
        with urlopen(req, timeout=10) as response:
            return json.loads(response.read().decode('utf-8'))
    except HTTPError as e:
        return {"error": f"HTTP {e.code}: {e.reason}", "body": e.read().decode('utf-8')}
    except URLError as e:
        return {"error": f"Connection failed: {e.reason}"}
    except Exception as e:
        return {"error": str(e)}

def test_health():
    """Test health endpoint"""
    print("\n=== Test Health Check ===")
    result = api_request("GET", "/api/health")
    if "error" in result:
        print(f"❌ FAIL: {result['error']}")
        return False
    print(f"✅ Backend running: {result.get('status', 'unknown')}")
    return True

def test_references():
    """Test all reference endpoints"""
    print("\n=== Test References API ===")
    endpoints = [
        ("/api/references/nationalites", "Nationalités"),
        ("/api/references/employeurs", "Employeurs"),
        ("/api/references/pays", "Pays"),
        ("/api/references/aeroports", "Aéroports"),
    ]
    
    all_ok = True
    for endpoint, name in endpoints:
        result = api_request("GET", endpoint)
        if "error" in result:
            print(f"❌ FAIL {name}: {result['error']}")
            all_ok = False
        else:
            count = len(result.get('data', []))
            print(f"✅ {name}: {count} éléments")
    
    # Test airport filter
    print("\n--- Test Filtre Aéroports ---")
    pays_result = api_request("GET", "/api/references/pays")
    if "error" not in pays_result and pays_result.get('data'):
        sn = [p for p in pays_result['data'] if p['code'] == 'SN']
        if sn:
            sn_id = sn[0]['id']
            aer_result = api_request("GET", f"/api/references/aeroports?paysId={sn_id}")
            if "error" not in aer_result:
                count = len(aer_result.get('data', []))
                print(f"✅ Aéroports Sénégal: {count} éléments")
            else:
                print(f"❌ FAIL Filtre: {aer_result['error']}")
                all_ok = False
    
    return all_ok

def test_auth():
    """Test authentication"""
    print("\n=== Test Authentication ===")
    global TOKEN
    
    result = api_request("POST", "/api/auth/login", {
        "email": "agent1@test.com",
        "password": "password123"
    })
    
    if "error" in result:
        print(f"❌ FAIL Login: {result['error']}")
        return False
    
    if 'data' in result and 'token' in result['data']:
        TOKEN = result['data']['token']
        print(f"✅ Login successful")
        return True
    else:
        print(f"❌ FAIL: No token in response")
        return False

def test_agents():
    """Test agents API with authentication"""
    print("\n=== Test Agents API ===")
    
    if not TOKEN:
        print("❌ FAIL: No authentication token")
        return False
    
    headers = {"Authorization": f"Bearer {TOKEN}"}
    
    # List agents
    result = api_request("GET", "/api/agents", headers=headers)
    if "error" in result:
        print(f"❌ FAIL List agents: {result['error']}")
        return False
    
    agents = result.get('data', [])
    print(f"✅ List agents: {len(agents)} agents")
    
    if agents:
        agent = agents[0]
        print(f"  - Matricule: {agent.get('matricule', 'N/A')}")
        print(f"  - Status: {agent.get('status', 'N/A')}")
        print(f"  - NationaliteId: {agent.get('nationaliteId', 'N/A')}")
        print(f"  - EmployeurId: {agent.get('employeurId', 'N/A')}")
        print(f"  - PaysId: {agent.get('paysId', 'N/A')}")
        print(f"  - AeroportId: {agent.get('aeroportId', 'N/A')}")
    
    return True

def test_admin_users():
    """Test admin users endpoint"""
    print("\n=== Test Admin Users API ===")
    
    # Login as admin
    result = api_request("POST", "/api/auth/login", {
        "email": "admin@aerocheck.com",
        "password": "password123"
    })
    
    if "error" in result or 'data' not in result:
        print(f"❌ FAIL Admin login")
        return False
    
    admin_token = result['data']['token']
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Test get users
    result = api_request("GET", "/api/auth/users", headers=headers)
    if "error" in result:
        print(f"❌ FAIL Get users: {result['error']}")
        return False
    
    users = result.get('data', [])
    print(f"✅ Get users: {len(users)} users")
    return True

def main():
    """Run all tests"""
    print("=" * 50)
    print("AEROCHECK API Tests")
    print("=" * 50)
    
    tests = [
        test_health,
        test_references,
        test_auth,
        test_agents,
        test_admin_users,
    ]
    
    results = []
    for test in tests:
        try:
            results.append(test())
        except Exception as e:
            print(f"❌ EXCEPTION: {e}")
            results.append(False)
    
    print("\n" + "=" * 50)
    print("Test Summary")
    print("=" * 50)
    passed = sum(results)
    total = len(results)
    print(f"Passed: {passed}/{total}")
    
    if passed == total:
        print("✅ All tests passed!")
        return 0
    else:
        print(f"❌ {total - passed} test(s) failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
