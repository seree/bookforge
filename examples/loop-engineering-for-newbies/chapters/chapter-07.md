# The Agent Forgets. The Repo Doesn't.

Picture this: it's 8 a.m., your morning loop fires up, reads the repo, and — in effect — asks you who it is, what it's doing, and why. Not because anything is broken. Because it genuinely doesn't remember. 📝

Every agent run starts with an amnesia the size of a warehouse. The model behind your loop forgets everything between runs. It has no memory of yesterday's fixes or last week's decisions. That's not a bug you can patch out of the model — it's how the thing works: a context window, full of whatever you handed it this run, and completely reset when the run ends.

So the trick every loop engineer eventually lands on is embarrassingly simple. Don't try to make the agent remember. Put what needs to be remembered where the agent can't forget it: on disk, inside the repo. The agent forgets. The repo doesn't.

## The state file is the spine

Start with the hard part. A plain agent with no persistent memory is, in agent-engineer terminology, a Level 1 loop: an LLM, a handful of tools, and a response. Every run starts cold, the context window is the only memory it has, and it resets completely when the run ends. On a long task, it repeats work it already did, loses track of decisions made earlier, and even contradicts its own earlier answers.

Memory operations are what turn that stateless process into a reasoning engine with state. For a loop, the most important memory operation is the boring one: read state before you act, write state after you act.

That's the state file. It can be a markdown file, or a Linear board, anything that lives outside the single conversation and holds what's done and what is next. It sounds too dumb to matter. It is the spine of the whole loop: it remembers what got tried, what passed, what is still open, so tomorrow morning's run picks up where today stopped.

Here's the dance, and it happens on every single run. The loop boots fresh — no conversation, no half-thoughts, no oh-right-we-were-working-on-that. But before it touches anything, it reads the on-disk state: the state file, the project conventions, the notes left by the last run. Then it works. And before it stops, it writes back what it learned, what it finished, what's still open. Fresh brain every time, same notebook forever.

```workflow agent-context
```

Notice the asymmetry. The agent's brain is rented; it's wiped at the end of every run. The notebook is owned by the repo, and it outlives every run that ever used it. When tomorrow's automation fires, it doesn't start the project over — it starts the project at whatever page the notebook says it's on.

Here's what that looks like on a real morning. An automation fires: a triage skill reads yesterday's CI failures and the open issues, then writes its findings into the state file. For each finding worth doing, the loop opens an isolated worktree, sends a sub-agent to fix the issue, and sends a second one to review the result against the project's skills and its tests. A connector opens the pull request and updates the ticket. And whatever couldn't be handled lands in your inbox — with a note in the state file about why. Tomorrow's run reads the state file and continues.

## Write your intent down once

There's a second kind of forgetting the state file doesn't fix. Every session, your agent also forgets how your project works.

This is the one you run into first. An agent starts every session cold, and it will fill any hole in your intent with a confident guess. You use pnpm here, not npm — it didn't know. We don't touch that legacy endpoint, it's on fire — it didn't know, and it tried. Without anything written down, the loop re-derives your whole project from zero every cycle.

Skills fix that. A skill is a folder with a `SKILL.md` inside holding instructions and metadata, plus optional scripts and references — the project knowledge the agent would otherwise just guess. You write it once, and the agent reads it on every run: the conventions, the build steps, the we-don't-do-it-like-this-because-of-that-one-incident. Without skills, the loop re-derives your project every cycle; with them, it compounds. That's how you stop re-explaining the same project context every session like a goldfish.

Codex runs a skill when you call it by name, or by itself when the task matches the skill's description — which is why a tight, boring description beats a clever one. You're not writing marketing copy; you're writing a trigger.

The conventions part lives in plain files, too. In Claude Code, on-disk state is plain markdown — `AGENTS.md`, progress files — or a Linear board through MCP; Codex does the same with markdown or a Linear connector. That home file at the root of your repo is not a nicety. For an unattended loop, it's the difference between an agent that asks polite questions and an agent that guesses confidently and breaks your build.

> **Fun fact:** Skills are a context trick too. A skill's short description costs only about 100 tokens at startup; the full instructions, around 2,000 tokens, only enter the context when a task actually matches. Most of your project knowledge sits on disk, charging no rent, until the moment it's needed.

## Take notes while you work

The third move is the one the agent can do for you, if you let it.

Context engineering — the discipline of managing what goes into the context window — has three core strategies: compaction, isolation, and agentic memory. Compaction is reactive: the context grows, then something trims it, and if the trimmer cut something important, that information is gone. Agentic memory is different. It moves information outside the context entirely, and the agent retrieves it on demand.

The practice has a name: structured note-taking. The agent writes notes to persistent storage as it works, then reads them back when it needs to. Think of it as the agent keeping its own `NOTES.md` through the run — what it's trying, what it's learned, what's next. Coding agents already ship this: the task list at the top of your session is progress persisted to disk, outside the context window, so the next step can pick up from a summary instead of re-reading everything.

Systems that run long tasks in fresh sessions often hand each new session only the original task plus a summary of prior work — a note, not a transcript. The agent never has to drag tens of thousands of stale tool results into every call. It reads the note, continues, updates the note. The context stays small; the work stays continuous.

An agent is only useful if it can get at information beyond the current message — prior context, retrieved knowledge, learned patterns. In a one-shot chat, that's all up to the user. In a loop, it's up to the memory you designed: the state file, the skills, the notes.

> **Rule of thumb:** If the agent has to re-read something to figure out where it was, write it down instead. Notes are cheap; re-derivation is where loops burn their tokens.

## Try it

> **Try it:** Open the repo you're working on with your agent today and add a small `PROGRESS.md` with exactly three lines: what you're trying to do, what's done, what's next. Then give your next agent task with one extra instruction: read `PROGRESS.md` first, and update it when you finish. — Five minutes of typing, and every run from now on starts where you left off instead of at zero. That's the whole agent-forgets-repo-doesn't trick, running in your own repo.

## The takeaway

The model forgets everything between runs — that's the hardware, not the bug. So you design around it with three layers of on-disk memory: a state file that holds what's done and what's next, the spine of the loop; skills and convention files that hold how your project works, written once and read every run; and working notes that hold where the current task is right now. None of it lives in the conversation. All of it lives in the repo — the only place in the system that never forgets.
