---
layout: post
title: Run tracker part 2 - AWS Lambda
date: 2025-05-22 10:59:00
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

Around the time of the last update, I deployed the website and happily saw that it was able to fetch runs from GarminDB and then also call OpenAI to generate coach suggestions. I left the website up and running and I was very pleased to show it to my friends. But then, a couple of days later, I went back to the website, I realized that it had gone down! Noooo!

<div class="row justify-content-center mt-3">
    <div class="col-sm-auto">
        {% include figure.liquid loading="eager" path="assets/img/run-tracker-503-error.png" class="img-fluid rounded z-depth-1 mx-auto d-block" %}
    </div>
</div>
<div class="caption text-center">
    Noooo!
</div>

So, I started to investigate why.

The error was that my OpenAI token was invalid because the credits had been used up, and I started to investigate why. I had a look at the OpenAI developer console and I could see that the usage pattern was vastly higher than it had been, even throughout all of my many rounds of testing. See the image below. So, I was really surprised to see that it seemed like web crawlers were repeatedly refreshing my page and thereby sending hundreds of requests.

<div class="row justify-content-center mt-3">
    <div class="col-sm-auto">
        {% include figure.liquid loading="eager" path="assets/img/openai_usage_spike.png" class="img-fluid rounded z-depth-1 mx-auto d-block" %}
    </div>
</div>
<div class="caption text-center">
    Pesky crawlers using up 400K tokens a day
</div>

Fortunately, I was aware of issues that people mention online where it's easy to accidentally end up being charged a huge amount by the OpenAI API. I'd put on five dollars of credit several months ago and been very careful to turn off automatic billing. So it wasn't such a big problem, it just meant that the four and a bit remaining dollars was used up in a couple of days, and I then wanted to think about what better way there would be to put the suggestions on the website. Even before any of this, I noticed that logging into GarminDB and then making the call to OpenAI meant that the page did take up to 15-30 seconds to load, and I thought this probably wasn't fast enough anyway. 

### Options review

So I'd been thinking about a different way to make this request, and now that the page generating the call request was also not a good solution because of this crawler issue, it meant that I had to find a better solution in order to put my site back up again sustainably. And with a bit of research around, I decided that the best route would probably be to do the processing somewhere else, because the logging in and the coach suggestions are two functions which, even together, are still pretty straightforward. 

So I looked at different options, summarised below.



| **AWS Service**   | **Model Type**         | **Max Time**    | **Stateful** | **Format**                  | **Use Case**                            |
|-------------------|------------------------|-----------------|--------------|-----------------------------|------------------------------------------|
| Lambda            | Serverless functions   | 15 min          | ❌           | Zip or container            | Lightweight, event-driven tasks   |
| EC2               | Virtual machines       | Unlimited       | ✅           | Any                         | Long-running custom services   |
| Fargate           | Serverless containers  | Unlimited       | ❌           | Container                   | Microservices, APIs   |
| SageMaker Endpoint| Managed ML hosting     | Unlimited       | ❌           | Model + script or container | Scalable ML inference |
| Batch             | Batch compute jobs     | Unlimited       | ✅/❌         | Script or container        | Offline training or batch inference |
| Bedrock           | Foundation model APIs  | N/A             | ❌           | None (fully managed)        | Pretrained model inference |
| App Runner        | Serverless containers  | Unlimited        | ✅           | Container                   | Containerized inference or APIs |

From these options, it seemed to me like a Lambda was the best option, because it should only take a few minutes, didn't need to be stateful, I wanted it to be serverless to avoid having compute waiting around, and I wanted to deploy using a Docker container.

## Creating a Lambda

So I started packaging this up into a lambda. You might be wondering what a lambda is, and a lambda is a small serverless function, and is often used to set up interactions between different components. 

I think in data science, so far, I haven't actually used one because we've typically used SageMaker endpoints, or EC2 instances, or even batch, so the lambda hadn't come up so far. But in this particular use case, where all that was happening was logging in, fetching data, and then making a simple OpenAI call, I figured that this probably didn't need a whole EC2 and batch instance spun up, and instead I could just manage this using AWS lambda.

