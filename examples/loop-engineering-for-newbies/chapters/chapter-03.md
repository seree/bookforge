# The Hardest Part Is Knowing When to Stop

You've seen the scene before. An agent has been running for a while, churning through the same file, and the build still fails. It looks busy — genuinely busy — and nobody can tell whether it's making progress or just spinning its wheels. The loop isn't broken. It's doing exactly what it was told: keep going. One commenter on an AI agents forum put it bluntly: "You don't want it. You want stop clauses. Loop engineering is really good at eating tokens."

That one line is the whole chapter. Loops are easy to start. Knowing when to stop is the actual engineering.

Here's the big idea: a loop without a stopping rule is a resource sink, not a tool. Without explicit termination logic, every iteration is a bet that the next one will be the last. Good loop engineering treats stop conditions as a first-class design requirement, not an afterthought — timeouts, iteration caps, and budget guards belong in the design, not as patches you add after the loop misbehaves. Everything in this chapter is about designing the exits before you need them.

## "Done" means two different things

Picture a line cook who stops talking to you. Does that mean the dish is ready? Maybe. Or maybe they ran out of ideas mid-sauté.

Agents have the exact same ambiguity. When the model produces a final response with no pending tool calls, its turn ends. But a terminal message ends the turn; it does not mean your goal was satisfied. The model may have returned a clarifying question, a partial result, or an answer that needs follow-up.

That's the trap that catches beginners. You ask an agent to migrate a function. It ends its turn with "done." You look: the tests still import the old name. The turn ended. The goal did not. Same shape, different costume: you ask for a migration script and the agent ends its turn with "which database should I target?" A perfectly reasonable question — but nothing has been built, and a harness that treats silence as success will happily file the run as complete. This distinction gets trickier, not easier, as tasks grow longer and more complex: the more steps between the prompt and the finish line, the more room there is for "stopped" to mean something other than "finished."

So the fix is to make the check explicit. A goal-completion check is its own stop condition: an objective-specific predicate, not merely the absence of tool calls. In practice, that means the harness asks a checkable question instead of taking silence for consent.

Here's what that idea looks like in the wild. One practitioner runs a morning job that diagnoses new error reports, and the "goal" version of that loop defines its stop criterion as "all new Sentry reports analyzed" — so it drains the issue queue instead of relying on a blind timer. For a coding loop, the same move looks like "do all tests pass and are there no linting errors?" That question can be checked. "Is the code done?" is a feeling, and feelings don't terminate loops.

## The toolbox of stop conditions

A well-designed agent loop defines explicit stop conditions — and more than one. The standard toolbox looks like this:

- The model produces a final response with no pending tool calls.
- A goal-completion check returns true.
- A maximum number of iterations is reached.
- A wall-clock timeout expires.
- An error occurs that the agent cannot recover from.
- The harness identifies a failure mode, such as the agent repeating the same action without progress.
- The agent explicitly invokes an exit action or sets a completion flag.

Each one is a different kind of tripwire, and you want all of them armed. No single exit is enough on its own: a poorly worded goal check can be fooled into passing, an iteration cap can cut a long-but-healthy run short, and a timeout alone can't tell a stuck loop from a slow one. Stacking them means each covers the gaps the others leave. The iteration cap is a speed limit: one example harness defaults to 10 iterations and adds a 60-second wall-clock cap on top, because a loop that runs indefinitely burns through tokens with every call. The timeout is the curfew, for when work drags on in slow motion. The goal check is the actual definition of done. And failure detection is the smoke alarm that notices the fire before the cap does.

Here is the principle underneath the list: a loop should break not only when work completes, but when work stops progressing.

This is how explicit stop conditions keep a loop from running forever: every exit is checked, and the first one to fire wins.

```workflow agent-constrain
```

> **Fun fact:** The failure detector has a rule of thumb worth stealing. If the agent calls the same tool with identical arguments for a third consecutive iteration, that's a strong signal it is stuck, not working. A well-instrumented harness keeps a window of recent tool calls, detects the repetition, and exits with a diagnostic instead of spending the remaining budget on a stalled run. Oscillation — ping-ponging between two states — belongs to the same family of detectable failures.

## Write down how you'll stop before you start

Here's the discipline that ties it all together: decide where the loop ends before the loop begins. Write down what "done" looks like before you write any loop logic, and be specific. "All tests pass and no linting errors" is a termination condition. "The code looks good" is not — nothing in the world can be checked against it, so the loop can never prove itself finished.

Do the same for failure. "After 10 iterations with no progress, escalate to human review" is a failure exit. Without one, your loop has no floor. In practice this is just two extra lines at the top of your prompt or plan — what "done" means, and what "give up" means — decided once, clearly, instead of on the fly at the moment it matters most. And the escalation should be specific: a generic "help me" is insufficient. When the loop hands off to you, it should describe exactly what information or decision is blocking progress, so a human can actually unblock it in one pass.

Vague goals make all of this worse, not better. "Make the app better" produces infinite loops or meaningless output, because nothing ever qualifies as done. "Make all unit tests pass" gives the loop a real exit condition, because something does.

And watch for the spinning trap, which is the most expensive kind of quiet failure. A loop that retries the exact same action after the same error isn't learning — it's spinning. Real adaptation changes something between attempts: the approach, the input, the strategy. If nothing changes, the loop is just a treadmill that bills for electricity.

## Try it

> **Try it:** Next time you hand an agent a task, write two sentences before you start: one for success ("all tests pass and no linting errors") and one for failure ("after 10 iterations with no progress, stop and show me what you tried"). It takes five minutes, and it turns "I hope it stops" into "it will stop, and here's how."

## The takeaway

- "Done" is a check, not a vibe. A terminal message ends the turn; only a goal check closes the task.
- Give every loop several exits: an iteration cap, a wall-clock timeout, a goal predicate, a failure tripwire.
- Write the stop conditions down before you start — specific enough to evaluate.
- A loop that retries the same action after the same error isn't learning. It's spinning.
