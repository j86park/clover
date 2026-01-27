#!/bin/bash
# Test script for the /api/v1/metrics endpoint

BASE_URL="${1:-http://localhost:3000}"
ENDPOINT="$BASE_URL/api/v1/metrics"

echo "=============================================="
echo " API Endpoint Test: /api/v1/metrics"
echo "=============================================="
echo ""

# Test 1: No API key
echo "Test 1: No API Key (expect 401)"
echo "curl $ENDPOINT"
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$ENDPOINT")
http_status=$(echo "$response" | tail -1 | cut -d':' -f2)
body=$(echo "$response" | sed '$d')
echo "Status: $http_status"
echo "Body: $body"
echo ""

# Test 2: Invalid API key
echo "Test 2: Invalid API Key (expect 401)"
echo "curl -H 'X-API-Key: invalid_key_12345' $ENDPOINT"
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -H "X-API-Key: invalid_key_12345" "$ENDPOINT")
http_status=$(echo "$response" | tail -1 | cut -d':' -f2)
body=$(echo "$response" | sed '$d')
echo "Status: $http_status"
echo "Body: $body"
echo ""

echo "=============================================="
echo " Manual Testing Instructions"
echo "=============================================="
echo ""
echo "1. Go to your dashboard: $BASE_URL/settings/api-keys"
echo "2. Create a new API key and copy it"
echo "3. Run this command with your real key:"
echo ""
echo "   curl -H 'X-API-Key: YOUR_KEY_HERE' $ENDPOINT"
echo ""
echo "=============================================="