So I decided to separate the fetching and suggest aspects of the repo from the web serving aspects, and this meant unpicking some of my code that was a bit bundled together. I took the stuff that did fetching and suggesting out, and made a separate directory: 

```
src/
├── fetch_and_suggest/
│   ├── __init__.py
│   ├── coach.py
│   ├── garmindb_cli.py
│   ├── get_activities.py
│   ├── main.py
│   ├── setup_config.py
├── static/
├── templates/
├── web_app.py
tests/
```

I also wanted the Lambda to output to an S3 bucket, so this would be easy to pick up later. I wrote a `lambda_handler` function to do this.

```python
def lambda_handler(event, context):
    """AWS Lambda handler for generating and storing run suggestions.

    This function is intended as an entrypoint for an AWS Lambda function.
    It generates a suggestion based on recent Garmin activity, stores the
    result in S3, and returns a JSON response containing the S3 key and
    the suggestion.

    Args:
    ----
        event: The Lambda event payload.
        context: The Lambda context runtime information.

    Returns:
    -------
        dict: A dictionary with HTTP status code and JSON body containing
        the result key and data.

    """
    recent_runs, suggestion = generate_suggestion()

    output = {
        "timestamp": datetime.now().isoformat(),
        "recent_runs": recent_runs,
        "suggestion": suggestion,
    }

    key = save_to_s3(output, S3_BUCKET, S3_PREFIX)

    return {
        "statusCode": 200,
        "body": json.dumps(
            {"s3_key": key, "recent_runs": recent_runs, "suggestion": suggestion}
        ),
    }
```

This used the `generate_suggestions` function: 

```python
def generate_suggestion():
    """Generate a running suggestion based on recent Garmin activity.

    This function loads external credentials and configuration,
    optionally returns a dummy response for testing, or invokes the
    GarminDB CLI to fetch recent runs, then queries a coach model
    for a suggested next workout.

    Returns
    -------
        tuple[list[str], str]: A tuple containing a list of recent runs and
        a suggestion string.

    """
    ensure_external_credentials_set()
    dump_config()
    if DUMMY_RESPONSE:
        return (["A recent run", "Another run"], "Run 10K at 5mins per km")
    else:
        run_garmindb_cli()
        recent_runs = get_running_in_period()
        suggestion = query_coach(recent_runs)
        return recent_runs, suggestion
```

## Containerising the lambda

I then needed to find a way to deploy my code and its dependencies, to a Lambda. I used GPT `4o` to make suggestions about how best to do this, it actually gave quite a poor solution. It guided me down a path of exporting and zipping my dependencies, then uploading them to the console. The LLM gave me a shell script and was helpful for debugging the wobbly steps to do this, but I think it was actually a bad solution. When I came to the console to upload files for the dependencies, I realised that I could have just used a Docker container in ECR all along! That would have been much easier. 

