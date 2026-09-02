# Give Your Loop a Heartbeat

Picture this: it's 9:40 a.m., and you're doing the same thing you did yesterday — opening the agent, typing "what's left on this?" and waiting. You're the timer. You're the alarm clock your loop keeps setting itself off on. That's not a loop working for you — that's you working for the loop.

This chapter is about fixing that, and the fix is deceptively simple. A loop without a heartbeat is just a one-off run: it happens when you say so. Give it a heartbeat — a cadence, a rhythm — and it starts waking itself up, checking what it's supposed to check, and acting on what it finds. You stop poking the agent every time. The agent starts poking itself on schedule, and you only show up when something lands in your inbox.

Everything in this chapter is already shipped. The same primitives exist in Codex and Claude Code, under slightly different names, doing the same job. So you don't need new tools. You need one small design decision: what does this loop check, how often does it wake up, and what does "done" mean?

## A Heart You Set and Forget

In the Codex app, you make one in the Automations tab. You pick the project, the prompt it will run, how often it should wake up, and whether it runs on your local checkout or on a background worktree — a second copy of the repo, so the run can't trample your working files. Runs that find something land in a Triage inbox. Runs that find nothing quietly archive themselves, which is nice.

> **Fun fact:** OpenAI uses these automations internally for the boring stuff — daily issue triage, summarising CI failures, writing commit briefings, hunting bugs somebody added last week. If a loop is good enough for the boring stuff, it's good enough for your repo.

And an automation can call a skill, so the recurring thing stays maintainable — you fire the skill by name instead of pasting a giant wall of instructions into a schedule nobody will ever update.

Claude Code reaches the same place through scheduling and hooks. `/loop` re-runs a prompt on an interval. You can schedule a cron task — the old-school name for a scheduled job — fire shell hooks at points in the agent's lifecycle, or push the whole thing to GitHub Actions if you want it to keep running after you close the laptop.

Put it all together and you get the heartbeat: a scheduled loop waking up on a cadence, checking its watchlist, and acting on what it finds. It reads whatever you told it to watch — new issues, failed builds, recent commits — and if something matters, it files the ticket, opens the PR, writes the briefing. If nothing matters, it goes back to sleep and archives itself. The findings come to you. You're no longer the one going around checking.

```workflow agent-meter
```

## Timer or Goal: Two Rhythms

A heartbeat can mean two different things. The first is a cadence — a timer. `/loop` re-runs on a fixed interval: it wakes, does its pass, and waits for the next tick. Simple, predictable, easy to reason about.

The second is a condition — a goal. `/goal` keeps going until a condition you wrote is actually true. And here's the part worth remembering: after every turn, a separate small model checks whether you're done, so the agent that wrote the code isn't the one grading its own homework. You hand it something like "all tests in test/auth pass and lint is clean," and you walk away. Codex has the same primitive, also called `/goal`, with pause, resume, and clear.

Real loops use both. One setup people run against Sentry — the error-tracking service — works like this: a scheduled job examines new issues, an agent diagnoses the issue and files a ticket, and a second agent looks for new tickets and writes PRs to fix them. The "goal" version defines a stop criteria like "all new Sentry reports analyzed," so you rely on draining the queue instead of a blind timer. The timer version asks "is it time to check?" The goal version asks "is the queue empty?" Neither is wrong — the goal version just stops the moment the work is done, not the moment the clock says so.

Then there's the overnight variant. One person plans at the end of the day with explicit instructions to write the plan "in a way that's tailored for usage with the /loop command," then runs `/loop every 45 minutes, iterate on the next phase of LARGE_PHASED_PLAN.md`, and lets it go overnight. The plan file is the memory. The cadence is the heartbeat.

## A Morning Loop That Checks the Lights

Now scale it up. One engineer runs about ten web services — scraping, downloading, analyzing data, processing images, and a large ETL pipeline — with a monitoring system that runs 50+ SQL statements to check for problems: did it detect enough new records from each source in the last hour, enough pricing data changes in the last twelve hours, enough projects through the ETL to hit the daily target, are the proxy credits in line with the daily allowance. Each result gets a green, amber, or red light, and the results are saved to a database.

Then a Claude Code schedule picks up the newly reported critical issues and walks them through the whole gauntlet: reproduce the issue, create a ticket, create a branch, write tests and regression tests, fix the issue, then make a PR. In the morning, the errors and the PRs are waiting. The engineer checks them, approves them, and the system has fixed itself while he slept.

He'll tell you the honest version of this: "Not bullet proof and it will stop to ask me questions but it's made my life so much easier." That sentence is the whole chapter. The loop stops when it's not sure, instead of guessing and plowing on. And when a new problem shows up that the system wasn't monitoring, he uses a skill to write a new detection — and that detection ends up in the loop automatically. The loop grows itself.

## What It Takes to Trust It Running

Here's the part the demos skip: a loop running unattended is also a loop making mistakes unattended. Verification is still on you. The loop's "it's done" is a claim, not a proof — which is exactly why the stop condition is checked by a separate model, and why you still read the PRs in the morning.

The second thing that earns trust is memory. The state file — markdown or issue board, anything that lives outside the conversation — is the spine of the whole thing. It remembers what got tried, what passed, what's still open, so tomorrow morning's run picks up where today's stopped. Without it, every beat starts from zero.

And remember the shape of the risk: two people can build the exact same loop and get completely opposite results. One uses it to move faster on work they understand deeply. The other uses it to avoid understanding the work at all. The loop doesn't know the difference. You do. A heartbeat that beats while you sleep is only useful if you still have an opinion about what it beats on.

## Try It

> **Try it:** Pick one thing you already check by hand — a CI dashboard, an error log, a "any new issues?" sweep — and give it the smallest heartbeat you can: a `/loop` cadence, a cron task, or an automation in your agent's UI, with one prompt and one stop condition ("all new issues triaged," not "run for an hour") — five minutes of setup, and you'll feel the difference between prompting a tool and designing a rhythm the first time it fires without you.

Give your loop a heart: set the cadence, name the stop condition, and let the findings come to you. The loop works while you sleep. The reading, the judgment, the "no, that's wrong" — that stays yours. Build the loop, but build it like someone who intends to stay the engineer, not just the person who presses go.
