import http from "k6/http";
import { check, sleep } from "k6";

/**
 * Situation polling load test.
 *
 * Simulates 30 students polling /api/sessions/{id}/situation every 2 seconds.
 * Measures latency distribution and error rates.
 *
 * Usage:
 *   SESSION_ID=<uuid> BASE_URL=http://localhost:3000 k6 run load-tests/situation-poll.js
 */

const SESSION_ID = __ENV.SESSION_ID || "00000000-0000-0000-0000-000000000000";
const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export const options = {
  scenarios: {
    polling: {
      executor: "constant-vus",
      vus: 30,
      duration: "60s",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<200", "p(99)<500"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const studentId = `student-${__VU}`;
  const url = `${BASE_URL}/api/sessions/${SESSION_ID}/situation?studentId=${studentId}`;

  const res = http.get(url, {
    headers: { Accept: "application/json" },
    tags: { name: "situation-poll" },
  });

  check(res, {
    "status is 200 or 404": (r) => r.status === 200 || r.status === 404,
    "response time < 200ms": (r) => r.timings.duration < 200,
    "has JSON body": (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch {
        return false;
      }
    },
  });

  sleep(2);
}
