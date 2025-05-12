---
layout: post
title: Run tracker part 2 - AWS Lambda
date: 2025-04-23 13:59:00
description: 
tags: engineering, mlops, llmops, cicd, fitness 
categories: 
thumbnail: assets/img/openai_usage_spike.png
images:
  lightbox2: true
  photoswipe: true
  spotlight: true
  venobox: true
---

As I mentioned in a previous post, I've been working on a project to develop a web app to track my runs and suggest my next running workout! 

Around the time of the last update, I deployed the website and happily saw that it was able to fetch runs from GarminDB and then also call OpenAI to generate coach suggestions, full stop. I left the website up and running and I was very pleased to show it to my friends. But then, a couple of days later, I went back to the website, I realized that it had gone down! So, I started to investigate why.

The error was that my OpenAI token was invalid because the credits had been used up, and I started to investigate why. I had a look at the OpenAI developer console and I could see that the usage pattern was vastly higher than it had been, even throughout all of my many rounds of testing. See the image below. So, I was really surprised to see that lots of the time there are just crawlers that go around on the internet and must be endlessly refreshing my page and thereby sending hundreds of requests.

<div class="row justify-content-center mt-3">
    <div class="col-sm-auto">
        {% include figure.liquid loading="eager" path="assets/img/openai_usage_spike.png" class="img-fluid rounded z-depth-1 mx-auto d-block" %}
    </div>
</div>
<div class="caption text-center">
    Pesky crawlers using up 400K tokens a day
</div>

Fortunately, I was aware of issues that people mention online where it's easy to accidentally end up being charged a huge amount by the OpenAI API. I'd put on five dollars of credit several months ago and been very careful to turn off automatic billing. So it wasn't such a big problem, it just meant that the four and a bit remaining dollars was used up in a couple of days, and I then wanted to think about what better way there would be to put the suggestions on the website. Even before any of this, I noticed that logging into GarminDB and then making the call to OpenAI meant that the page did take up to 15-30 seconds to load full stop, and I thought this probably wasn't fast enough anyway. 

### Options review

So I'd been thinking about a different way to make this request, and now that the page generating the call request was also not a good solution because of this crawler issue, it meant that I had to find a better solution in order to put my site back up again sustainably. And with a bit of research around, I decided that the best route would probably be to do the processing somewhere else, because the logging in and the coach suggestions are two functions which, even together, are still pretty straightforward. 



| **Service**            | **Model Type**         | **Max Time**             | **State** | **Format**                      | **Use Case**                            |
|------------------------|------------------------|--------------------------|-----------|----------------------------------|------------------------------------------|
| **AWS Lambda**       | Serverless functions   | 15 min                | ❌        | Zip or container            | Lightweight, event-driven tasks   |
| **EC2**              | Virtual machines       | Unlimited             | ✅        | Any                         | Long-running custom services   |
| **Fargate**          | Serverless containers  | Unlimited             | ❌        | Container                   | Microservices, APIs   |
|**SageMaker Endpoint**| Managed ML hosting     | Unlimited (while live)| ❌        | Model + script or container | Scalable ML inference |
| **AWS Batch**        | Batch compute jobs     | Unlimited (per job)   | ❌        | Script or container         | Offline training or batch inference |
| **Amazon Bedrock**   | Foundation model APIs  | N/A                   | ❌         | None (fully managed)        | Pretrained model inference |
| **App Runner**       | Serverless containers  | Unlimited             | ❌         | Container                   | Containerized inference or APIs |


## Creating a Lambda

So I started packaging this up into a lambda. You might be wondering what a lambda is, and a lambda is a small function which can run asynchronously and serverlessly, and is often used to set up interactions between different components. I think in data science, so far, I haven't actually used one because we've typically used SageMaker endpoints, or EC2 instances, or even batch, so the lambda hadn't come up so far. But in this particular use case, where all that was happening was logging in, fetching data, and then making a simple OpenAI call, I figured that this probably didn't need a whole EC2 and batch instance spun up, and instead I could just manage this using AWS lambda.

So I decided to separate the fetching and suggest aspects of the repo from the web serving aspects, and this meant unpicking some of my code that was a bit bundled together full stop. I then used ChatGPT to make suggestions about how best to deploy this in a lambda, and this was actually a pretty bad situation for ChatGPT. It spent a while telling me how to, well, I'd exported, I put in a basic version of the Python code into a test lambda, and I found that there were loads of dependencies like GarminDB and OpenAI which I needed to install, and GPT-4's suggestion was to zip them, zip the requirements, and it made me a little shell script to do this. It was a fiddly process, and just later on when I was coming to upload this zipped file of the dependencies, I realized that there was an option instead to have a Docker container run this for inference, and that would be way easier, because I could just build the container locally, push to ECR, and then reference it in the lambda, and I wondered why on earth GPT-4.0 was sending me down this crazy path of zipping the dependencies and then uploading them to the console. It was just a bit of a mess. So, standing back, once I realized that the ECR was an option, I then focused on putting this into a lambda.

## Containerising the lambda

## Publishing to ECR

## Updating the web App

Needs to pick up files from S3, also need to redeploy since I previously switched it off.
