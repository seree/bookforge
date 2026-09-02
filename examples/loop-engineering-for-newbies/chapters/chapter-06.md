# Two Agents, Two Checkouts

You've got your first loop running nicely, and you think: great, let's do two of them. So you point agent A at the auth bug and agent B at the flaky test. Twenty minutes later you look at the repo and feel your stomach drop. Both of them rewrote the same config file. One agent's fix is gone, overwritten by the other's, and neither one is about to apologize.

That's what happens the moment you run two agents. Files start colliding. This chapter is about the fix, and about why the fix doesn't end with the fix.

One thing to flag up front. "Two agents, two checkouts" is really a two-part rule plus a caveat. The first part is physical: keep parallel loops in separate working directories. The second part is mental: keep each agent's context clean by delegating noisy work to subagents. And the caveat is the part people skip — how many loops you can actually run is limited by your attention, not the tool.

## The collision problem

Picture it: two engineers assigned the same feature, both editing the same lines of the same file, and neither one knows the other is there. Now make them agents. Same disaster, faster.

Two agents in one working tree are like two blindfolded painters, each repainting the same wall from memory. Each one is doing its job. The result is a mess that belongs to neither — and it often looks plausible at a glance, because every line in it is real code that some agent actually wrote. It just was never assembled by anyone who saw all of it.

This is the failure mode you hit the moment two loops share one working tree. The multi-agent setup sounds elegant on paper. A planning agent breaks the work into subtasks. Several executor agents each take a subtask in parallel. A reviewer agent checks the results and routes failures back for another try. It works beautifully until the executors discover they all wanted to write the same file. In a shared checkout, nobody talks to anyone first. Whoever writes last simply wins, and the other agent's work quietly disappears into the void.

## Worktrees: your own apartment, same building

The fix is a git worktree. A worktree is a separate working directory on its own branch, sharing the same repo history — so one agent's edits literally cannot touch the other agent's checkout. Think of a building where each agent gets its own apartment and its own key. The front desk and the plumbing are shared, but nobody is sneaking into your kitchen to move the furniture.

The tools ship this for you. Codex builds worktree support right in, so several threads can hit the same repo at once without bumping into each other. Claude Code gets you the same isolation with plain `git worktree`, a `--worktree` flag that opens a session in its own checkout, and an `isolation: worktree` setting you stick on a subagent so each helper gets a fresh checkout that cleans itself up after.

> **Fun fact:** In Claude Code, that subagent checkout is self-cleaning. The helper gets a fresh worktree, does its job, and the whole thing disappears when it's done. The parallel agent leaves behind nothing but its diff.

There's another thing you'll like: a worktree is also a branch. When an agent's work is done, its branch is just a normal branch. You review the diff like anything else, merge it if you're happy, and the checkout goes away. Nothing gets merged in magically — which is exactly why this is a worktree, not a fork of your repo.

## Isolation, the context edition

Here's the twist: a worktree only fixes half the problem.

The second collision happens inside the agent's head. Context is cumulative. Every message, tool result, and model response the agent has seen rides along into every new call it makes. An agent that has been chewing through thirty files carries all thirty into its next decision, even if nine of them were irrelevant. So when you run work in parallel, you want each agent to start with a clean context, focused on the one slice it owns.

That's what the subagent-as-tool pattern gives you. The main agent delegates a bounded subtask — "review these files," "find everywhere we touch the auth module" — to a fresh subagent that starts with an empty context. The subagent does the heavy lifting in its own context window, and only the final result comes back. All the intermediate work gets discarded, so the main agent's context stays small no matter how much the subagent chewed through. It's like sending a sous-chef to the walk-in: you get back one plated dish, not the chaos of the entire kitchen.

That's why isolation is a context strategy, not just a parallelism strategy. Even a single agent benefits from it. Hand the noisy research off to a subagent and your main loop stays sharp.

Picture your main agent mid-task, and it needs to know how forty files use the config loader. Read them all itself, and those forty files ride along in its context from that point on, muddying every later decision. Hand the job to a subagent instead: it reads the files, writes a two-paragraph summary, and returns. Your main loop grew by two paragraphs, not forty files.

And the pattern scales further than you'd expect. One relentless multi-subagent design, called RelentlessAgent, ran up to about 10,000 sequential sub-sessions, each one receiving only the original task plus a summary of everything done so far. The main context never bloated, because only summaries ever crossed back.

There's a tradeoff, though. Subagents burn more tokens, because each one does its own model and tool work. Spend them where a second opinion is genuinely worth paying for.

## The real ceiling: you

Here's the part that doesn't get marketed. Worktrees take away the mechanical collision, but they don't take away you.

Here's my argument, and I mean it as this book's position: the ceiling on how many agents you can run in parallel is not the tool. It's your review bandwidth — how much time you can actually spend reading what the agents produced.

Call it the orchestration tax. Every agent you add creates another stream of output that only you can judge. Two agents means two review queues. Five agents means five. The agents can work at machine speed, but your review lane is a single human being, and every diff, every test result, every "done!" claim has to pass through it, one at a time.

What does review bandwidth look like in practice? It's reading the diff and catching the one subtle mistake. It's running the tests the agent says passed. It's checking that the fix matches what you actually wanted, not just that the build is green. Every agent, every "done!" comes with that bill attached, and it's your time.

So the practical advice is boring and true: start with two agents and two checkouts, and only add a third when your reviews of the first two start feeling boring. If your queue is always long, the problem isn't the tool. You're running more loops than your attention can absorb.

## Try it

> **Try it:** Open your repo and make a second checkout with git's worktree command — in most setups, `git worktree add ../my-repo-feature new-feature-branch` does it. Then point one agent at each checkout and give them the same tiny task. Five minutes, and you'll have felt the separation with your own hands: two agents, two checkouts, zero collisions.

## The takeaway

- When two agents share one working tree, file conflicts are the failure mode — last write wins, silently.
- A git worktree gives each agent its own checkout on its own branch, sharing the repo history. `--worktree` and `isolation: worktree` do this for you.
- Isolation is also a context strategy: subagents start clean, do the heavy work, and only the summary comes home.
- The real ceiling is your review bandwidth. Scale the agents to your attention, not to the tool.
