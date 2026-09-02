# Build the Loop. Stay the Engineer.

Picture this: it's the end of your day, so you write out a plan for what should get done while you sleep, point a loop at it, and close the laptop. In the morning, as one user in a big Reddit thread about the term describes it: "each morning I see the errors, I see the PR's, I check them, approve them and the system has fixed itself." That morning is what everyone building loops is chasing.

The catch is this: the machine isn't replacing you — it's asking you to upgrade. A piece of writing on the topic opens with a framing worth stealing, even though our copy of it is truncated: "The bottleneck Is Not the Model. It is you. Stop being the loop. Start designing the system that does the work."

And the people who have actually built these loops keep circling the same fine print. Even the essay's author — who thinks loop engineering "may be the future of how we work with coding agents" — admits it's "still early" and that he's skeptical. That's why this chapter reads like fine print. Three problems in particular get sharper as your loop gets better, not easier: the meter, the debt that stacks up in your head, and the calls that only a human can make. This chapter is about drawing the line — where a loop is the right tool, where it isn't, and what to do this weekend.

## What Your Loop Eats

Let's start with the meter. Addy Osmani's essay is careful about this: you absolutely have to watch token costs, because "usage patterns can vary wildly if you are token rich or poor." In the comments on the essay's LinkedIn post, one practitioner put it more plainly: "I have never overcame the idea of trusting the agent fully... A loop like this is very token hungry." And in the Reddit thread, one commenter just said: "Loop engineering is really good at eating tokens."

That's not a bug report. That's the physics. Every cycle is another round of model calls, reads, and writes, and the double-checking sub-agent burns its own tokens on top of that. The advice, then, is to spend sub-agents where a second opinion is actually worth paying for — not on everything. The same LinkedIn commenter arrives at the same place from the other side: the real job is designing the loop and optimizing token usage together — "one without another is inefficient."

Which brings you to the most useful upgrade you can make: stop clauses instead of blind timers. One commenter's answer to "should the loop keep running?" was two short sentences: "You don't want it. You want stop clauses." A stop clause is a condition the loop checks before continuing — something like "all new Sentry reports analyzed" — so it drains the queue instead of running until a timer beeps. Think of a dish rack, not an alarm clock: it's done when the rack is empty, not when the time is up.

> **Fun fact:** One commenter described a naive loop as an infinite loop that checks for a bug, fixes it, and takes a one-minute nap. Another user's entire review of the loop experts was: go ten times faster — sleep for six seconds instead of sixty.

## The Debt No One Writes Down

Here's the quiet one. In the LinkedIn comments, one person named "the hidden cost" of autonomous loops: "the mental tax of auditing code you didn't write just to keep system context." And the warning that follows is the one to keep: if a team doesn't intentionally manage that debt, "you quickly lose the ability to debug your own platform when things go sideways."

In other words, once loops run autonomously, "the real bottleneck... shifts from writing code to engineering governance." Osmani has a name for that debt: comprehension debt. "The faster the loop ships code you did not write, the bigger the gap between what exists and what you actually get." Picture it this way: a contractor renovates your whole house while you're on vacation — new plumbing, new wiring, new rooms. The house works beautifully. But you didn't hang a single fixture, and now you can't find the breaker box. The loop never warns you about this. It ships, it reports done, and it moves on — while your understanding quietly shrinks. A smooth loop just makes that gap grow faster.

The fix isn't to fire the contractor. It's to make the loop leave paperwork behind. The sharpest line from the comments: "loop engineering becomes real only when the loop is allowed to create evidence, not just output." Plans, tests, review artifacts, decision logs — anything a human can re-enter later without doing archaeology. Otherwise, the commenter warns, "the loop scales execution faster than it scales trust."

## Some Things Can't Run Unattended

The third problem is verification, and it has the fewest soft edges. "A loop running unattended is also a loop making mistakes unattended," Osmani writes. You can — and should — split the checker from the maker, because the model that wrote the code is, in the essay's words, "way too nice grading its own homework." Even then, "'done' is a claim and not a proof." The line he keeps coming back to: your job is to ship code you confirmed works.

And some calls simply don't belong in a loop at all. One person runs loops over live event streams, where no human ever presses start, and they said it best: "the hardest part wasn't designing the loop, it was knowing when to break it. Some decisions can't run unattended, regardless of how good the loop is. That's a human gate, not a prompt."

Think of it like the emergency stop button on a factory floor. The e-stop doesn't make the factory worse — it's what lets the rest of the floor run unattended in the first place. And ownership follows the same logic; one commenter's blunt version: "If you can't govern the loop, you don't own the outcome."

Which is why the essay also warns about the comfortable posture. When the loop runs itself, it's tempting to stop having an opinion and just accept what it hands back. Osmani calls that cognitive surrender — and here's the twist: the same act can be the cure or the accelerant. "Two people can build the exact same loop and get completely opposite results. One uses it to move faster on work they understand deeply. The other uses it to avoid understanding the work at all. The loop doesn't know the difference. You do."

## One Small Loop This Weekend

You don't need to build the whole factory to get the habits. Start with the part of the loop that can't scare you: the triage.

> **Try it:** This weekend, set up the smallest loop that could exist — one scheduled run that reads yesterday's CI failures (or your error log, or your open issues) and writes its findings into a plain markdown file. Give it a stop clause — "every reported failure gets a line in the file" — and that's the whole loop. In the morning, read the file and decide what's worth fixing. It's five minutes of setup, and it installs the two habits this chapter is about: a stop clause instead of a blind timer, and a human in the morning who knows exactly what happened overnight.

## The Takeaway

Loops are real, they're worth building, and the pieces already ship inside the tools you use. But don't let the machine quietly change who you are in it: the bottleneck was never the model. It's the person who decides what the loop may touch, when it stops, and what it leaves behind. Cherny's point, as Osmani reads it, isn't that the work got easier — "the leverage point moved." So go build the loop. But build it like someone who intends to stay the engineer, not just the person who presses go.
