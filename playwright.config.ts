import { defineConfig, devices } from '@playwright/test'

// E2E runs against the BUILT site with pathPrefix applied — never against
// `gatsby develop`. Several failure modes only exist in the prefixed build
// (testing-strategy §5).
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  // One local retry: the real-worklet boot tests contend for audio under
  // fully-parallel workers and can wedge (~1 run in 10); a genuine
  // regression still fails twice. CI keeps its 2.
  retries: process.env['CI'] ? 2 : 1,
  reporter: process.env['CI'] ? 'github' : 'list',
  use: {
    // NOTE: tests spell out the /two-machines/ prefix in every goto — a
    // baseURL path segment is silently dropped by URL resolution for
    // root-relative paths, which is exactly the class of bug being tested.
    baseURL: 'http://localhost:9000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'bun run serve',
    url: 'http://localhost:9000/two-machines/',
    reuseExistingServer: !process.env['CI'],
    timeout: 60_000,
  },
})
