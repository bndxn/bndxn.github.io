---
layout: post
title: Understanding the BBEH PR on Inspect
date: 2025-07-18 13:59:00
description: Learning more about LLM evaluation
tags: evaluations, ai-safety, learning, open-source
categories:
thumbnail: assets/img/evaluation-min.png
images:
  lightbox2: true
  photoswipe: true
  spotlight: true
  venobox: true
---

I've heard about the [Inspect](https://github.com/UKGovernmentBEIS/inspect_evals/) tool developed to evaluate the capabilities of LLMs, created by the UK AISI, Arcadia Impact, and the Vector Institute. I thought it could be useful way to learn more about how Inspect and LLM evaluation more broadly works.

I contacted one of the maintainers who suggested implementing more evals - the more evals the better! Lots of organisations are coming out with new benchmarks and implementing them would be helpful in understanding model performance. One such eval is called [BIG-Bench Extra Hard](https://arxiv.org/pdf/2502.19187). The funky name is because it's a large set of tasks, and it's an extra hard version, because the original BIG-Bench is now too easy for the latest models.

The tasks in BBEH are all based on text inputs and outputs, so there's no tool use or interactivity here. There are many different types of problem: multistep arithmetic, spatial reasoning, shuffled objects, word sorting. Here's an example of a word sorting problem:

```
Input: Consider a new alphabet whose letters have the same order as the English alphabet, except that r and p are swapped. Sort the following words with the new alphabet and separate them with comma: syndrome, therefrom, [...], specifications.
Output: ...
```

I wanted to start working on this but then when I came back, I saw someone had a PR ready that looked pretty close to being done. No worries, there are lots of other datasets that could be implemented!

I could make sense of the repo but a few bits were less familiar, so I'm going through the changes here to check I understand them, so I could help on something else in future.

## Changes

The first significant change is creating a `src/inspect_evals/bbeh/bbeh.py` file, which makes: reference to a scorer function defined elsewhere in the repo (I guess scoring is common to other evals), then defines a function `bbeh`, as below. What's going on here?

```python
@task
def bbeh(
    benchmark_task: BENCHMARK_TASK | None = None, solver: Solver | None = None
) -> Task:
    dataset = load_bbeh_dataset(benchmark_task)
    return Task(
        dataset=dataset,
        solver=solver or generate(),
        scorer=bbeh_scorer(),
        metrics=[
            grouped(
                accuracy(),
                group_key="task",
                all=False,
            ),  # average for each task
            harmonic_mean_across_tasks(),  # harmonic mean across tasks
        ],
    )
```

How does this compare to other places in the Inspect repo? Let's look at [their implementation](https://github.com/UKGovernmentBEIS/inspect_evals/blob/main/src/inspect_evals/mmlu/mmlu.py) of MMLU, since that's another benchmark I've previously heard about. I've taken a few bits out to make it easier to compare here.

```python
@task
def mmlu_0_shot(
    subjects: str | list[str] = [],
) -> Task:

    dataset = get_mmlu_dataset("test", shuffle=True, subjects=subjects)

    max_tokens = DEFAULT_MAX_TOKENS

    return Task(
        dataset=dataset,
        solver=multiple_choice(
            max_tokens=max_tokens,
        ),
        scorer=choice(),
        config=GenerateConfig(temperature=0.0),
    )
```

So what do both of these have? They both load a dataset, then define a function with the `@task` decorator for one, returning a `Task` object. Helpfully the [inspect website](https://inspect.aisi.org.uk/) explains this: "The Task object brings together the dataset, solvers, and scorer, and is then evaluated using a model."

The decorator `@task` is modifying the behaviour of the function, I guess changing this generic function to an example of a `task` function (small `t`), maybe extending it to be able to do other things, like orchestrate running lots of them or storing metrics. In fact just a few lines lower on the Inspect page, they explain it too: "The @task decorator ... function is what enables inspect eval to find and run the eval in the source file passed to it."

Ok moving on!

The `Task` object also takes a `solver`, and a `scorer`, and these differ between the two examples. The `solver` is whatever technique we're using, the most basic simply being `generate` where it's sent to an LLM without any further guidance.

```python
...
Task(
        dataset=dataset,
        solver=solver or generate(),
        scorer=bbeh_scorer(),
        ..._)
```

There are then two functions defined within other functions, I guess also acting as decorators.
The first of those is is defining a function `harmonic_mean_across_tasks` to return a `Metric`, and that function implements a harmonic mean, which is H = n / (1/x₁ + 1/x₂ + ... + 1/xₙ). The next is returns a `Scorer`, which is a bit more complex so I'll put it below.

```python
@scorer(metrics=[accuracy(), stderr(), harmonic_mean_across_tasks()])
def bbeh_scorer() -> Scorer:
    async def score(state: TaskState, target: Target) -> Score:
        sample = state.output.completion
        reference = target.text
        # use default evaluator provided by the authors
        correct = evaluate_correctness(sample, reference)

        return Score(value=CORRECT if correct else INCORRECT, answer=sample)

    return score
```

So this has the `@scorer` decorator, so making this into one of the general scorers in the repo I guess. Then we have an async def. Ok so this is an **asynchronous** function, very exciting.

The next change is loading the dataset, that seems quite simple and that HuggingFace takes care of most of that.

There are also some utils about stripping away brackets and braces, and munging LaTeX which might be output from the eval solutions, maybe that happens often for the maths ones.

Then there are tests
