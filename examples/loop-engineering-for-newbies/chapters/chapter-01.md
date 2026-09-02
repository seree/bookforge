# Stop Prompting, Start Looping

You know the ritual: open a chat window, type a prompt, read the output, decide what's wrong, type the next prompt. For two years, that back-and-forth was the whole job with coding agents. The agent was a tool, and you were holding it the entire time, one turn after the other.

Then, out of the blue, the people who build these tools started saying they no longer do that. Peter Steinberger of OpenClaw: "You shouldn't be prompting coding agents anymore. You should be designing loops that prompt your agents." Boris Cherny, head of Claude Code at Anthropic, put it even more bluntly: "I don't prompt Claude anymore. I have loops running that prompt Claude and figure out what to do. My job is to write loops."

This book is about what those two sentences actually mean: not a new model trick, not a new subscription — a shift in who does the work. The one-prompt-at-a-time era is ending, and the people closest to the tooling are the first to say so.

## What "loop engineering" actually means

If the term sounds like more jargon, you are in good company. Addy Osmani, who wrote the post that basically named this field, defines it in one sentence: "Loop engineering is replacing yourself as the person who prompts the agent. You design the system that does it instead."

A loop, in this sense, is a recursive goal: you define a purpose, and the AI iterates until complete. You stop handing it work prompt by prompt, and you build a small system that finds the work, checks the result, and decides the next thing — then lets that system poke the agents instead of you.

> **Fun fact:** One Towards AI piece opened with a game of AI buzzword bingo: prompt engineering, context engineering, vibe coding, spec-driven development, agentic code engineering, deep agents, harness engineering — and now, loop engineering. "Another term has entered the chat, morphed through a few names and focus areas." If that list makes you want to throw your hands up, keep going: the term is new, but the idea is the oldest trick in software.

## The bottleneck is not the model — it is you

A piece on Towards AI put it in the headline itself: the bottleneck is not the model. It is you. Stop being the loop.

That cycle, the same piece observed, "is the exact bottleneck loop engineering is designed to break." The model "does something impressive on step three, then..." — and the rest of that sentence is you. You are the one who notices the failed test, remembers which file changed, and types the next instruction. The model is fast. You are the bottleneck.

The skeptics have less charity. In one Reddit thread, a commenter replied: "It's okay. Loop engineering doesn't exist. It's just scheduled jobs and event triggers that make an agent go brrrr." And honestly? They are right that the pieces are old. Another commenter runs a morning job that examines new issues and files tickets; a second agent picks those up and attempts the fix. Build, test, observe, repeat — the same loop developers have run for decades, just with a machine doing the typing.

So what is new? As one of them put it: "a level of automation higher than 'you have to prompt the coding agent for every problem.'" The shift is not the parts; it is where you stand: from the one who checks the logs and types the next line, to the person who designed the machine that does all of that — and shows up when the machine needs a human.

One asterisk: loops burn tokens. Osmani flags it up front — it is "still early," and you "absolutely have to be careful about token costs." One reply in that thread was simply "tokens go brrrrr." That is not a joke to laugh at and forget.

## Why this era is ending now

You might wonder: if the pieces are old, why is it a "thing" now? Osmani's answer: this "is not really a tool thing anymore." A year ago, if you wanted a loop, you wrote a pile of bash and maintained that pile forever. Now the pieces just ship inside the products.

Steinberger's list of loop ingredients maps almost exactly onto Codex, and almost the same onto Claude Code:

- **Automations** — a heartbeat that runs discovery and triage on a schedule, so you are not the one going around checking.
- **Worktrees** — isolated branches, so two agents working in parallel don't step on the same files.
- **Skills** — project knowledge written down once, so the agent doesn't re-derive your conventions from scratch every run.
- **Plugins and connectors** — MCP connections to your real tools, so the loop opens the PR and updates the ticket instead of just telling you what it would do.
- **Sub-agents** — one agent writes the code, a different one checks it, because the model that wrote the code is way too nice grading its own homework.

Both products have all five now, plus a sixth thing that sounds too simple to matter: a memory file. Markdown, a Linear board — anything that lives outside the conversation. "The agent forgets between runs. The repo doesn't."

And here is the era-change part: once you notice the shape is the same in both tools, "you stop arguing about which tool, you just design a loop that still works no matter which one you happen to be sitting in." A commenter saw the same arc in infrastructure: commands by hand, then automated commands, now automated prompts. "The real value is no longer in writing the perfect prompt," they wrote, "but in designing systems that can discover, execute, verify, and improve work autonomously."

## What one loop looks like

Stick it together and a single thread turns into a little control panel. An automation runs every morning on the repo. Its prompt calls a triage skill that reads yesterday's CI failures, the open issues, and the recent commits, and writes the findings into a markdown file. For each finding worth doing, the thread opens an isolated worktree; one sub-agent writes the fix, and a second reviews it against the project skills and existing tests. Connectors let the loop open the PR and update the ticket. Anything the loop cannot handle lands in a triage inbox for a human. The state file remembers what got tried and what is still open, so tomorrow's run picks up where today stopped.

And look at what you did there: you designed it one time, and you did not prompt any of those steps. That is Steinberger's whole point made real — the same loop in Codex or in Claude Code, because the pieces are the same pieces.

## Try it

> **Try it:** Tonight, take one nag you are currently hand-prompting — a CI failure summary, a morning issue triage, that build flake you keep re-explaining — and write down the loop for it on one line: what runs, on what schedule, and what verifiable condition counts as done ("all tests in test/auth pass and lint is clean," say). Five minutes on paper, no code. If you can write the stop condition, you have a loop design. If you cannot, you have just found out which task you are still prompting by hand — and that is a useful answer too.

Why that exercise? Because a loop without a verifiable stop condition is just a timer with a bill — and the stop condition is the one thing a loop cannot decide for you on its own.

## The takeaway

- The one-prompt-at-a-time era is ending: the tooling now ships the pieces that used to be a pile of bash.
- You are not being replaced by the model — you are being moved from holding the tool to designing the machine. Cherny's point isn't that the work got easier. It is that the leverage point moved.
- The loop is token-hungry, and it doesn't know the difference between someone using it to move faster on work they understand deeply and someone using it to avoid understanding the work. You do.

Osmani's closing line fits here like it was written for you: "Build the loop. But build it like someone who intends to stay the engineer, not just the person who presses go."
