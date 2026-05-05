---
layout: post
title: The Agent Company - part 2
date: 2026-05-04 12:00:00
description:
tags: agents, llm, engineering
categories:
thumbnail: assets/img/TAC_logo.png
images:
  lightbox2: true
  photoswipe: true
  spotlight: true
  venobox: true
---

I'm currently working on an implementation of The Agent Company benchmark [code](https://github.com/TheAgentCompany/TheAgentCompany), [paper](https://arxiv.org/abs/2412.14161) in the [Inspect](https://ukgovernmentbeis.github.io/inspect_evals/) evaluations framework. It involves 175 agent tasks, multi-container environments, per-task scorers, and reproducible evaluation runs.

So far I’ve split the migration into manageable stages, built reusable helpers, identified validity issues in the original benchmark and suggested fixes, and created a new set of validation tasks to distinguish between infrastructure issues and agent issues.

<div class="row justify-content-center mt-3">
    <div class="col-sm-auto">
        {% include figure.liquid loading="eager" path="assets/img/TAC_logo.png" class="img-fluid rounded z-depth-1 mx-auto d-block" %}
    </div>
</div>
<div class="caption text-center">
    TheAgentCompany logo
</div>

## Eval description

This eval provides a self-contained environment with internal web sites and data, and to replicate internal web sites and data, the eval uses additional server containers. For example, a task might require the player/agent to use a web brower to access a company website, and this website is served through a separate connected container. There are 175 different tasks, each which ask the agent to do something like go to a website, download a file, perform some manipulation, and then save the output to a folder. Each file has its own `evaluator.py` to grade it, and this means there's a lot of code to migrate.

## Why did I choose this?

I chose this because it was a difficult implementation of agentic capabilities using multiple containers, so it's a useful tool to understand what office tasks agents can reliably perform, and what their failure modes are.

