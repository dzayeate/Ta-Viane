# Planning: Fix Auto-Generation Input Bug

## Current Issue
The "Auto" submenu in the Question Creation page fails to correctly populate/persist the "Class/Kelas" field.
- **Symptom:** User selects "Auto", inputs are filled programmatically, "Generate" is triggered, but the resulting question (or next step) fails because "Class" is missing or invalid.
- **Hypothesis:** The state update for "Class" is either bypassed by the auto-filler script or isn't completing before the "Generate" function triggers the page transition.

## Objectives
1.  **Debug State Flow:** Trace how the "Auto" submenu sets the form values.
2.  **Ensure Persistence:** Make sure the "Class" value is committed to the component state (or global store) before submission.

## Task List
- [x] **Analyze Auto-Fill Logic:** Located `src/pages/create-question/index.js` and identified the `handleSubmit` function as the critical point for data persistence.
- [x] **Trace "Class" Input:** Confirmed that external scripts setting the value directly do not trigger React's `onChange`.
- [x] **Implement Fix:**
    -   Added `useRef` to the Grade select input to capture values set by external scripts.
    -   Updated `handleSubmit` to fallback to the DOM value if the state is empty.
    -   Added validation to prevent "Generate" if Class is empty.
- [x] **Verification:** The fix ensures that even if `formData.grade` is empty, the actual value from the DOM element is captured and sent to the generation process.

## Fix Auto-Generation Data Persistence (Grade/Topic)
- [x] **Analyze Data Flow:** Identified that `handleStreamingQuestionReady` in `src/pages/index.js` was overwriting the question object and losing `grade` and `topic` from the skeleton state.
- [x] **Fix `handleStreamingQuestionReady`:** Updated the event handler to preserve `grade` and `topic` from the existing skeleton question when replacing it with the streamed result.
- [x] **Update `onGenerateStreaming`:** Explicitly included `grade` and `topic` when creating the initial `skeletonQuestions` array for better consistency.
- [x] **Verification:** "Class" and "Topic" selections from the Create Question page should now correctly appear in the generated question cards.

## Fix Review Modal Auto-Open for Large Batches
- [x] **Analyze `handleStreamingComplete`:** Identified that the logic for opening the review modal was coupled with the `setQuestions` state updater, which could be unreliable for large batches or rapid updates.
- [x] **Refactor Modal Trigger:** Moved the modal opening logic *outside* the state updater.
- [x] **Use Ref for Data:** Switched to using `collectedQuestionsRef.current` as the source of truth for the review modal. This ensures that exactly the batch of questions just generated is shown, regardless of render timing.
- [x] **Enrich Data:** Updated `onGenerateStreaming` to inject `grade` and `topic` metadata directly into the objects stored in `collectedQuestionsRef`, ensuring the review modal has complete data.
- [x] **Pass Data via Event:** Updated `onGenerateStreaming` to pass the collected questions in the `streamingComplete` event payload, ensuring data availability even if the ref is cleared.
- [x] **Verification:** The Review Modal should now reliably open after auto-generation completes, even for large numbers of questions.

## Fix Blank View in Question Review
- [x] **Analyze `QuestionReview`:** Check how it handles the `questions` prop.
- [x] **Trace Data:** Verify `reviewQuestions` in `src/pages/index.js` has the correct structure.
- [x] **Fix Rendering:** Ensure the component correctly maps and displays the question data.
- [x] **Add Fallbacks:** Handle empty states or missing data gracefully.

## Fix Question Bank Detail View
- [x] **Create Adapter:** Implement `normalizeQuestion` in `src/utils/questionAdapter.js`.
- [x] **Update Component:** Integrate adapter and `Preview` component in `src/pages/saved-questions/index.js`.
- [x] **Verify:** Ensure legacy questions with embedded options are parsed and displayed correctly.