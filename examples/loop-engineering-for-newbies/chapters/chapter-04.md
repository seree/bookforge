# The Five Pieces (Plus the Memory)

A year ago, if you wanted a loop, you wrote a pile of bash — and then you maintained that pile forever, because it was yours and only yours. That's the part that quietly changed. The pieces now ship inside the products. You're no longer inventing plumbing — you're assembling one.

This chapter is about the assembly. A loop is a recursive goal: you define a purpose, and the AI iterates until it's done. And every loop is built from the same five pieces — automations, worktrees, skills, plugins and connectors, and subagents — plus a sixth thing that sounds too dumb to matter: a memory that lives outside the conversation.

Here's the good news: both products now have all five. The names differ here and there, but the capability is the same — once you notice the shape, you stop arguing about which tool and start designing loops that work wherever you sit.

## The heartbeat: automations

Picture this: it's early, you're asleep, and something is still working your repo. An automation is that something — a task that goes off on a schedule and does discovery and triage by itself. In the Codex app you pick the project, the prompt, the cadence, and where it runs — your local checkout or a background worktree. Runs that find something land in a triage inbox. Runs that find nothing just archive themselves.

Automations are what make a loop an actual loop and not just one run you did once. They're the heartbeat. Claude Code reaches the same place through different doors: /loop re-runs a prompt on a cadence, cron tasks schedule them, hooks fire at points in the agent's lifecycle, and GitHub Actions keeps everything running after you close the laptop.

> **Fun fact:** OpenAI uses these internally for boring stuff — daily issue triage, summarizing CI failures, writing commit briefings, hunting for bugs somebody added last week. Boring is exactly right: triage is the most reliable thing in the world to automate.

There's a second primitive worth knowing. /loop re-runs on a cadence, but /goal keeps going until a condition you wrote is actually true. You give it something like "all tests in test/auth pass and lint is clean" and walk away. The detail that matters: after every turn, a separate small model checks whether you're done — the agent that wrote the code isn't the one grading it. Codex has the same thing, also called /goal, with pause, resume, and clear.

## Your own room: worktrees

Run more than one agent and the files start colliding — that becomes the failure. Two agents writing the same file is the exact same headache as two engineers committing to the same lines and nobody talked to each other first. A git worktree fixes it. It's a separate working directory on its own branch, sharing the same repo history, so one agent's edits literally cannot touch the other one's checkout.

Each agent gets its own room in a shared house: same address, same history, nobody's elbow on your keyboard.

Codex builds worktree support right in, so several threads can hit the same repo at once without bumping into each other. Claude Code gives you the same isolation with git worktree, a --worktree flag for opening a session in its own checkout, and an isolation: worktree setting that gives each subagent a fresh checkout that cleans itself up afterward.

One honest warning: worktrees take away the mechanical collision, but you are still the ceiling. Your review bandwidth decides how many agents you can actually run, not the tool.

## Written down: skills and connectors

A skill is how you stop re-explaining the same project context every session, like a goldfish. An agent starts every session cold, and it will fill any hole in your intent with a confident guess. A skill is that intent written down on the outside — the conventions, the build steps, the "we don't do it like this because of that one incident" — written once, where the agent reads it every run.

The format is the same in both tools: a folder with a SKILL.md inside, holding instructions and metadata, plus optional scripts and assets. Codex runs a skill when you call it with a $ name or /skills, or by itself when your task matches the skill's description — which is why a tight, boring description beats a clever one.

Without skills, the loop re-derives your whole project from zero every cycle. With them, it kind of compounds.

If skills are what the agent remembers, connectors are what the agent can touch. A loop that can only see the filesystem is a tiny loop. Connectors, built on MCP, let the agent read your issue tracker, query a database, hit a staging API, and drop a message in Slack. That's the difference between an agent that says "here's the fix" and a loop that opens the PR, links the Linear ticket, and pings the channel once CI is green — by itself. A plugin is just how you ship both: it bundles skills and connectors so your teammate installs your setup in one go.

## The baker can't grade the cake: subagents

The most useful structural thing in a loop, by far, is splitting the one who writes from the one who checks. One of them has the idea; a different one checks it. The model that wrote the code is way too nice grading its own homework — a second agent, with different instructions and sometimes a different model, catches the stuff the first one talked itself into.

The usual split in both tools: one agent explores, one implements, one verifies against the spec.

Why it matters inside a loop specifically: the loop runs while you're not watching, so a verifier you actually trust is the only reason you can walk away.

One cost to keep in your pocket: subagents burn more tokens, because each one does its own model and tool work. So spend them where a second opinion is worth paying for, not on every little step.

## The sixth thing: memory

A markdown file, or a Linear board — anything that lives outside the single conversation and holds what's done and what's next. Sounds too dumb to matter? 🧠 It's the same trick every long-running agent depends on. The model forgets everything between runs, so the memory has to be on disk, not in the context.

The line that lands: the agent forgets, the repo doesn't.

Stick the pieces together and one loop looks like this: an automation runs every morning, its prompt calls a triage skill that reads yesterday's CI failures, open issues, and recent commits, and writes the findings to a markdown file or a Linear board. Each finding worth doing gets an isolated worktree, a subagent that writes the fix, and a second subagent that reviews that proposed fix against the project skills and existing tests. Connectors open the PR and update the ticket; anything the loop can't handle lands in the triage inbox. And the state file — the spine of the whole thing — remembers what got tried, what passed, and what's still open, so tomorrow morning's run picks up where today stopped.

That's a control panel, not a conversation.

## Try it

> **Try it:** Before your next agent session, write a tiny markdown file in your project root with three bullets — what's done, what's next, what's blocked — and tell the agent to read it first and update it last. It takes five minutes, and it's the exact memory piece every serious loop has — tomorrow's run picks up where today stopped.

## The takeaway

A loop is five pieces plus a spine: a heartbeat (automations) that finds the work, a room of its own (worktrees) so parallel agents don't collide, written-down knowledge (skills) so nothing is guessed, phone lines (connectors) so the loop can act, a maker/checker split (subagents) so "done" means something — and a memory outside the conversation, so the agent forgets but the repo doesn't. You design it once. The system does the prompting. You stay the engineer.