I checked that the container worked locally by running it and sending requests from a different process and it worked! Then I built, tagged and pushed the container (converting from my Mac's ARM format to the Linux/AMD64):

```
docker buildx build --platform linux/amd64 --output type=docker,dest=amd64-image.tar -t fetch-and-suggest-lambda -f lambda.Dockerfile .
docker load -i amd64-image.tar
docker tag fetch-and-suggest-lambda $AWS_ACCOUNT_ID.dkr.ecr.eu-west-2.amazonaws.com/fetch-and-suggest-lambda:latest
aws ecr get-login-password --region eu-west-2 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.eu-west-2.amazonaws.com
docker push $AWS_ACCOUNT_ID.dkr.ecr.eu-west-2.amazonaws.com/fetch-and-suggest-lambda:latest
rm amd64-image.tar
```

Then I created the lambda using that ECR image. Once it was created, I wanted to test that the lambda worked. An initial error was caused by the IAM Role in the Lambda for TaskExecution not having permissions to read from an S3 bucket, but that was pretty easy to fix. 

<div class="row justify-content-center mt-3">
    <div class="col-sm-auto">
        {% include figure.liquid loading="eager" path="assets/img/test-lambda-in-console.png" class="img-fluid rounded z-depth-1 mx-auto d-block" %}
    </div>
</div>
<div class="caption text-center">
    Checking the lambda works in AWS when I poke it
</div>

## Adding regular invocations

I then created a shell script to deploy this with an EventBridge trigger to invoke the lambda every six hours. 

```
aws lambda create-function \
  --function-name fetch-and-suggest \
  --package-type Image \
  --code ImageUri=$AWS_ACCOUNT_ID.dkr.ecr.eu-west-2.amazonaws.com/fetch-and-suggest-lambda:latest \
  --role arn:aws:iam::$AWS_ACCOUNT_ID:role/run-tracker-fetch-and-suggest-lambda \
  --region eu-west-2

# Add in env variables

aws lambda update-function-configuration \
  --function-name fetch-and-suggest \
  --timeout 600 \
  --memory-size 512 \
  --region eu-west-2

# Create lambda trigger, requires rule, then event target (?), then add permission for the trigger to invoke the lambda

aws events put-rule \
  --name every-6-hours-lambda-trigger \
  --schedule-expression "cron(0 0/6 * * ? *)" \
  --region eu-west-2

aws events put-targets \
  --rule every-6-hours-lambda-trigger \
  --targets "Id"="1","Arn"="arn:aws:lambda:eu-west-2:$AWS_ACCOUNT_ID:function:create-function"

aws lambda add-permission \
  --function-name fetch-and-suggest \
  --statement-id every-6-hours-eventbridge-trigger \
  --action 'lambda:InvokeFunction' \
  --principal events.amazonaws.com \
  --source-arn arn:aws:events:eu-west-2:$AWS_ACCOUNT_ID:rule/every-6-hours-lambda-trigger
```

I had a quick look on CloudWatch to check that everything was running ok, and saw the Lambda running successfully each hour.

## Updating the web App

Finally I needed to change the web app to remove the fetching stuff, and instead just get the latest file from the S3 bucket:

```python
def get_most_recent_runs_and_suggestions_from_s3() -> tuple[list[str], str]:
    """Retrieve the most recent run data and suggestion from S3.

    Lists all objects under the 'lambda-outputs/' prefix in the S3 bucket,
    identifies the latest file by `LastModified`, downloads and parses its
    JSON content, and extracts the recent runs and suggestion.

    Returns
    -------
        tuple[list[str], str]: A tuple containing a list of recent runs and
        a suggested next run description.

    Raises
    ------
        Exception: If S3 listing fails, no files are found, or the file content
        cannot be parsed as JSON.

    """
    try:
        response = s3.list_objects_v2(Bucket=BUCKET_NAME, Prefix="lambda-outputs/")
        objects = response.get("Contents", [])
        if not objects:
            raise Exception("No files found in S3 bucket.")
    except ClientError as e:
        raise Exception(f"Failed to list objects in S3 bucket: {e}")

    latest_file = max(objects, key=lambda obj: obj["LastModified"])
    key = latest_file["Key"]

    try:
        response = s3.get_object(Bucket=BUCKET_NAME, Key=key)
        raw_content = response["Body"].read().decode("utf-8")
        first_layer = json.loads(raw_content)
    except Exception as e:
        raise Exception(f"Failed to parse content from {key}: {e}")

    recent_runs = first_layer.get("recent_runs", [])
    suggested_next_run = first_layer.get("suggestion", "No suggestion found.")
    return recent_runs, suggested_next_run
```

Then I needed to redeploy the web app, but luckily from my setup, I had a CI/CD which automatically rebuilt my images and pushed them! I just needed a one-line fix to change the dockerfile used in the buildspec.yml, from the default `Dockerfile` to `web_app.Dockerfile`. This was because I'd renamed the web app dockerfile to `web_app.Dockerfile` and the lambda one to `lambda.Dockerfile`.  


<div class="row justify-content-center mt-3">
    <div class="col-sm-auto">
        {% include figure.liquid loading="eager" path="assets/img/run-tracker-using-lambda.png" class="img-fluid rounded z-depth-1 mx-auto d-block" %}
    </div>
</div>
<div class="caption text-center">
    Forrest is back!
</div>

Bam, we're back up and running!