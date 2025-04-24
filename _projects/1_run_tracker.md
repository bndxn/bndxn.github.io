---
layout: page
title: Run tracker
description: Suggesting my next run using Garmin and an LLM.
img: assets/img/run_tracker.jpg
importance: 1
---

I've been interested in running for a few years, and I've used a Garmin watch to track my runs for at least the last year.

A project to track my runs and give me suggestions. See more here: [running.bendixon.net](https://running.bendixon.net/). 

This was a project to practice a few things:
* CI/CD 
* LLM calling and prompt engineering
* Full stack deployment

## Getting started

Having played around with LLMs, I thought there'd be two things to figure out as soon as possible. The first was the source for the data. I'd previously used the Strava developer API, but I found that I had to keep authenticating applications, and generally the developer feedback on Strava is quite negative. So I looked for an alternative and 

The second was a really rapid development process. From previous experience, I know there are lots of small bugs I'd find and tweaks that I'd want to make. I really didn't want each change to take 20 minutes to run.

So rather than adding lots of features, my first priority was to set up CI/CD!

My goal was to test this locally using a Docker container, using a docker compose command so I could do it in one line, and also to develop an automated CI/CD process that would pick up changes and deploy them in the background. 

## CI/CD

So I set up this CI/CD process, which would run tests and then deploy to an ECS. 

<div class="row justify-content-center mt-3">
    <div class="col-sm-auto">
        {% include figure.liquid loading="eager" path="assets/img/run-tracker-codebuild.png" class="img-fluid rounded z-depth-1 mx-auto d-block" %}
    </div>
</div>
<div class="caption text-center">
    AWS CodePipeline CI/CD process 
</div>

I also set up AWS Codebuild checks on new and modified pull requests in Github.

## MVP

I grabbed some of the GarminDB example files to fetch the activities from the past week, and combined them with a call to OpenAI, and then put the response on a Flask front end. Seemed good so far! 

<div class="row justify-content-center mt-3">
    <div class="col-sm-auto">
        {% include figure.liquid loading="eager" path="assets/img/run-tracker-mvp-full.png" class="img-fluid rounded z-depth-1 mx-auto d-block" %}
    </div>
</div>
<div class="caption text-center">
    AWS CodePipeline CI/CD process 
</div>

Just to spell out what's happening at this point: 

1. Load Garmin config
2. Connect to Garmin Connect using GarminDB and download activities
3. Construct a prompt containing the last week's activities, and send to gpt-4 (or some other model).
4. Get the response and display it in a front end using Flask

And this is all running as one Docker container on ECS.

## Separating inferences

However I found after a couple of days that my $5 OpenAI credits had been spent down, as it seems there were lots of requests on the website - I guess various crawlers. Even before this, I'd noticed that obtaining the GarminDB data took about 30 seconds, then a few more seconds to get the response from the LLM, and I thought this probably wasn't fast enough for a user interface. 

At the time I thought of creating a Lambda to download from the database and save to an S3 bucket. But since I was probably going to still have the crawler/frequent requests problem. So I decided that I would create a separate component to both grab the Garmin data, and send the request to an LLM. In this case it doesn't need to generate a new suggested run every time I visit the homepage, just once or maybe twice a day.

So with a bit of consulting gpt-4, I decided to make this as a separate Lambda. And that's what I'm working on next.

## Future ideas

* Prompt improvements: structured outputs, few-shot examples, including a training plan as RAG
* Function calling: checking the weather and my calendar to tell me when to go for a run! 

