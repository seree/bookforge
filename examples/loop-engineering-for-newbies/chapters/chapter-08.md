# Your Context Window Is a Budget

Your agent finished the task. It read 12 files, made 15 LLM calls, and found the bug — and it burned through about 120,000 tokens on the way, roughly $1.80 on a frontier model. Run that 50 times a day across a team, and you're looking at about $2,700 a month for a single agent workflow. The funny part: the agent didn't pay for the bug. It paid for remembering everything it had already seen.

Here's the core idea of this chapter: your context window is a budget, not a pantry. It's the agent's working memory, and every loop iteration re-pays for whatever is inside it. Each new LLM call carries every previous message and tool result, so a long loop keeps billing you for work the agent finished ages ago. That's why context engineering — deciding what goes into the window, and what gets kept, trimmed, or moved aside — has become one of the highest-leverage skills in loop engineering. It shapes the cost, the quality, and the survival of every loop you run.

## Why your loop keeps paying for everything

The agentic loop works like this: the model reasons, calls a tool, the result gets appended to the conversation, and the model reasons again — this time with the result in the mix. Why does it work that way? Because the model can't plan the next step until it has seen the last one, so every result has to come back around the loop. And here's the part that stings: by default, nothing ever gets thrown away. Every message and tool result from every previous step gets carried into every new LLM call.

A benchmark run of a naive multi-step research agent shows what that does to a bill. Iteration 1 sits at 888 tokens — just the system message and the user message. Iteration 2 hits 3,400 after a directory listing. Iteration 3 climbs to 8,900 after reading one file. Iteration 4 reaches 14,200 after a second file. By iteration 5, after a grep and a third read, the context is 18,900 tokens. Five steps, and the bill has already grown more than twenty times over.

The shape of the curve is the point. Each new step re-pays for every step before it, so a naive loop re-bills the whole history on every iteration, while a constrained loop stays narrow and pays only for what it keeps. Think of it like an overfull inbox: every LLM call is like reading the entire inbox again from the top before you're allowed to write a single reply.

```workflow agent-quadratic
```

## Three ways a full window bites back

Long tasks hit three problems at once. First, the context window fills up and requests start getting rejected outright. Second, cost scales with context size — that 18,900-token call isn't a fifth of the cost of the 888-token one, it's twenty times it, and it happens on every single iteration. Third, and the sneakiest: model performance degrades as context grows, even when the context technically still fits.

The research name for that last problem is "lost in the middle." Information buried in the middle of a long context gets less attention than information at the beginning or the end, so accuracy drops depending on where things are positioned, not just whether they fit at all.

> **Fun fact:** The window is your agent's working memory — but it works nothing like RAM. In RAM, adding more data doesn't corrupt what's already there. In a context window, adding more data can actively degrade retrieval of the stuff that's already inside.

And the tasks are only getting longer. METR benchmarks show frontier models completing tasks equivalent to about 70 hours of human work at 80% reliability, with task complexity doubling roughly every 7 months. Bigger tasks, fatter context, higher bills — unless you start managing the budget.

## Three moves that keep the window lean

Before any of the moves below, you need eyes on the budget itself: a well-run loop tracks token usage across iterations, so it knows when compaction is needed before the window fills and performance starts to sag. Then the three core strategies.

The first move is compaction: trimming right before an LLM call, triggered when context crosses a threshold. This is the "compacting..." pause you've probably seen in a coding agent. It comes in several flavors. Sliding window keeps the system message plus the most recent messages that fit in the budget. Head + tail splits the budget between the head — your task definition — and the tail — recent work — and drops the middle. Tool result clearing removes raw tool outputs from deep in the history while keeping the message structure; it's the lightest touch. Summarization compresses old messages into a summary with a fast model, which preserves information but costs an extra call and can lose resolution: the summary may omit a detail you need three steps later.

The second move is isolation: sub-agents. A coordinator agent delegates a sub-task to a specialist that works in its own context window. The specialist does the heavy lifting — reading files, calling tools, accumulating context — and only the final result crosses back. The coordinator's context stays bounded no matter how much work the specialist did.

The third move is agentic memory, which Anthropic calls "structured note-taking." The agent keeps notes in external storage — a notes file or a task list on disk — and pulls them back in on demand. Compaction trims what's already in the window; memory moves information out of the window entirely, so the agent decides what's worth remembering.

Andrej Karpathy calls context engineering "the delicate art and science of filling the context window with just the right information for the next step." Many agent failures trace back to exactly this: the model had the right capabilities, but the wrong information was in the window — or missing from it.

## What the numbers say

A code review benchmark — a 44-file Python repo, one model, two tools, five context strategies — produced a result worth staring at: the no-compaction agent scored highest, 6.0, by pure brute force. It carried full history across 50 iterations, burned 915k tokens and 22 minutes of wall time, and had only 27% duplication, because it never forgot what it had read. The catch: it used 2-6x more tokens than the compacted agents.

Compaction has its own trap, too: thrashing. The agent compacts, drops something it still needs, then re-reads the same file or re-runs the same tool — paying for the work twice. So the honest summary is that these strategies are trade-offs, not free wins.

One subtler lever: most LLM providers cache the prefix of a prompt, so message order is money. Rewriting earlier messages mid-conversation — "cleaning up" history, reordering it, injecting new instructions inline — breaks the cache. The pattern that keeps it intact is to append, never rewrite; old prompts stay exact prefixes of new ones.

And the warning from the same research: for low-complexity tasks, context engineering is less critical. Premature optimization can hurt performance. Don't build a memory palace for a job that finishes in two calls.

## Try it

> **Try it:** Run a coding agent on a small task today and divide the session's total tokens by the number of LLM calls it made (most tools report both). That ratio is the average price of accumulated context. Then run the same task a second time with one extra line of instructions — "keep a short notes file as you go, and stay tight" — and watch the number move. Five minutes, and "context is expensive" becomes a number you can track.

## The takeaway

- The window is a budget: every iteration re-pays for everything you've kept.
- A full window bites three ways: rejected requests, scaling costs, and "lost in the middle" degradation.
- Three levers: compaction (trim it), isolation (sub-agents), agentic memory (notes outside the window).
- The trade-offs are real: no compaction can win by brute force at 2-6x the tokens, and compaction can thrash.
- Don't over-engineer short tasks — measure first, then optimize.
