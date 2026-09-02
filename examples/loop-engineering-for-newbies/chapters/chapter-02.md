# The While Loop Under Your Agent

Picture this. You tell your coding agent to add a feature to the app. Instead of answering in one breath, it starts reading files, changing a line here, running the test suite, and staring at a red failure. Then it changes approach, tries the same thing from a different angle, and runs the tests again. That is a moment worth pausing on, because almost nothing about what you just watched was a single clever call.

The magic you saw isn't one thought. It's a circle. And circles are the oldest trick in programming.

Every serious coding agent you have used — the kind that reads your repo, edits files, runs tests, and keeps going until the build passes — is running the same repeating cycle inside a single turn. Here is the definition, and it is worth keeping close: assemble context, invoke the model to reason, act on its decision, and go again until a stop condition ends the run. The harness gathers what the model needs to see, the model decides what to do next, the harness acts, and the result flows back into the context for the next round. Round after round after round.

And the reason that loop exists at all is one sentence you will want to repeat to yourself: long-horizon tasks cannot be completed in a single forward pass. A model gets a prompt, produces output, and stops. That is a forward pass. "Fix this app" is not a forward pass. It is a campaign, and something has to carry the result of each step back into the next. That something is the loop.

## The While Loop, Made Flesh

In most programming languages, a while loop is exactly what it sounds like: repeat this block of work while that condition holds true. Your agent is doing the same thing, just with a model in the middle instead of a calculator. The condition is not "i is less than ten." It is "while the task is not done," or "while the tests are still failing," or, failing that, "until the safety budget runs out."

Here is a picture worth keeping. Tuning an old radio. You twist the dial and hear static. Twist again — a sliver of the station. Twist once more, and now it is clear. You never know in advance how many twists the hunt will take, and you do not need to. You just need a way to know when you have found the station. The agent loop works the same way: act, observe the signal, decide the next twist.

> **Fun fact:** This pattern has a name and a pedigree. Most modern agent loops trace back to the ReAct pattern — Reason plus Act — which came out of research at Princeton and Google. The whole idea is to interleave reasoning steps with action steps: the model thinks out loud, takes an action, sees what happened, thinks again, and acts again.

## Why Coding Is the Loop's Natural Home

Some tasks are almost one-shot. "Summarize this paragraph" is basically a forward pass with a coat on. You could put it in a loop, sure, but the loop would mostly just spin in place.

Coding is the opposite, and that is why the loop lives here. Coding is a naturally iterative domain. Even experienced engineers do not write perfect code on the first try. They run it, see the error, fix it, and run it again. The agent is just doing what every good engineer already does, at machine speed.

Picture the standard cycle: understand the goal, write some code, run the code and observe the output or the error, reason about what went wrong, revise and re-run, and repeat until the tests pass or the task is complete. Skip that cycle and an agent is fundamentally limited. It cannot catch runtime errors, cannot adapt to environment-specific quirks, and cannot verify that what it produced actually works. The loop is what closes that gap.

The same logic explains why a deep-research agent — the kind that has to search for sources, read and evaluate what it finds, spot gaps and contradictions, search again, and then synthesize everything — cannot be a single model call either. No single LLM call can do all of that. What is required is the mechanism that lets the model reason, act, observe the result, reason again, and continue until the task is complete.

## Chain or Loop?

Here is a distinction you will keep running into. A chain is linear: step A leads to step B, step B leads to step C, and you never go back. Chains are predictable and easy to trace, and they are the right tool when you already know the road.

A loop is dynamic. The agent might go from step A to step B, discover that B did not work, backtrack, retry with a modified approach, and only then move on. That is the whole game: revisit, retry, adapt. If the task is a straight line, a chain is enough. If the road turns out to be full of potholes you did not know about — debugging, an unfamiliar API, a failing build — you want the loop.

## What Lives Inside the Circle

Quick refresher on what an "agent" even is: a computational system that perceives its environment, reasons about what it perceives, takes actions toward a goal, and keeps some form of memory. That description fits a lot of things — a thermostat, a chess engine, a human professional. What makes an AI agent distinct is that the reasoning step is handled by a large language model.

For a loop like this to actually run, an agent needs a short list of things at minimum. Instructions — a system prompt or goal that tells it what it is trying to accomplish. Memory — access to information beyond the current message, including prior context and retrieved knowledge. The ability to act — tool calls, API requests, or any operation with an external effect. And a reasoning engine — the LLM that looks at the context and decides what to do next.

Here is the part that surprises newbies: the model is only one layer of the whole machine. The other layer is the harness — the code that assembles context, executes tool calls, enforces operational constraints, and persists state. And most of the agent engineering work happens in the harness, not the model. The model reasons; the harness runs the circle. When two agents run on the same model but feel dramatically different, the difference is usually the loop design, not the model itself.

One more piece of the circle: how it ends. A well-designed agent loop defines explicit exit criteria. The model produces a final response with no pending tool calls. A goal-completion check returns true. A maximum number of iterations is reached, or a wall-clock timeout fires. Or the harness notices the agent repeating the same action without progress and cuts the run. Watch out for that last one: a loop that keeps making the same failed move is not working. It is spinning. And do not confuse "the model stopped talking" with "the job is done" — a terminal message with no further tool calls ends the agent's turn, but the user's goal may still be open.

## Try It

> **Try it:** Next time your coding agent solves a problem, count its cycles out loud: read, edit, run, observe, repeat. Five seconds of attention is enough. Do it three times and you will start seeing the loop as a visible object with a beginning, a middle, and a stop condition — which is exactly the picture you need before you start designing loops yourself.

## The Takeaway

Under every coding agent there is a while loop: assemble context, invoke the model, act, observe, and go again until a stop condition ends the run. It exists because real work does not finish in a single forward pass. Chains are for known roads; loops are for everything else. And the interesting engineering lives in the harness — the code around the model — because that is where the loop gets designed, bounded, and stopped.
