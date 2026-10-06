---
layout: post
title: How do vulnerabilities scale with model improvements?
date: 2026-10-03 12:00:00
description:
tags: evaluations, security, research
categories:
thumbnail: assets/img/vulnerability-discovery-vs-capability.png
images:
  lightbox2: true
  photoswipe: true
  spotlight: true
  venobox: true
---

<style>
  blockquote.interview-quote {
    font-size: inherit;
    font-style: italic;
  }

  blockquote.interview-quote p {
    margin-top: 0;
    margin-bottom: 1em;
  }

  blockquote.interview-quote p:last-child {
    margin-bottom: 0;
  }
</style>

*Disclaimer: the ideas are mine, but I've used Claude to help edit this quickly so I can focus on other things.*

As models get better at finding vulnerabilities, do they keep finding more, or do they eventually run out? This is some thinking I've been doing as a MATS 11.0 fellow on cybersecurity evaluations. I don't have a definitive answer, but I think the question is worth laying out clearly, because the answer changes how we should defend software.

## Context

Models are finding vulnerabilities at a scale that is hard to ignore. Anthropic's [Project Glasswing update](https://www.anthropic.com/research/glasswing-initial-update) estimates that Claude Mythos Preview found 6,202 high- or critical-severity vulnerabilities in the open-source projects it scanned. Earlier, Claude Opus 4.6 found and validated more than 500 in open-source code, described in [Evaluating and mitigating the growing risk of LLM-discovered 0-days](https://www.anthropic.com/research/zero-days).

