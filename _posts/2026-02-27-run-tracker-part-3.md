---
layout: post
title: Run tracker part 3 - Major upgrade
date: 2026-02-27 01:59:00
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

A leap forward for Ben’s running tracker at [running.bendixon.net](running.bendixon.net) (between 8am and 6pm UK times)!

<div class="row justify-content-center mt-3">
    <div class="col-sm-auto">
        {% include figure.liquid loading="eager" path="assets/img/running-app-v2.png" class="img-fluid rounded z-depth-1 mx-auto d-block" %}
    </div>
</div>
<div class="caption text-center">
    How things look now!
</div>

In previous articles I’ve written about my running app. Since then I’ve checked it occasionally and been working on some updates. I’ve now made significant enough updates that I’ve deactivated V1 and am moving to V2. Just for comparison here's what it used to look like. 

<div class="row justify-content-center mt-3">
    <div class="col-sm-auto">
        {% include figure.liquid loading="eager" path="assets/img/running-app-old.png" class="img-fluid rounded z-depth-1 mx-auto d-block" %}
    </div>
</div>
<div class="caption text-center">
    Throwback to last week
</div>


Here are the main changes, in rough order of importance.

## User experience

* Runs are based on a fixed training plan, and makes reference to that. While LLMs can suggest things that seem plausible, I think that following a structured training plan is a better approach for a lot of runners. I tried getting an LLM to generate a training plan, but I thought they seemed a bit complicated and weird, and so eventually I just chose to use good old fashioned Hal Higdon’s intermediate half marathon training plan. 
 
* The prompt is updated to work with current paces, and not to set expectations on intended paces. As a somewhat competitive runner, I often prompted things like “If I want to run a sub-20 5K, then how fast should my intervals be now?”. I think ultimately this is not that helpful, because if you set yourself a stretching goal pace, then all your workouts get ratcheted up to those paces, then you get tired and demotivated when you can’t run them (at least I did). I think a better approach is “based on my recent runs, what range should I try to do xyz training run in?”. Then gradually over time, you keep training, and your fitness lifts across all paces, and eventually (?) you get that 5K time you’ve been wanting. 

## Development and software engineering

* The whole app is now deployed using Terraform. Terraform is an infrastructure-as-code product. Using infrastructure as code means that your code is more reusable, as you’re not playing around with the UI. I think it also means you’re less likely to develop a bloated mess of AWS resources, because you can delete everything used in one command, also reducing the chance you accidentally leave some data in an S3 bucket

* Deployment is done in a managed account within an AWS Organisation. This was primarily motivated by security reasons, to provide defense-in-depth to resources. Previously everything was done in one management account. 

* Run suggestions are powered by Claude Opus (plus the plan mentioned above) rather than requiring external calls to an OpenAI model. This was partially to improve security - as I wasn't storing an OpenAI API key in AWS Secrets Manager, but also because recently it seems like the Claude models have really advanced a lot. It also means there's fewer bills to have to pay attention to - now just one from AWS. For each analysis and suggestion, Sonnet's probably costing something like $0.01.

* The run tracker now works business hours only! I thought this was quite a fun idea and based on hearing about people turning off their home routers at night to improve network security. The cost is based on activity which is a bit uneven, but I chose 8am to 6pm, so running 10 of 24 hours means saving 58% roughly on web server running cost.

* CI using Github actions - linting, a basic test, and identifying security vulnerabilities. These could run in pre-commit but the benefit of putting them in CI is that they’re not going to be skipped, and will always run in a standard way. I previously put them in Codebuild which was nice, but was quite a hassle to have to go back and forth between Github and AWS to get the outcomes of the runs. 

* This was also my first experience of coding with Cursor. Previously I’d used models from OpenAI, and chatted with the browser, and pasted code back and forth as part of developing the first running tracker. In the past few months it seems like coding models have improved, but even with Opus 4.6 in Cursor I find that the models have particular idiosyncrasies that aren’t exactly what I want. More on this in a future blog post!

## What's next

A few open questions I think about: 

* What should the retriggering logic for a new logged run suggestion be? Here’s what I’ve been thinking: 
    * New suggestions every 6 hours (what I initially did). This would update regularly, whether a run has been logged or not. But then I found that LLM randomness means I’d get different run suggestions, each time it the lambda ran! Not ideal. 
    * Check regularly (e.g each hour, with a Lambda) and only make a new suggestion if a new run has been logged. This seemed like a good idea, but actually if I don’t log a run for several days, the suggestion quickly gets out of date. 
    * Some combination - check every 6 hours for a logged run, and update either if one has been logged, or if there hasn’t been any update for 24 hours - to do next!

* What are the next security improvements to make? With advances in automated cyber attacks, I think this area is going to become more important. One method could be to add logging to Cloudwatch for each time a new run is detected/ each time the training recommendation is updated, and also logs/warning for any anomalies. 

And some things that would be fun to implement: 

* Continuous deployment on merge to main or some other trigger, e.g. manual approval in Codebuild
* Agentic tool-calling, for example checking weather forecasts as part of telling me when to go for runs. 
* Logging to Cloudwatch
