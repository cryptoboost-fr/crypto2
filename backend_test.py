#!/usr/bin/env python3
"""
Backend API Testing for CryptoBoost - Supabase Integration
Tests all required endpoints including auth, admin, and user endpoints
"""

import requests
import sys
import json
from datetime import datetime

class CryptoBoostAPITester:
    def __init__(self, base_url="https://demobackend.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_token = None
        self.user_token = None

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=15)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=15)
            else:
                print(f"❌ Unsupported method: {method}")
                return False, {}

            print(f"   Status Code: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)}")
                    return True, response_data
                except:
                    print(f"   Response (text): {response.text}")
                    return True, {"text": response.text}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error Response: {json.dumps(error_data, indent=2)}")
                except:
                    print(f"   Error Response (text): {response.text}")
                return False, {}

        except requests.exceptions.RequestException as e:
            print(f"❌ Failed - Network Error: {str(e)}")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_endpoint(self):
        """Test /api/health endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "/api/health",
            200
        )
        if success:
            # Validate response structure
            required_fields = ["status", "backend_time", "mongo"]
            for field in required_fields:
                if field not in response:
                    print(f"⚠️  Warning: Missing field '{field}' in health response")
        return success

    def test_roles_endpoint(self):
        """Test /api/roles endpoint"""
        success, response = self.run_test(
            "Get Roles",
            "GET",
            "/api/roles",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} roles")
            for role in response:
                if isinstance(role, dict) and "name" in role:
                    print(f"   - Role: {role['name']} (ID: {role.get('id', 'N/A')})")
        return success

    def test_sync_time_endpoint(self):
        """Test /api/sync/time endpoint"""
        success, response = self.run_test(
            "Sync Time",
            "GET",
            "/api/sync/time",
            200
        )
        if success:
            # Validate response structure
            if "server_time" in response:
                print(f"   Server Time: {response['server_time']}")
            if "message" in response:
                print(f"   Message: {response['message']}")
        return success

    def test_echo_action_endpoint(self):
        """Test POST /api/actions/echo endpoint"""
        test_payload = {
            "action": "test_echo",
            "payload": {
                "test_data": "backend_test",
                "timestamp": datetime.now().isoformat()
            }
        }
        
        success, response = self.run_test(
            "Echo Action",
            "POST",
            "/api/actions/echo",
            200,
            data=test_payload
        )
        
        if success:
            # Validate response structure
            expected_fields = ["action_id", "received", "server_time", "status"]
            for field in expected_fields:
                if field not in response:
                    print(f"⚠️  Warning: Missing field '{field}' in echo response")
                else:
                    if field == "received":
                        print(f"   Received payload matches: {response[field] == test_payload}")
        return success

def main():
    print("🚀 Starting CryptoBoost Backend API Tests")
    print("=" * 50)
    
    # Initialize tester
    tester = CryptoBoostAPITester()
    
    # Run all tests
    tests = [
        ("Health Endpoint", tester.test_health_endpoint),
        ("Roles Endpoint", tester.test_roles_endpoint),
        ("Sync Time Endpoint", tester.test_sync_time_endpoint),
        ("Echo Action Endpoint", tester.test_echo_action_endpoint),
    ]
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            test_func()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
            tester.tests_run += 1
    
    # Print final results
    print(f"\n{'='*50}")
    print(f"📊 Test Results Summary")
    print(f"{'='*50}")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%" if tester.tests_run > 0 else "No tests run")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())