Models are also using vulnerabilities to get out of the places we put them. In [The Hugging Face incident and the road ahead](https://openai.com/index/hugging-face-incident-and-the-road-ahead/), OpenAI describes evaluation agents that found a server-side request forgery in an internal package registry and used it to reach the internet from a sandbox with no direct access. From there they found exposed Hugging Face credentials and compromised production workers.

You might think good sandbox design is enough. But sandboxes have bugs too. In [VMs won't contain cyber-capable agents](https://blog.trailofbits.com/2026/08/26/vms-wont-contain-cyber-capable-agents/), Trail of Bits put GPT-5.6-Cyber in a QEMU/KVM virtual machine and asked it to read a flag outside the VM. It escaped three times. The first two used bugs that were already disclosed but hadn't reached the packages on that machine. After the author rebuilt QEMU from current upstream, the agent found several zero-days and chained them into a reliable escape.

So what happens next? Do models run out of bugs to find, or does each new generation find a fresh batch? I heard this question discussed on the securitycryptographywhatever podcast, and Nicholas Carlini's answer is a good starting point.

> **David:** But like, do you think that we could exhaustively like actually make a piece of software more secure in the sense of like, we removed a bunch of the bugs and like, if we all run these agents for the next 2 months, like we’ll have found all of the bugs that agents are going to find aside from the margins, and it will go back to like, there are 10 people in their basement submitting the bug bounties and what are the tools they have as agents? Or is there an infinite plethora of bugs? [...] And like, are we approaching zero or yeah.
>
> **Nicholas Carlini:** [...] So first answer is that even if it was the case that you could exhaust all of the bugs with one specific language model, it’s still the case that these models are getting a lot better over time. And so you can imagine a world where we exhaust all of the bugs that can be found with, you know, Opus 4.6. And OpenAI comes out and releases GPT-5.4 [...] And then like maybe this one finds a bunch of new bugs. [...]
>
> And then the other aspect is, I like to think of this as like, okay, so fuzzers find a restricted class of bugs that are fairly easy to enumerate. And so it’s fairly small, the attack surface is fairly low. And this means that once you’ve probed it a bunch, you can sort of have hardened that shell.
>
> As you get better and the models are able to find, attack a larger attack surface, you have to do more work to exhaustively find all of the bugs that can be scanned in that surface. And each time the models get better, the space of attacks grows again. [...] it may be the case that it’s finite, but you could imagine that, yeah, the more powerful models might have a bigger surface to hit between.
{: .interview-quote}

— Nicholas Carlini, [AI Finds Vulns You Can’t With Nicholas Carlini](https://securitycryptographywhatever.com/2026/03/25/ai-bug-finding/)

## Why does this matter?

The answer tells us two things.

- **Is patching enough, or do we need more isolation?** If discovery tapers off, finding and patching bugs eventually wins. If it scales indefinitely, patching is a treadmill, and we'll need protections that don't depend on the software being bug-free, such as hardware isolation and airgaps.
- **Can we ever say something is secure against any future model?** If discovery really stops, a system secured against what one model can see stays secure against later ones. It's like a padlock: however dexterous I am, I can't open it without tools or a key. If discovery never stops, the frontier keeps moving, and "secure" only ever means secure against today's models.

## How might vulnerability discovery scale with model progress?

I see three possibilities: discovery keeps accelerating (A), it tapers off (B), or it stops (C).

<div class="row justify-content-center mt-3">
    <div class="col-sm-auto">
        {% include figure.liquid
            loading="eager"
            path="assets/img/vulnerability-discovery-vs-capability.png"
            class="img-fluid rounded z-depth-1 mx-auto d-block"
            caption="Vulnerability discovery against model capability: accelerating, tapering off, or a plateau."
        %}
    </div>
</div>

### A. Discovery scales indefinitely

A defender at capability N can harden what it understands, but a model at N+1 can still find vulnerabilities in that work. Even a defender at capability 9000 would be open to a model at 9001.

- **Past experience.** As human security work matured, we kept finding more vulnerabilities, because new capability opened new classes of bug. Fuzzing is the clear case: once people could throw generated inputs at programs for a long time, memory-safety issues showed up that review and earlier testing had missed.
- **Games like Go.** Chess and Go both have a ceiling in principle, because perfect play exists. In practice, passing the best human was not the end. AlphaGo beat Lee Sedol, and later systems such as AlphaGo Zero and KataGo kept beating the previous superhuman programs. That could mean we're still short of the ceiling, or that there's no ceiling in sight. But I'm not sure how well the game of Go works as an analogy in this domain.
- **Adversarial attacks on Go engines.** A high score doesn't mean play is robust. [Wang et al. (2023)](https://arxiv.org/abs/2211.00241) trained adversarial policies that beat superhuman KataGo over 97% of the time. They don't play stronger Go. They exploit a blind spot, and the strategy is simple enough that a human expert can copy it. The same policies lose to amateurs. High Elo is average-case strength and leaves the worst case open.
- **Adversarial machine learning more broadly.** Go is one example of a general pattern. [Szegedy et al. (2013)](https://arxiv.org/abs/1312.6199) showed that image classifiers can be fooled by perturbations too small for a human to notice, and [Goodfellow et al. (2014)](https://arxiv.org/abs/1412.6572) showed these examples are easy to generate. A decade of defences followed, and many were later broken, for example in [Athalye et al. (2018)](https://arxiv.org/abs/1802.00420). Models that look strong on average keep having worst-case holes, and fixing one attack doesn't close the next. That is the same shape as vulnerability discovery.
- **No plateau yet.** [Jones (2021)](https://arxiv.org/abs/2104.03113) trains AlphaZero agents on Hex and finds that Elo rises smoothly with compute: about 500 Elo per order of magnitude in the steep part of the curve. If a plateau exists, it should show up as the curve levelling off at perfect play, rather than stopping because the best human has been passed.

### B. Discovery slows down

We're in a period of scaling, in pretraining and now inference compute. The argument for slowing is about cost rather than a hard limit.

- **Easy bugs go first.** Think of picking fruit: the low branches are stripped quickly, and the rest needs a ladder. Once the simple bugs are gone, each new one needs a much more elaborate chain of reasoning to find, and so costs far more compute.
- **Discoveries become rare.** Each extra unit of capability buys fewer new vulnerabilities than the last. They never quite hit zero, but they become rare enough that finding and patching can keep pace.

### C. Discovery stops

There are a couple of reasons to expect a limit.

- **Cryptography.** Some functions are theoretically perfectly secure: given the assumptions of the proof, there is no attack. If the hardware is also secure and the implementation matches the proof, the system is secure. A defender at capability N can put those protections in place and a model at N+1 still can't break them.
- **Complexity.** Some tasks can only be optimised so far. Comparison-based sorting can't beat order n log n, and nothing can beat order n because every item has to be looked at. Some security operations may have a similar bound. Once one sits at that bound, and is used as a protocol, being cleverer about the algorithm doesn't give a better attack.
- **Trusted computing.** The ARIA programme on trusted computing could be a route here. The aim is to build systems whose security can be verified, which would let us leave this period of constant vulnerability discovery and reach a safe state.

## Restricted access for defenders

In the meantime, the most capable models are restricted. OpenAI and Anthropic both check who is asking, then give verified defenders a more permissive model to find bugs and protect infrastructure.

- OpenAI's [Trusted Access for Cyber](https://openai.com/index/scaling-trusted-access-for-cyber-defense/) gives verified individuals and approved teams models with a lower refusal boundary for authorised defensive work. The higher tier, [Daybreak](https://help.openai.com/en/articles/20001258-trusted-access-for-cyber-overview), includes GPT-5.6 Cyber, the model Trail of Bits used.
- Anthropic's [Project Glasswing](https://www.anthropic.com/glasswing) keeps Claude Mythos Preview gated. Launch partners and organisations that maintain critical software can use it to find and patch vulnerabilities before a model of that class is public. Its [Cyber Verification Program](https://support.claude.com/en/articles/14604842-real-time-cyber-safeguards-on-claude-opus-and-sonnet) lets verified users do dual-use work on Opus and Sonnet that default safeguards would block.

The idea in both is the same: keep the model restricted, and let well-verified people use it to harden the systems those bugs are in. That buys time, but it doesn't tell us which scenario we're heading towards.

## Which scenario do I think is most likely?

I think it depends on the kind of system, and on choices we make. While there are some analogies and historical trends, none of them really give us strong evidence. 

- **C is plausible where the whole attack surface can be secured.** I think there probably is an exit state of verifiable, secured computing. This is because there do exist cryptographic properties and limits in computing. It only holds if the entire attack surface is covered, so it needs a heavy focus on security and isolation from the start.
- **Most other software is nearer A, for now.** There's still a lot of low- and medium-hanging fruit in the current state of code. The trade-off between usefulness and security has generally leaned towards usefulness, and bugs often go unpatched.
- **AI agents may push further towards usefulness.** Agents can both write code and find exploits. I expect we'll write much more software, which means a bigger surface to attack.

So whether vulnerabilities grow faster than capabilities is context-specific. It depends on where we invest in verifiable, isolated systems and where we accept risk for speed and usefulness.

## Summary

- If discovery tapers off or stops, patching works. If it keeps scaling, we need isolation that doesn't depend on bug-free software.
- There's good evidence for A (fuzzing, Go, adversarial ML), a reasonable cost argument for B, and a theoretical case for C in narrow, verifiable systems.
- My guess is that most software stays in A for a while, and that C needs deliberate investment in secure design from the start.
