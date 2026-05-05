---
layout: post
title: When to put the washing on? Using Cursor and improving security
date: 2026-04-16 12:00:00
description: When to reset context, what to keep out of the model, and how AI-assisted coding can still improve security habits.
tags: cursor, llm, security, engineering, learning
categories:
thumbnail: assets/img/carbon-scheduler-2.png
images:
  lightbox2: true
  photoswipe: true
  spotlight: true
  venobox: true
---

After switching off my run tracker, I wanted a new project to explore two things: AI-assisted development workflows with Cursor, and creating more secure deployments.

## User goals

When should I put my (clothes) washing on? This is something which actually does come up in my daily life. It'd be great to know both when the grid is at its most efficient in terms of carbon, and also when there's going to be a long dry spell to hang washing outside.

So I figured this would be the user requirement, a website which can tell somebody when is the optimal time to put the washing in the next few days, on given those two constraints: minimise carbon in the grid and maximise outdoor drying time.

A bit of research showed this is mostly a data integration problem: there are APIs for both the UK carbon intensity of the grid and the weather forecast: OpenMeteo for the weather, and the [Official Carbon Intensity API](https://carbon-intensity.github.io/api-definitions/#carbon-intensity-api-v2-0-0) for Great Britain developed by National Energy System Operator (NESO).

## Architecture

I started by giving this brief to Cursor and seeing what it suggested. It proposed a fairly monolithic structure. The initial architecture was not really what I wanted. It suggested:

- DynamoDB to store all past predictions
- ECS with load balancers
- A combined frontend + backend in a single service

I think this is a pretty poor fit for this project. It's going to be low volume, and doesn't need to be always on. There's also no requirement for a big database. So I pushed towards a serverless approach:

- Separate frontend and backend
- No persistent store for predictions (only keep the latest result)

That trade-off made the system much cheaper, from about \$50 per month to about \$5, and meant I removed a whole chunk of infrastructure and code around managing a database and replaced it with one JSON in an S3 bucket!

## Improving security

I think application security is an increasingly important concern, so I treated strong security as a set of design requirements from the start. I reviewed the latest [OWASP Top 10](https://owasp.org/Top10/2025/), and created some conceptual security requirements. These were:

1. Tighter access control - achieved through more tightly scoped IAM roles.
2. Fast vulnerability patching - enabling Dependabot and upgrading Lambdas to 3.14 (rather than 3.11 which seemed to be AWS' default)
3. Minimal data storage - no database and a single JSON
4. Clearer inventory of assets - used Terraform to create and destroy in a separate AWS account, which helped clearly identify which resources including IAM roles were necessary
5. Logging and cost alerting - these are in progress!

## CI/CD

From previous projects I've learned that it's important to have really fast testing and deployment cycles. So I created two IAM roles: one for local development, and one for CI in Github actions.

This keeps permissions cleanly separated and reduces the impact if something goes wrong.

## Current state

It's now deployed and running!

<div class="row justify-content-center mt-3">
    <div class="col-sm-auto">
        {% include figure.liquid loading="eager" path="assets/img/carbon-scheduler-2.png" class="img-fluid rounded z-depth-1 mx-auto d-block" %}
    </div>
</div>
<div class="caption text-center">
    The model recommends Friday morning!
</div>

I was also interested in letting the model decide which tools to call. Right now it mostly defaults to the grid forecast, but exposing the agent calls in the UI makes that behaviour visible, which is useful.

<div class="row justify-content-center mt-3">
    <div class="col-sm-auto">
        {% include figure.liquid loading="eager" path="assets/img/carbon-scheduler-3.png" class="img-fluid rounded z-depth-1 mx-auto d-block" %}
    </div>
</div>
<div class="caption text-center">
    Do the washing on Friday morning!
</div>

## Next steps

I've set up issues on many things I want to improve, e.g. improving the UI, plus logging and alarms around billing. My plan is to do more steering of Cursor.

Another area is evaluations - I'd like to do mocked tool response testing where I see how the LLM responds if rain is predicted every day, and at every interval the grid has loads of carbon. I'd like to verify this using behavioural testing, with another LLM as a judge.

I've also noticed that Claude tends to be a lot more verbose, and leaves a load of unnecessary code around once changes are made. I think this would make it harder to maintain, so either better prompting and/or more careful oversight I think is needed before deploying anything at scale written by the current tools.
