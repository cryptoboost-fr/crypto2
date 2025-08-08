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
    def __init__(self, base_url="http://localhost:8001"):
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

    # ============ Supabase Auth Tests ============
    def test_register_user(self):
        """Test POST /api/auth/register for new user"""
        user_data = {
            "email": "user.ui@test.local",
            "password": "ChangeMe!123",
            "full_name": "Test User UI"
        }
        
        success, response = self.run_test(
            "Register New User",
            "POST",
            "/api/auth/register",
            200,
            data=user_data
        )
        
        if success:
            if "user_id" in response and "email" in response:
                print(f"   User registered successfully: {response['email']}")
                print(f"   User ID: {response['user_id']}")
            else:
                print("⚠️  Warning: Registration response missing expected fields")
        return success

    def test_login_admin(self):
        """Test POST /api/auth/login for admin user"""
        admin_data = {
            "email": "admin@cryptoboost.world",
            "password": "ChangeMe!123"
        }
        
        success, response = self.run_test(
            "Login Admin User",
            "POST",
            "/api/auth/login",
            200,
            data=admin_data
        )
        
        if success:
            if "access_token" in response:
                self.admin_token = response["access_token"]
                print(f"   Admin login successful, token obtained")
            else:
                print("⚠️  Warning: Login response missing access_token")
        return success

    def test_login_user(self):
        """Test POST /api/auth/login for regular user"""
        user_data = {
            "email": "user.ui@test.local",
            "password": "ChangeMe!123"
        }
        
        success, response = self.run_test(
            "Login Regular User",
            "POST",
            "/api/auth/login",
            200,
            data=user_data
        )
        
        if success:
            if "access_token" in response:
                self.user_token = response["access_token"]
                print(f"   User login successful, token obtained")
            else:
                print("⚠️  Warning: Login response missing access_token")
        return success

    def test_me_admin(self):
        """Test GET /api/me with admin token"""
        if not self.admin_token:
            print("❌ Skipping - No admin token available")
            return False
            
        success, response = self.run_test(
            "Get Admin Profile",
            "GET",
            "/api/me",
            200,
            token=self.admin_token
        )
        
        if success:
            if "role" in response and response["role"] == "admin":
                print(f"   Admin profile verified: {response.get('email', 'N/A')}")
            else:
                print(f"⚠️  Warning: Expected admin role, got: {response.get('role', 'N/A')}")
        return success

    def test_me_user(self):
        """Test GET /api/me with user token"""
        if not self.user_token:
            print("❌ Skipping - No user token available")
            return False
            
        success, response = self.run_test(
            "Get User Profile",
            "GET",
            "/api/me",
            200,
            token=self.user_token
        )
        
        if success:
            if "role" in response:
                print(f"   User profile verified: {response.get('email', 'N/A')} (role: {response['role']})")
            else:
                print("⚠️  Warning: Profile response missing role")
        return success

    # ============ Admin Tests ============
    def test_admin_create_plan_as_admin(self):
        """Test POST /api/admin/plans with admin token (should succeed)"""
        if not self.admin_token:
            print("❌ Skipping - No admin token available")
            return False
            
        plan_data = {
            "name": "Test Premium Plan",
            "min_amount": 1000,
            "profit_percent": 15.5,
            "duration_days": 30,
            "description": "Test plan created by admin"
        }
        
        success, response = self.run_test(
            "Admin Create Plan (Should Succeed)",
            "POST",
            "/api/admin/plans",
            200,
            data=plan_data,
            token=self.admin_token
        )
        
        if success:
            print("   Plan created successfully by admin")
        return success

    def test_admin_create_plan_as_user(self):
        """Test POST /api/admin/plans with user token (should fail with 403)"""
        if not self.user_token:
            print("❌ Skipping - No user token available")
            return False
            
        plan_data = {
            "name": "Unauthorized Plan",
            "min_amount": 500,
            "profit_percent": 10.0,
            "duration_days": 15
        }
        
        success, response = self.run_test(
            "User Create Plan (Should Fail 403)",
            "POST",
            "/api/admin/plans",
            403,
            data=plan_data,
            token=self.user_token
        )
        
        if success:
            print("   Correctly rejected user attempt to create plan")
        return success

    # ============ User Tests ============
    def test_user_create_investment(self):
        """Test POST /api/user/investments"""
        if not self.user_token:
            print("❌ Skipping - No user token available")
            return False
            
        investment_data = {
            "amount": 500,
            "plan_id": "test-plan-id",
            "status": "active"
        }
        
        success, response = self.run_test(
            "Create User Investment",
            "POST",
            "/api/user/investments",
            200,
            data=investment_data,
            token=self.user_token
        )
        
        if success:
            print("   Investment created successfully")
        return success

    def test_user_create_transaction(self):
        """Test POST /api/user/transactions"""
        if not self.user_token:
            print("❌ Skipping - No user token available")
            return False
            
        transaction_data = {
            "type": "deposit",
            "amount": 1000,
            "currency": "USDT",
            "status": "pending"
        }
        
        success, response = self.run_test(
            "Create User Transaction",
            "POST",
            "/api/user/transactions",
            200,
            data=transaction_data,
            token=self.user_token
        )
        
        if success:
            print("   Transaction created successfully")
        return success

    def test_user_get_investments(self):
        """Test GET /api/user/my-investments"""
        if not self.user_token:
            print("❌ Skipping - No user token available")
            return False
            
        success, response = self.run_test(
            "Get User Investments",
            "GET",
            "/api/user/my-investments",
            200,
            token=self.user_token
        )
        
        if success:
            if isinstance(response, list):
                print(f"   Retrieved {len(response)} investments")
            else:
                print("   Retrieved investments data")
        return success

    def test_user_get_transactions(self):
        """Test GET /api/user/my-transactions"""
        if not self.user_token:
            print("❌ Skipping - No user token available")
            return False
            
        success, response = self.run_test(
            "Get User Transactions",
            "GET",
            "/api/user/my-transactions",
            200,
            token=self.user_token
        )
        
        if success:
            if isinstance(response, list):
                print(f"   Retrieved {len(response)} transactions")
            else:
                print("   Retrieved transactions data")
        return success

