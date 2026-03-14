# Load Tests

Performance tests using [k6](https://grafana.com/docs/k6/latest/).

## Prerequisites

Install k6:

```bash
# macOS
brew install k6

# Linux
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D68
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6
```

## Running Tests

### Situation Polling (30 students, 60s)

```bash
SESSION_ID=<your-session-uuid> BASE_URL=http://localhost:3000 \
  k6 run load-tests/situation-poll.js
```

### Response Burst (30 students, 10s burst)

```bash
SESSION_ID=<your-session-uuid> SITUATION_ID=<situation-uuid> BASE_URL=http://localhost:3000 \
  k6 run load-tests/respond-burst.js
```

## Reading Results

k6 outputs metrics including:

| Metric | Target |
|--------|--------|
| `http_req_duration p(95)` | < 200ms (polling), < 500ms (burst) |
| `http_req_failed` | < 1% |
| `checks` | 100% pass rate |

## Performance Thresholds

- **Situation polling**: p95 < 200ms, p99 < 500ms, error rate < 1%
- **Response burst**: p95 < 500ms, 0% race condition (409), error rate < 1%