It also sounded quite interesting, and like a good a way to build my own software engineering skills. The initial request [here](https://github.com/UKGovernmentBEIS/inspect_evals/issues/172) was that this could be a good starting point for "semi-realistic built-out sandbox environments". So I wanted the migration to be easily reviewable, reproducible, and reliable enough for future evaluations work.

You can see my first PR [here](https://github.com/UKGovernmentBEIS/inspect_evals/pull/752), and the second (currently in-progress) [here](https://github.com/UKGovernmentBEIS/inspect_evals/pull/1570).

When I first worked on this, starting in around December last year, I coded it mostly by hand. As I've been working on it off and on over the past few months, I've learned a lot and I think improved my approach. A lot of the ideas in this were inspired by my [my first blog post about the excellent book _Getting Big Things Done_](/blog/2025/get-big-things-done/). So here's what has been helpful.

## Lean and modular development

Planning is great and people don't do it enough. When I started working on the eval I thought I'd do all 175 tasks in one mega PR. I picked off a few tasks to start with as a proof of concept, and found that I was looking at ~5K lines for only 15 of the 175 tasks.

I reflected on the mega-PR approach. I thought it'd be hard for my reviewers and it seemed risky because they might not like the approach - which would suck if I'd spent months unsure of whether it was right. So I broke it into chunks.

```text
## Plan
Looking ahead, it seems to me there’s a few more conceptual steps (all containers, plus NPC interactions), then using that pattern to fill out the 175 tasks.

So my proposed review points are as follows.

1. ownCloud example tasks - 5 tasks - to check my general approach
2. ownCloud remaining 28 tasks - splitting to make the review easier
3. ownCloud and rocketchat example - figure out how to support NPCs (add in these containers) - 5 tasks - check approach
4. ownCloud and rocketchat remaining tasks - about 50
5. gitlab tasks - 5 examples (I haven’t looked at this in detail but I think it’d be fairly straightforward)
6. all remaining tasks - 87 tasks
```

This was a much easier way of doing things, as I got a bunch of feedback on the first step, and really took the pressure off! Also as others have suggested, later stages could be parallelised across other contributors or serve as templates for coding agents.

## System design

We need to have quite a complex system to provide all the different services for agents to interact with. The below diagram from the original implementation shows these services.

<div class="row justify-content-center mt-3">
    <div class="col-sm-auto">
        {% include figure.liquid loading="eager" path="assets/img/TAC_architecture.png" class="img-fluid rounded z-depth-1 mx-auto d-block" %}
    </div>
</div>
<div class="caption text-center">
    A diagram from the original implementation
</div>

The original implementation would copy in the `evaluator.py` to each container, but as an encrypted file. Then after the agent completed, it would decrypt it (with the same key every time...) and then run it.

I thought carefully about what design I needed. I wanted to be able to pass a lot of metadata and information from the evaluator, and I also need that evaluator to be inaccessible to the agent. So I made the decision to run it all on the host, via Inspect, making use of `sandbox` from `inspect_ai`.

Each task therefore has:

- a containerised environment (via docker-compose)
- an Inspect task definition in a yaml file, telling the agent what to do
- a scorer (evaluator.py) running on the host

Tasks run in isolated environments, with agents interacting via a browser/file interface. Scorers evaluate outputs based on filesystem artifacts or service responses.

I made the diagram below to show how the different containers interact.

<div class="row justify-content-center mt-3">
    <div class="col-sm-auto">
        {% include figure.liquid loading="eager" path="assets/img/TAC_drawio.png" class="img-fluid rounded z-depth-1 mx-auto d-block" %}
    </div>
</div>
<div class="caption text-center">
    My representation of the required container interations
</div>

One issue I spotted was unclear separation between task failure vs infrastructure failure. So I made several test tasks, which should always pass, and have the function of validating that our infrastructure works. For example, `test_owncloud_file_reading`, which just checks that an agent can acccess a file on owncloud when provided with the location. All of these should pass before we start evaluating agent capability.

## Accelerating development with Cursor

I first started working on this in December 2025, and in the last few months coding agents have got a lot better. I was previously using a premium version of ChatGPT to help fix bugs, but I wasn't using an IDE. For the first PR, I wrote about half of it by hand and half of it was using outputs from ChatGPT.

For the second PR, I wanted to get more out of coding agents. This time I had around 25 tasks to migrate, each of which had their own `evaluator.py` files. For each I took the `evaluator.py` files from the original, along with their task description and pasted them into my fork of Inspect.

I then wanted Cursor to at least draft a migration of them, so I said something like this:

```text
For /path/to/task/evaluator.py, rewrite this in the Inspect framework. Remove `grader` and existing imports,and replace them with those from theagentcompany. Write the task in the Inspect framework but retain exactly the same scoring logic.
```

I tried getting one agent to make changes to many files but I found the performance was not good, and I'd see things incorrectly repeated across tasks. So instead I spawned sub-agents for each migration.

I also ran the following check

```text
For /path/to/task/evaluator.py, check the actual scoring carefully against the description of the desired scoring in /path/to/task/checkpoints.md. Identify whether there are any differences.
```

This flagged a bunch of issues, bonus points being allowed/not allowed, but the evaluator.py saying something different. When I checked most of the issues were there in the original evaluation!

Reading through I've ended up making quite a lot of changes: the most common ones being the agents changing the original (brittle) scoring logic which we actually need to retain, and agents writing their own helpers rather than using the imports. But overall I'd say they've sped up development this time around.

## Fast feedback cycles

I really value fast iteration and feedback. I think data scientists often assume pipelines need to be long and therefore feedback slow, but often we can get results faster and so improve faster. For each task, I then ran a quick initial check using Cursor:

```text
Read through the evaluation description, the `evaluator.py` file, and identify what issues there could be when using this file to grade an agent's attempt in the container.
```

This this flushed out a load of issues - stuff not being copied to the right paths, fragile grading logic, all sorts. I made changes, and then as soon as possible I wanted to run the evaluations for real.

```bash
uv run inspect eval inspect_evals/theagentcompany \
  -T task_name=hr_resume_categorization \
  --model anthropic/claude-haiku-4-5-20251001
```

This then outputs some results, possibly with things failing or not. As I learned from my running tracker app, LLMs are not good at being stateful, so I improved the logging in each evaluator, and then ran each task. When I got the outputs, which may have included various errors and logging messages, as each result came in, I then asked Cursor to summarise results for each in a tracking file, `experiment_tracking.csv`.

You can see part of it here:

```csv
task_name,has_run,scorer_works,accuracy,checkpoints,total_time,notes
admin_make_spreadsheet,yes,yes,0.000,0.000,3m26s,
admin_mass_forms_filling,yes,yes,0.000,0.000,3m04s,evaluator not reading filled PDF values
admin_remove_pages_pdf,yes,yes,0.000,0.667,2m11s,reference file missing (expected_openhands_short.pdf)
admin_translate_sales_chat,yes,yes,0.000,0.000,2m58s,
```

My plan is to iterate on this: run some tasks, log their feedback, spot and fix common patterns in as many places as possible, then run a larger set of tasks and fix issues as they come up.

## Software engineering best practices

In addition to the points above (regular communication, breaking things down, fast testing and iteration) I started to spot some issues in the original implementation that I've been working on fixing.

- Poor code design — lots of nested if/thens, where errors are silently counted as failures. I've been refactoring these and trying to remain truthful to the original implementation but also handle error more explicitly.
- Generalisation across domains — many tasks share the same setup (connect to ownCloud, create a file, check the result) but the code was copy-pasted rather than abstracted. I've been pulling shared helpers so you can reuse something like a CSV reader over many files.
- Reusable helpers — related to the above, one of the bigger to-dos is consolidating the container definitions. At present there are many duplicated docker-compose.yaml files that are nearly identical across tasks, eventually I want to make this a base config and then each task pulls that and applies any changes required.
- Systematic testing — there are mypy and ruff checks running automatically in Inspect which is great. To that I've added the per-task Cursor review, and the experiment_tracking.csv approach above. Longer term it'd be great to automate this too.

# Evaluation validity

As Daniel Kang has argued [here](https://www.youtube.com/watch?v=4iyMb0ARiao) and in [this paper](https://arxiv.org/pdf/2507.02825) with Zhu et al, evaluations are broken! And this eval is no exception. I saw so many issues with the tasks as I went through it. The core problem is that the agent successfully passing the task does not mean the task is scored correctly.

Here are a few of the issues:

- Unrealistic tasks - `ml_grade_exam` requires agents to grade a PDF of an exam, without a PDF reader, or a markscheme, and then save the answers in a weird format (`student_name_<exam_grade>.pdf`). Several tasks just do not seem to represent real office tasks well.
- String-based marking - the task `hr_salary_analysis` expects agents to read a txt file and then save results but only checks if an exact string for a salary e.g. `28000` is present in the answer, and not `28,000` or `$28K` - which would probably be better-formatted responses that you'd expect an agent to do
- Underspecified tasks — in `ml_grade_exam`, agents are penalised if a file isn't named correctly, but the expected format isn't stated in the task description.
- Answers copied in to the container - in many tasks the agent is asked to calculate some data, and then it's scored against a reference answer. But the reference answer is often copied into the container with the agent! For example, `hr_check_attendance_one_day` see [here](https://github.com/TheAgentCompany/TheAgentCompany/tree/main/workspaces/tasks/hr-check-attendance-one-day), and at least a dozen others.

Where possible I've flagged this to the Inspect team and implemented both original and revised scorers to mitigate these issues. Maybe one day there could be Agent Company 2.0 with an improved set of tasks!

# Conclusions

So far what I've taken is that benchmarks can be a lot worse and less realistic than you might expect. This is a big problem! We rely on evals to help us get a sense of how capable models are.

As tasks get longer and more complicated, setting up realistic environments becomes harder, and determining whether an outcome has been achieved can be subjective. So high quality implementations are really important.

But I think that the following would be helpful for similar future evaluations:

- Base container set-ups that can be pulled into many tasks, with per-task modifications
- Shared helpers for tasks like reading CSVs and accessing files
- Agent permissions are crucial - I've often seen even Claude agents poking around the sandbox and trying paths and ports. So if something isn't locked down, you should assume the agent has access to it
