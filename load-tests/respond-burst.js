import http from "k6/http";
import { check, sleep } from "k6";

/**
 * Response burst load test.
 *
 * Simulates 30 students submitting responses in a 10-second burst.
 * Verifies no race conditions (0% of 409 errors on the same question).
 *
 * Usage:
 *   SESSION_ID=<uuid> SITUATION_ID=<uuid> BASE_URL=http://localhost:3000 \
 *     k6 run load-tests/respond-burst.js
 */

const SESSION_ID = __ENV.SESSION_ID || "00000000-0000-0000-0000-000000000000";
const SITUATION_ID = __ENV.SITUATION_ID || "00000000-0000-0000-0000-000000000001";
const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export const options = {
  scenarios: {
    burst: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "2s", target: 30 },
        { duration: "8s", target: 30 },
        { duration: "2s", target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.01"],
    "checks{check:no_409}": ["rate==1"],
  },
};

export default function () {
  const studentId = `student-burst-${__VU}-${__ITER}`;
  const url = `${BASE_URL}/api/sessions/${SESSION_ID}/respond`;

  const payload = JSON.stringify({
    studentId,
    situationId: SITUATION_ID,
    text: `Response from VU ${__VU} iteration ${__ITER}`,
  });

  const res = http.post(url, payload, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    tags: { name: "respond-burst" },
  });

  check(res, {
    "status is 200 or 400": (r) => r.status === 200 || r.status === 400,
    "no_409": (r) => r.status !== 409,
    "response time < 500ms": (r) => r.timings.duration < 500,
  });

  sleep(0.3 + Math.random() * 0.5);
}
