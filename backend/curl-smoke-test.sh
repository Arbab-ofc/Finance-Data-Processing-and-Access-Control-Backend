#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:5000}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@finance.local}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-Admin@123}"

USER_EMAIL="curl.smoke.$(date +%s)@finance.local"
USER_PASSWORD="CurlSmoke@123"

token=""
user_id=""
record_id=""
failures=0

extract_field() {
  local body="$1"
  local key="$2"
  printf '%s' "$body" | sed -n "s/.*\"$key\":\"\\([^\"]*\\)\".*/\\1/p"
}

request() {
  local method="$1"
  local path="$2"
  local data="${3:-}"
  local auth_header="${4:-}"

  local args=(-s -w '\nHTTP_CODE:%{http_code}' -X "$method" "${BASE_URL}${path}")

  if [[ -n "$auth_header" ]]; then
    args+=(-H "$auth_header")
  fi

  if [[ -n "$data" ]]; then
    args+=(-H 'Content-Type: application/json' -d "$data")
  fi

  local out
  out="$(curl "${args[@]}")"

  HTTP_CODE="$(printf '%s' "$out" | sed -n 's/.*HTTP_CODE://p')"
  BODY="$(printf '%s' "$out" | sed 's/HTTP_CODE:.*//')"
  MESSAGE="$(printf '%s' "$BODY" | tr -d '\n' | sed -n 's/.*"message":"\([^"]*\)".*/\1/p')"
}

assert_code() {
  local label="$1"
  local expected="$2"
  if [[ "${HTTP_CODE}" == "${expected}" ]]; then
    printf '[PASS] %-42s %s (%s)\n' "$label" "$HTTP_CODE" "$MESSAGE"
  else
    printf '[FAIL] %-42s expected=%s got=%s body=%s\n' "$label" "$expected" "$HTTP_CODE" "$BODY"
    failures=$((failures + 1))
  fi
}

echo "Smoke testing API at ${BASE_URL}"

request GET /health
assert_code 'GET /health' 200

request GET /api/v1
assert_code 'GET /api/v1' 200

request POST /api/v1/auth/login "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}"
assert_code 'POST /api/v1/auth/login' 200
token="$(extract_field "$BODY" token)"
if [[ -z "${token}" ]]; then
  echo "[FAIL] token extraction failed from login response"
  failures=$((failures + 1))
fi

auth="Authorization: Bearer ${token}"

request GET /api/v1/auth/me "" "$auth"
assert_code 'GET /api/v1/auth/me' 200

request POST /api/v1/auth/logout "" "$auth"
assert_code 'POST /api/v1/auth/logout' 200

request POST /api/v1/users "{\"name\":\"Curl Smoke User\",\"email\":\"${USER_EMAIL}\",\"password\":\"${USER_PASSWORD}\",\"role\":\"viewer\",\"status\":\"active\"}" "$auth"
assert_code 'POST /api/v1/users' 201
user_id="$(extract_field "$BODY" _id)"

request GET /api/v1/users "" "$auth"
assert_code 'GET /api/v1/users' 200

request GET "/api/v1/users/${user_id}" "" "$auth"
assert_code 'GET /api/v1/users/:id' 200

request PATCH "/api/v1/users/${user_id}" '{"name":"Curl Smoke User Updated"}' "$auth"
assert_code 'PATCH /api/v1/users/:id' 200

request PATCH "/api/v1/users/${user_id}/role" '{"role":"analyst"}' "$auth"
assert_code 'PATCH /api/v1/users/:id/role' 200

request PATCH "/api/v1/users/${user_id}/status" '{"status":"active"}' "$auth"
assert_code 'PATCH /api/v1/users/:id/status' 200

request PATCH "/api/v1/users/${user_id}/password-reset" '{"password":"NewSmokePass@123"}' "$auth"
assert_code 'PATCH /api/v1/users/:id/password-reset' 200

request POST /api/v1/records '{"amount":4321,"type":"expense","category":"Food","date":"2025-04-01","description":"curl smoke record"}' "$auth"
assert_code 'POST /api/v1/records' 201
record_id="$(extract_field "$BODY" _id)"

request GET /api/v1/records "" "$auth"
assert_code 'GET /api/v1/records' 200

request GET "/api/v1/records/${record_id}" "" "$auth"
assert_code 'GET /api/v1/records/:id' 200

request PATCH "/api/v1/records/${record_id}" '{"amount":4444,"description":"curl smoke updated"}' "$auth"
assert_code 'PATCH /api/v1/records/:id' 200

request DELETE "/api/v1/records/${record_id}" "" "$auth"
assert_code 'DELETE /api/v1/records/:id' 200

request GET /api/v1/dashboard/summary "" "$auth"
assert_code 'GET /api/v1/dashboard/summary' 200

request GET /api/v1/dashboard/category-breakdown "" "$auth"
assert_code 'GET /api/v1/dashboard/category-breakdown' 200

request GET '/api/v1/dashboard/trends?startDate=2025-01-01&endDate=2025-12-31' "" "$auth"
assert_code 'GET /api/v1/dashboard/trends' 200

request GET '/api/v1/dashboard/recent-activity?limit=5' "" "$auth"
assert_code 'GET /api/v1/dashboard/recent-activity' 200

if [[ "$failures" -gt 0 ]]; then
  echo
  echo "Smoke test completed with ${failures} failure(s)."
  exit 1
fi

echo
echo "All endpoint smoke checks passed."
