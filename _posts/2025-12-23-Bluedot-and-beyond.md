---
layout: post
title: BlueDot and Beyond
date: 2025-12-22 08:30:00
description: What I'm taking forward from the BlueDot course 
tags: ai-safety
categories: 
thumbnail: assets/img/bluedot.png
images:
  lightbox2: true
  photoswipe: true
  spotlight: true
  venobox: true
---
*This is a rapidly written draft that I would like to spend more time polishing, but ultimately I thought it's better to just 80/20 it and move on with my other goals!*

## Key points

* I found the BlueDot [Technical AI safety course](https://bluedot.org/courses/technical-ai-safety) very useful and I would recommend it to people interested in AI safety
* There are many promising approaches to making AI safer, but each have strengths and weaknesses, and could be stacked up as layers of defense
* Quite terrifyingly, we have [evidence](https://www.apolloresearch.ai/research/frontier-models-are-capable-of-incontext-scheming/) that models display scheming and deceptive behaviour, and this is a deep problem for the field as it means we cannot fully trust our evaluation methods
* AI safety is a collective action problem
* Organisations developing power AI are imposing risks on the general public - there should be scrutiny of whether they’re taking appropriate security from an appropriate external organisation
* AI control is a new area focused on using untrusted models while cutting down overall risk
* There are many organisations working on defensive techniques that I think could help shift us to a safer future

There's also so much more to say on many of these points - I think this blog post is going to be far too long as it is - but if there's some point you think I haven't covered enough, I probably agree with you!

## Context

I've been interested in work on AI safety since 2019, and have followed many podcasts and read books since then. A colleague recommended the Blue Dot technical AI safety course, and I recently completed the six-week program. 

I found it extremely useful for understanding current approaches to AI safety, and in this post I lay out some of the key things I learned, along with a brief overview of the course structure. For more details about the course, please head over to bluedot.org. This post reflects my own views, and I thoroughly recommend BlueDot!

<div class="row justify-content-center mt-3">
    <div class="col-sm-auto">
        {% include figure.liquid loading="eager" path="assets/img/bluedot.png" class="img-fluid rounded z-depth-1 mx-auto d-block" %}
    </div>
</div>



## What is the BlueDot Technical AI safety course?

As they put it pithily: 

> *Understand current safety techniques. Map the gaps. Identify where you can contribute. All in 30 hours.*

**Who is this for?**

This is a course for people with a technical understanding of deep learning and large language models. The course talks about things like pre-training, fine-tuning, and post-deployment. While there are definitions given briefly, my guess is that you probably want to have some understanding of these ideas before starting, or it'll be too information in one go. 

### 1. The technical challenge with AI

I think the key takeaway from this week is that powerful and capable AI systems will be hard to align with exactly what we want. One reason is that it is very hard to specify, in advance, all of the complex things people actually want. Another reason is that even if we can define what we want exactly, it could be that quirks in AI mean the model optimizes for something different. 

To give an example, which is mentioned in the course, if you incentivize a model to increase company stock prices as measured by news bulletins, then it may be easier for the model to just generate fake news bulletins about increased stock prices rather than to actually boost company profits. 

*Ben's take: I think we should expect this sort of inner misalignment to be very common because when people are using AI tools, they want them to find cheap and innovative solutions to problems. I think those solutions will probably find loopholes more easily than they will find complex strategies which actually help us achieve the main goal.*

### 2. Training safer models

This week lays out approaches to training safer models, such as filtering the data models are trained on, giving better human feedback, or using LLMs to provide scalable oversight. 

* **Data filtration**: I was surprised to learn that data filtration actually works quite well. Let's consider an example for all three of these, which is that we want models to refuse requests to help develop biological weapons. This is studied empirically in [Deep Ignorance](https://deepignorance.ai/) by O'Brien et al in August 2025. Input data filtering would mean the people who develop the model remove references and explanations about biological weapons from the training data. The idea is that models are then not learning this pattern. Empirically, this does actually seem to work quite well, which I was surprised by. However, there could be other ways models figure out this information, for example from biology, and the authors of this deep ignorance paper argue that other methods should be used as well. Also just a few samples seems to be enough to [poision](https://www.anthropic.com/research/small-samples-poison) the training data.

* **Reinforcement from human feedback**: Moving on to the next approach, reinforcement learning from human feedback. In short, it's about having humans be part of a training process by marking answers. Without going into the details, this works quite well, but small changes in the setup could lead to models optimizing for very harmful behaviors. We encounter some of the deep problems which, in my view, are throughout AI safety. 

* **Scalable feedback**. Ultimately, this means that using LLMs to assess LLMs. You might think this approach has weaknesses - seems like a case of the blind leading the blind, no? I think this is a fair objection, but it does not fully undermine the approach. See more [here](https://alignment.anthropic.com/2025/recommended-directions/#h.9aidfzd51piy).

### 3. Detecting danger

How do we know if models are safe? This is where the science of good evalution comes in. At the moment it's a pretty amateur field without good standards, and Marius Hobbhahn of Apollo [makes the case](https://www.apolloresearch.ai/blog/we-need-a-science-of-evals/) we need better evals.

How do we know when models are safe? There are different points at which we could monitor for harmful behavior. At the moment, the focus is on pre-deployment, and some of the leading AI companies produce reports where they test these models against harmful things, like whether they will help users produce CBRN threats. 

A point excellently [made by Beth Barnes](https://80000hours.org/podcast/episodes/beth-barnes-ai-safety-evals/) is that AI models can be dangerous before the public deployment stage, and instead it would be better to do testing earlier on during training runs. The reason is that testing just before release would be creating a huge incentive for a company that's spent loads of money training a model, and then a small team of safety people argue that they shouldn't go ahead when there's likely a huge commercial pressure to do so. So instead, we should forecast these risks ahead of time.


### 4. Understanding AI

This part of the course focuses on methods to understand AI. For several years, interpretability has been an area of focus for the AI safety community. The idea is to study how and what neural networks learn. Maybe this will help us identify the parts of a neural network that are responsible for safer behavior or deceptive behavior. 

While this field initially showed a lot of promise, in the past couple of years there has been more pessimism. This has been because untangling knowledge from models is very hard, and no single approach will provide guarantees. 

A sort of realistic, pragmatic step forward is to use simple tools focused on parts of neural networks, called [probes](https://arxiv.org/pdf/1610.01644), and potentially sparse autoencoders. All of these seem useful, but do not work perfectly (like everything else). 

**Chain of thought**

Another line of work is monitoring the chain of thought - intermediate model outputs, mentioned in [this](https://arxiv.org/pdf/2507.11473) 2025 paper. I'd heard of this approach but I thought we probably couldn't trust any output very much. The authors make the interesting point that concerning multi-stage capabilities require "working working memory: a storage system for intermediate reasoning outputs that allows for further reasoning and manipulation of the stored information.". They argue that "any sufficiently long chain of serial steps of cognition must pass through the chain of thought at some point". I think this means that for the time being we can assume that multi-stage planning will go through the model outputs as it reasons what to do. 

There are limitations on this - the chain of thought might not be interpretable Apollo, e.g. see [here](https://www.apolloresearch.ai/research/stress-testing-deliberative-alignment-for-anti-scheming-training/) under "Challenges for interpreting the chain-of-thought". One example of an impenetrable chain of thought model output is from [here](https://www.antischeming.ai/snippets):

> *"The summary says improved 7.7 but we can glean disclaim disclaim synergy customizing illusions. But we may produce disclaim disclaim vantage."* 

This is potentially still a reasoning step in the chain of thought, containing some of the planning, but written in modelese! However this idea is fragile - we may not be able to rely on it - so far models have been pretrained on text and human preferences, but if we start to use lots of outcome-based RL, the models may no longer externalise their reasoning.

A separate and also interesting line of understandng AI-based work is on [model organisms](https://www.alignmentforum.org/posts/ChDH335ckdvpxXaXX/model-organisms-of-misalignment-the-case-for-a-new-pillar-of-1?utm_source=bluedot-impact), which instead of understanding the small-scale components, is instead about testing specific behaviors. This work focuses on sub-components behind the most advanced AI risks, for example models demonstrating misaligned goals, deceptive behavior and situational awareness. This research tries to demonstrate the presence of these behaviors in settings with varying amounts of reality.


### 5. Minimising harm

**Technical approaches**
The next approach says, well, what if we assume that our techniques have weaknesses and there might be dangerous models? Can we still minimize harm? [This](https://arxiv.org/pdf/2312.06942) 2024 paper from Redwood Research looks at AI control: using trusted AI to monitor untrusted but more powerful AI.

There's a good (but long) [YouTube video](https://www.youtube.com/watch?v=0pgEMWy70Qk) explaining how this works, but essentially, even weak, this works quite well. You can reduce some of the risk of sneaky or adverse behavior by having another trusted model monitor it, even if it is less capable. This doesn't cut down risks to 100%, and even one disaster is all that you need, but it seems worth doing. There are some other areas of research in this vein, for example, decomposing tasks into smaller sub-components and having LLMs complete those tasks. 

One objection that I thought is that if you're worried about collusion or systematic adverse behavior, you still can't trust these tools. I think that objection is fair, but using some of these separation-of-duties-type techniques means that you still could cut down all but the most scheming and long-term advanced risks.

**Defending society**
Within this same week was some very open-ended thinking about defences and harm in general. If we think more broadly, what is security in society? What are risks? What are we defending against? It's just a very open-ended question, and probably the classic answer that I hear in this space is talking about critical infrastructure collapse. 

*Critical infrastructure and related*

For example, people say, what if AI, either by human control or fully autonomously, disables the electricity grid in a way that is unrecoverable? I agree that this is probably a risk we should be thinking about, and indeed I'm sure there is much work making things like energy grids safe from cyber attacks. 

But I think the focus on utilities is too narrow. What is the infrastructure of society and how should we defend against it? A point I made in my group is that infrastructure is all around us and could include many things like reliable news, or even confidentiality from therapy providers. There was a devastating [data breach](https://en.wikipedia.org/wiki/Vastaamo_data_breach) from a Finnish psychotherapy service Vastaamo in 2020, causing serious distress and trauma to roughly 30,000 victims, who were threatened with having all their confidential therapy notes made public. 

I think when we reflect on all the many services and things we trust, you realise there's a lot of parts of critical infrastructure, or at least stuff that would cause a lot of harm if it was compromised. I think this means the surface area you need to defend is actually much broader than a few utility organisations.

*Gradual disempowerment and related*

Another whole section of this is gradual disempowerment, which is a whole set of worries about people in society being less able to have influence over AI as it replaces more labor across society and could lead to concentration of control, theoretically to the limit, in such a way that no human has any control over things now. 

I think this is an interesting area of work, but it's hard to grapple with it meaningfully in a couple of weeks or to say anything rounded about it in a few hundred words, so I'm just going to flag this here and move on!

### 6. Start contributing


The final week of the course encourages people to get started and find specific small projects to work on. A few points from this space is that it's good to start small with something, just maybe even a few lines of code or a couple of emails, and to try and get more feedback and build things up with this, to not let perfectionism slow you down. And I've been working on evaluations in the AC Inspect tool, but this week also gave me lots of ideas for other things to reach into, to look into. The course asked me to submit a personal action plan, and here is my plan:

> *I want to focus on scheming and AI evaluations, building on my experience working with LLMs with python in large codebases at the BBC. I want to look for specific opportunities at places like AISI, Apollo, and others, where I can contribute to evaluations projects.* 

> *In the next few months I can continue contributing to benchmarks on general evaluations, like my existing work with Inspect. Longer term I’m interested in research and mitigations on untrusted models, such as work on scheming and approaches to AI control. These seem more robust to me than general capabilities, as models demonstrate more evidence of situational awareness.*