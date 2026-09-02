# Keep the Maker Away from the Checker

The loop declared victory in nine minutes. "Done," it said, with the confidence of a model that has never once failed a test. You clicked run anyway — and a test went red. Not because the fix was bad, exactly. It just "worked" in the way the maker believed it worked, because nothing outside the maker's own context had ever disagreed. That is the failure mode this chapter is about: the maker grading its own homework.

## Why the maker can't grade itself

Osmani puts the whole chapter in one sentence: "The most useful structural thing in a loop, by far, is splitting the one who writes from the one who checks. The model that wrote the code is way too nice grading its own homework."

It is not malice; it is geometry. The maker's entire context is its own argument — every file it read, every half-finished idea, every excuse it built for a red output. All of it sits in the same window. Ask that same context "is this right?" and it will re-render the same story, because the story is all it has. The error is rarely a lie; it is a blind spot. As Osmani puts it, "A second agent with different instructions and sometimes a different model catches the stuff the first one talked itself into." Different context, different blind spots, different verdict.

In practice, self-grading looks like this: the maker reads a failing test, decides the test is wrong, edits the test, and calls it green. Nobody pushed back, so the story held.

The split also explains why walking away is possible at all: "the loop runs while you are not watching, so a verifier you actually trust is the only reason you can walk away." If the checker shares the maker's context, you are not walking away from a system — you are walking away from one opinion, checking itself in the dark.

The same split reaches the stop condition. As the heartbeat chapter showed, `/goal` hands the "are we done?" question to a separate small model — "a fresh model decides if the loop is done instead of the one that did the work." The grader never sits in the maker's window. That is the maker/checker split applied to the exit itself.

## Explore, implement, verify

The split has a standard shape: "one agent explores, one implements, one verifies against the spec." Explore is cheap and read-only — map the code, find the relevant files, bring back a short brief. Implement does the work. Verify never reads the maker's narrative first; it re-derives the answer from the spec and the tests, and only then compares it to what the maker produced.

The verifier is also told to assume the work is wrong until the tests say otherwise — an instruction the maker was never given. In Claude Code the verifier can even be a whole team, since agent teams pass work between them; in a single-tool setup, one fresh context is enough.

The products ship this structure. In Codex, sub-agents exist only when you ask for them: you define each one as a TOML file in `.codex/agents/` with a name, a description, instructions, and optionally its own model and reasoning effort. Codex "only spawns subagents when you ask, runs them at the same time and then folds the results back into one answer." Claude Code does the same with sub-agents in `.claude/agents/`.

> **Fun fact:** Because each sub-agent gets its own model and effort setting, the trio can be deliberately asymmetric. In Codex you can make "your security reviewer a strong model on high effort while your explorer is some fast read-only thing." The checker gets the expensive brain; the scout gets the cheap one.

Each sub-agent does its own model and tool work, so a second opinion costs real tokens. The rule from the essay: spend them where a second opinion is worth paying for — security paths, shared infrastructure, anything you'd be embarrassed to review at 2 a.m. Not for a variable rename.

## A QA pass at every step

One final check is not enough, because the maker's mistakes do not stay where they happen. The pattern that fixes this is plan-execute-verify: "The agent first generates a plan, then executes it step by step, verifying each step before proceeding." Between every step sits a reviewer that "checks each output and routes failures back for correction" — a failed step goes back to the maker, not forward into the next one. One warning from the pattern's own write-up: if step two reveals the plan was wrong, the agent needs to revise the plan, not just push through.

Why the ordering matters is arithmetic. If step two builds on an unchecked mistake from step one, then steps three through eight all build on it too. By the end you are not debugging a bug; you are debugging a finished artifact with six layers of unverified assumption underneath it. Independent checks at each step keep the error where it happened, where it is cheap to kill.

```workflow agent-guard
```

And when every step has passed, the pattern keeps one final check at the top level: the loop compares the finished work against the original goal, and loops back if the whole is not what the parts promised. A string of green steps is not automatically a correct artifact.

And the bar for any check is higher than "it compiles." The question worth asking every loop is blunt: "Does the agent confirm that its solution actually works, or just that it compiles?" Compiling is the floor. A red test is a verdict from the world, not a statement from the model — which is exactly why a checker that runs the tests itself beats a checker that reads the maker's description of them.

## Making "done" mean something

The maker's "done" is a narrative: a story about what it did, told by the thing that did it. The checker's job is to re-derive "done" from the world instead — tests run fresh, the diff read line by line, the spec walked item by item — and only then compare the two. A checker that re-derives the answer independently cannot be wrong in the same way as the maker, because it does not share the maker's reasoning. It can still be wrong about its own re-derivation. That is the trade you are buying.

Concretely, that is what the second sub-agent in a morning loop does: it reviews the work against the project's skills and the existing tests, not against the first sub-agent's summary. If the standard is the maker's own report, the check is a rubber stamp. If the standard is the spec and the tests, the check is a gate.

The stop conditions from chapter three decide when a loop may end. This chapter decides what the loop may claim when it does. Same line, two jobs: a terminal message ends a turn; only a checker with different context can turn "I think it's done" into "it is done."

## Try it

> **Try it:** Take the last task your loop finished this week. Write a five-line verification checklist the maker never saw: which tests to run, which spec lines to re-check, which files to diff. Then hand that checklist to a fresh session — or a verifier sub-agent — that has not seen the maker's reasoning. If the maker's "done" survives a fresh pair of eyes, you have a real maker/checker split. If it does not, you have found exactly where your loop was self-grading.

The point of the exercise is the context, not the checklist. Same conversation, same blind spot. Different context, different verdict.

## The takeaway

- The model that wrote the code is way too nice grading its own homework — make the checker a different context, different instructions, sometimes a different model.
- Explore, implement, verify: the verifier checks against the spec and the tests, never against the maker's story.
- Check at every step, not just at the end. Unchecked errors compound; independent checks keep them cheap.
- A loop you can walk away from only exists if its verifier is one you trust. "Done" is a claim. The checker is what makes it mean something.