def main():
    print("🚀 Starting CryptoBoost Backend API Tests - Supabase Integration")
    print("=" * 70)
    
    # Initialize tester
    tester = CryptoBoostAPITester()
    
    # Run basic health tests first
    basic_tests = [
        ("Health Endpoint", tester.test_health_endpoint),
        ("Roles Endpoint", tester.test_roles_endpoint),
        ("Sync Time Endpoint", tester.test_sync_time_endpoint),
        ("Echo Action Endpoint", tester.test_echo_action_endpoint),
    ]
    
    print(f"\n{'='*25} BASIC API TESTS {'='*25}")
    for test_name, test_func in basic_tests:
        print(f"\n{'-'*20} {test_name} {'-'*20}")
        try:
            test_func()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
            tester.tests_run += 1
    
    # Run authentication tests
    auth_tests = [
        ("Register New User", tester.test_register_user),
        ("Login Admin", tester.test_login_admin),
        ("Login User", tester.test_login_user),
        ("Get Admin Profile", tester.test_me_admin),
        ("Get User Profile", tester.test_me_user),
    ]
    
    print(f"\n{'='*25} AUTHENTICATION TESTS {'='*25}")
    for test_name, test_func in auth_tests:
        print(f"\n{'-'*20} {test_name} {'-'*20}")
        try:
            test_func()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
            tester.tests_run += 1
    
    # Run admin tests
    admin_tests = [
        ("Admin Create Plan (Admin)", tester.test_admin_create_plan_as_admin),
        ("Admin Create Plan (User - Should Fail)", tester.test_admin_create_plan_as_user),
    ]
    
    print(f"\n{'='*25} ADMIN TESTS {'='*25}")
    for test_name, test_func in admin_tests:
        print(f"\n{'-'*20} {test_name} {'-'*20}")
        try:
            test_func()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
            tester.tests_run += 1
    
    # Run user tests
    user_tests = [
        ("Create Investment", tester.test_user_create_investment),
        ("Create Transaction", tester.test_user_create_transaction),
        ("Get My Investments", tester.test_user_get_investments),
        ("Get My Transactions", tester.test_user_get_transactions),
    ]
    
    print(f"\n{'='*25} USER TESTS {'='*25}")
    for test_name, test_func in user_tests:
        print(f"\n{'-'*20} {test_name} {'-'*20}")
        try:
            test_func()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
            tester.tests_run += 1
    
    # Print final results
    print(f"\n{'='*70}")
    print(f"📊 Test Results Summary")
    print(f"{'='*70}")
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