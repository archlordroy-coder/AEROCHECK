#!/usr/bin/env python3
"""
Test complet de toutes les interfaces AEROCHECK
Vérifie toutes les routes API, pages et fonctionnalités
"""

import json
import sys
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

BASE_URL = "http://localhost:3001"
TOKENS = {}

def api_request(method, path, data=None, headers=None):
    """Make an API request"""
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
        return {"error": f"HTTP {e.code}", "body": e.read().decode('utf-8')[:200]}
    except URLError as e:
        return {"error": f"Connection: {e.reason}"}
    except Exception as e:
        return {"error": str(e)}

def login(email, password):
    """Login and return token"""
    result = api_request("POST", "/api/auth/login", {"email": email, "password": password})
    if 'data' in result and 'token' in result['data']:
        return result['data']['token']
    return None

def test_health():
    """Test 1: Health check"""
    print("\n✓ Test 1: Health Check")
    r = api_request("GET", "/api/health")
    return "error" not in r

def test_auth():
    """Test 2: Authentication"""
    print("\n✓ Test 2: Authentication")
    
    accounts = [
        ("admin@aerocheck.com", "password123", "SUPER_ADMIN"),
        ("qip1@aerocheck.com", "password123", "QIP"),
        ("dlaa1@aerocheck.com", "password123", "DLAA"),
        ("agent1@test.com", "password123", "AGENT"),
    ]
    
    all_ok = True
    for email, pwd, role in accounts:
        token = login(email, pwd)
        if token:
            TOKENS[role] = token
            print(f"  ✅ {role}: {email}")
        else:
            print(f"  ❌ {role}: {email}")
            all_ok = False
    return all_ok

def test_references():
    """Test 3: References API"""
    print("\n✓ Test 3: References API")
    
    endpoints = [
        ("/api/references/nationalites", "Nationalités"),
        ("/api/references/employeurs", "Employeurs"),
        ("/api/references/pays", "Pays"),
        ("/api/references/aeroports", "Aéroports"),
    ]
    
    all_ok = True
    for endpoint, name in endpoints:
        r = api_request("GET", endpoint)
        if "error" in r:
            print(f"  ❌ {name}: {r['error']}")
            all_ok = False
        else:
            count = len(r.get('data', []))
            print(f"  ✅ {name}: {count} éléments")
    return all_ok

def test_agents_by_role():
    """Test 4: Agents access by role"""
    print("\n✓ Test 4: Agents Access by Role")
    
    all_ok = True
    for role, token in TOKENS.items():
        headers = {"Authorization": f"Bearer {token}"}
        r = api_request("GET", "/api/agents", headers=headers)
        
        if "error" in r:
            print(f"  ❌ {role}: {r['error']}")
            all_ok = False
        else:
            count = len(r.get('data', []))
            print(f"  ✅ {role}: {count} agents visibles")
    return all_ok

def test_admin_users():
    """Test 5: Admin users endpoint"""
    print("\n✓ Test 5: Admin Users API")
    
    if "SUPER_ADMIN" not in TOKENS:
        print("  ❌ Pas de token admin")
        return False
    
    headers = {"Authorization": f"Bearer {TOKENS['SUPER_ADMIN']}"}
    r = api_request("GET", "/api/auth/users", headers=headers)
    
    if "error" in r:
        print(f"  ❌ {r['error']}")
        return False
    
    count = len(r.get('data', []))
    print(f"  ✅ {count} utilisateurs trouvés")
    return True

def test_documents():
    """Test 6: Documents API"""
    print("\n✓ Test 6: Documents API")
    
    if "AGENT" not in TOKENS:
        print("  ❌ Pas de token agent")
        return False
    
    headers = {"Authorization": f"Bearer {TOKENS['AGENT']}"}
    r = api_request("GET", "/api/documents", headers=headers)
    
    if "error" in r:
        print(f"  ❌ {r['error']}")
        return False
    
    count = len(r.get('data', []))
    print(f"  ✅ {count} documents")
    return True

def test_licenses():
    """Test 7: Licenses API"""
    print("\n✓ Test 7: Licenses API")
    
    if "DLAA" not in TOKENS:
        print("  ❌ Pas de token DLAA")
        return False
    
    headers = {"Authorization": f"Bearer {TOKENS['DLAA']}"}
    r = api_request("GET", "/api/licenses", headers=headers)
    
    if "error" in r:
        print(f"  ❌ {r['error']}")
        return False
    
    count = len(r.get('data', []))
    print(f"  ✅ {count} licences")
    return True

def test_stats():
    """Test 8: Stats API"""
    print("\n✓ Test 8: Stats API")
    
    if "SUPER_ADMIN" not in TOKENS:
        print("  ❌ Pas de token admin")
        return False
    
    headers = {"Authorization": f"Bearer {TOKENS['SUPER_ADMIN']}"}
    endpoints = ["/api/stats/overview", "/api/stats/workflow", "/api/stats/users"]
    
    all_ok = True
    for endpoint in endpoints:
        r = api_request("GET", endpoint, headers=headers)
        name = endpoint.split('/')[-1]
        if "error" in r:
            print(f"  ❌ {name}: {r['error']}")
            all_ok = False
        else:
            print(f"  ✅ {name}")
    return all_ok

def main():
    print("=" * 50)
    print("TEST COMPLET AEROCHECK")
    print("=" * 50)
    
    tests = [
        test_health,
        test_auth,
        test_references,
        test_agents_by_role,
        test_admin_users,
        test_documents,
        test_licenses,
        test_stats,
    ]
    
    results = []
    for test in tests:
        try:
            results.append(test())
        except Exception as e:
            print(f"  ❌ EXCEPTION: {e}")
            results.append(False)
    
    print("\n" + "=" * 50)
    passed = sum(results)
    total = len(results)
    print(f"RÉSULTAT: {passed}/{total} tests passés")
    
    if passed == total:
        print("✅ TOUTES LES INTERFACES FONCTIONNENT")
        return 0
    else:
        print(f"❌ {total - passed} test(s) échoué(s)")
        return 1

if __name__ == "__main__":
    sys.exit(main())
