# Refactor Plan: Fix Silent Failures & Event Handling

## 1. Diagnostic Findings
- **`addToQueue` Pattern:** The `addToQueue` function in `src/pages/index.js` catches errors but returns a resolved promise. This means `await addToQueue(...)` never throws, and subsequent code (like `setIsGenerating(false)`) always runs, potentially masking the fact that the task failed.
- **Swallowed Errors:** `onGenerate` catches errors but only alerts after retries. If an error occurs that isn't a "retryable" error (e.g. logic error), it might be swallowed or just logged to console without user feedback if `retryCount` doesn't reach max.
- **Streaming Logic:** The streaming implementation relies on `window` events. If the component unmounts or listeners are not attached correctly, events are lost.
- **API Flush:** `res.flush()` is used in `src/pages/api/generate.js` but might not exist, potentially causing buffering issues.

## 2. Reproduction Tests
- [x] Create `__tests__/queue_repro.test.js` to demonstrate `addToQueue` swallowing errors.
- [ ] Create `__tests__/api_generate.test.js` (mocked) to verify error handling in API.

## 3. Remediation Plan
- [x] **Fix `addToQueue`:** Modify `addToQueue` to propagate errors so the caller can handle them, OR ensure the caller checks for success.
- [x] **Improve Error Handling in `onGenerate`:** Ensure all errors are visible to the user, not just after 3 retries.
- [ ] **Verify Event Listeners:** Ensure `useEffect` dependencies are correct for event listeners.
- [ ] **Fix API Flush:** Safely check for `res.flush` before calling it.
- [x] **Fix Topic Overwriting:** Ensure `onGenerate` does not overwrite the Topic field with an empty string if the AI response is incomplete.
- [x] **Verify LaTeX Input:** Ensure prompt inputs pass raw strings without aggressive sanitization.

## 4. Verification
- [x] Run reproduction tests to confirm failure (Red).
- [x] Apply fixes.
- [x] Run tests again to confirm success (Green).