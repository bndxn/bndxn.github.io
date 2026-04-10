---
layout: post
title: Run tracker part 4 - Why I turned it off
date: 2026-04-09 01:59:00
description: 
tags: engineering, mlops, llmops, cicd, fitness 
categories: 
thumbnail: assets/img/running-app-v2.png
images:
  lightbox2: true
  photoswipe: true
  spotlight: true
  venobox: true
---

With a heavy heart, I've made the decision to discontinue my running coach app! I think it was a fun project to work on and I learnt a lot from it. Here are the reasons why, what I learned from it, and what's next.

<div class="row justify-content-center mt-3">
    <div class="col-sm-auto">
        {% include figure.liquid loading="eager" path="assets/img/running-app-v2.png" class="img-fluid rounded z-depth-1 mx-auto d-block" %}
    </div>
</div>
<div class="caption text-center">
    How things look now!
</div>

## Why I'm turning it off

The trigger was that I started to get Garmin authentication errors, and the app used a library called [python-garminconnect](https://github.com/cyberjunky/python-garminconnect) which at the time used another library called Garth to authenticate with Garmin. Garmin changed their authentication workflow, and this prompted the maintainer of Garth to [deprecate](https://github.com/matin/garth/discussions/222) the project. This made me think there'd likely some work required to keep the service running as is. It later turned out that `python-garminconnect` updated in a way that meant I could still use it, but this issue started me thinking.

This led me to wonder what value I was getting from the LLM running coach. Was an LLM + Garmin data actually helping me achieve my goals? My goal was quite clear - to run a half marathon and improve my time.

In brief, I think that improving your running times means having a sensible goal, and then you track your progress against that plan. You can track it quite easily using a spreadsheet, which is what I did in addition to using the running app. What everyone says is that the way to get better is just completing your planned training sessions, and your paces gradually improve across the board. I used the LLM to analyse recent sessions, but this ended up not working well when I moved sessions around, because the LLM would think I'd missed them. Part of what was motivating about my tracking spreadsheet was seeing all the past sessions I'd completed and how far I'd come - and this was not something the LLM provided. If anything the LLM output was demotivating because it didn't show my my progress, just a relentless set of new sessions and paces!

I also used the LLM to suggest paces for upcoming runs. This seemed like a good idea, but the pacing suggestions ultimately were not helpful: for slower runs, it's probably better to use heart rate, and then fast ones, it's probably better to run on feel for e.g. 8x400 than it is to think, "I have to/ should run it at X pace". I also spent a lot of time doing additional analysis and pace calculations, not trusting the LLM's analysis and forecasts.

I also looked into the app Runna and Garmin's training plans and decided that I didn't want to use those either, for similar reasons.

## What I learned

So I sunk a load of time into this, and now I'm turning it off. But I think it was a great learning experience. 

My main takeaway is that when it comes to changing behaviour, you probably need a fixed long-term plan, and to track progress against that in quite a boring way. Adding an LLM layer did not improve any part of it - it just made it harder to track progress, and it interfered with my sense of what comfortable paces are.

This was also a very valuable experience for a few reasons: 
* I created and deployed an E2E AWS web app, and this helped me learn about AWS services and doing an architecture review
* It reinforced my belief in the value of really fast tests and feedback loops - I made so much faster progress testing a lambda locally in <1s than if you're waiting 10 mins each time for each Codebuild run to finish
* It made me think about the user value of LLMs in addition to just prototypes
* Showing my work is important and motivating
* Working by myself can be good in terms of any scope, but I didn't learn as much as on projects where I collaborated with others

## What's next

I've been working on implementing an agentic evaluation in the Inspect framework, and looking ahead I'm planning to focus more on collaborating with others, and on agentic models. It's been interesting to see how much additional context improved the running coach, and LLMs improved a lot during this project so let's see how they develop looking further ahead!