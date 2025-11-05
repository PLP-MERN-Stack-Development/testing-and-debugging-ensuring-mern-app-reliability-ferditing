# MERN Bug Tracker — Test Report & Coverage

This repository contains the **MERN Bug Tracker** application with unit and integration tests for both backend and frontend.  
Below are the test summary, coverage results, and quick reproduction steps. The screenshots are included from the `docs/` folder.

# Test Summary (run results)
- Test suites run (root): 12 total — **8 passed**, **4 failed**
- Server coverage summary:
  - **Statements:** 84.84%
  - **Branches:** 70.51%
  - **Functions:** 88.88%
  - **Lines:** 90.67%

> Coverage meets the required thresholds (Statements/Lines/Functions ≥ 70%). Branch coverage is **70.51%**, above the 60% minimum.

# Quick reproduction steps

1. Install dependencies
```bash
npm install
npm --prefix server install
npm --prefix client install
```

2. Start a MongoDB instance (local or Docker). Example with Docker:
```bash
docker run -d --rm -p 27017:27017 --name mern-test-mongo mongo:6
```

3. Run tests
```bash
# root (runs both client & server projects)
npm test

# server only (with coverage)
MONGO_URI='mongodb://127.0.0.1:27017/mern-bug-tracker-test' npm --prefix server test -- --coverage

# client only
npm --prefix client test -- --coverage
```

4. View coverage reports
- Server HTML report: `server/coverage/lcov-report/index.html`
- Client HTML report: `client/coverage/lcov-report/index.html`

# Screenshots (included in repo `docs/`)

### Coverage snapshot
![Coverage Report](docs/testreport.png)

### Example — unauthenticated request failure
![Unauthenticated Request](docs/NotAuthenticated.png)

### Example — authenticated request success
![Authenticated Request](docs/AuthenticationResolve.png)

# Notes on the failing tests
Some tests assert that unauthenticated requests return **401 Unauthorized**. In development the `devAutoAuth` middleware can inject a test user and a token which may make those unauthenticated expectations return `201` or `403` depending on route and middleware ordering.

If you see the client-side tests failing due to a missing testing dependency, install the missing package:

```bash
npm --prefix client install --save-dev @testing-library/jest-dom
```

Then rerun the client tests:
```bash
npm --prefix client test
```

# Common fixes
- If in CI or local environment the `mongodb-memory-server` fails to start due to network or binary download issues, run tests against a local or Docker MongoDB and set `MONGO_URI`:
```bash
MONGO_URI='mongodb://127.0.0.1:27017/mern-bug-tracker-test' npm --prefix server test
```



# Files to include in final submission
- `server/` — server code, tests, jest setup
- `client/` — React front-end, unit & integration tests
- `docs/bugsreport.png`
- `docs/NotAuthenticate.png`
- `docs/AuthenticationResolve.png`
- `README.md` (this file)

---

