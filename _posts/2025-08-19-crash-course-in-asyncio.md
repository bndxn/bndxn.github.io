---
layout: post
title: Crash course in asyncio
date: 2025-08-19 13:59:00
description:
tags: operations, llm, async, learning
categories:
thumbnail: assets/img/960px-Pine_Hill_Lookout_and_Towers_1.jpg
images:
  lightbox2: true
  photoswipe: true
  spotlight: true
  venobox: true
---

<div class="row justify-content-center mt-3">
    <div class="col-sm-auto">
        {% include figure.liquid loading="eager" path="assets/img/960px-Pine_Hill_Lookout_and_Towers_1.jpg" class="img-fluid rounded z-depth-1 mx-auto d-block" %}
    </div>
</div>
<div class="caption text-center">
    Radio Towers at Pine Hill Lookout, because data transmission! Image credit - CopperWhopper67 - Own work, CC BY-SA 4.0, https://commons.wikimedia.org/w/index.php?curid=149170352. 
</div>

I found some code in BEIS' AI Safety [Inspect Evals](https://github.com/UKGovernmentBEIS/inspect_evals/) repo which used asynchronous functions. I've come across async functions but never written any code with them. So here's a rapid crash course, with the start based on Real Python's [asyncio walkthrough](https://realpython.com/async-io-python/).

My goal in writing this is to demonstrate an basic async python function like that used for `scorer` in inspect_ai, and also work out how to test these functions.

## What is async and why use it?

- The `asyncio` library and the `async` and `await` keywords enable a model built into CPython
- It uses co-operative multitasking but strictly it's not threading or multiprocessing
- A program's event loop runs multiple tasks
- A coroutine is an object which can suspend its execution and execute it later
- Coroutine objects come from coroutine functions
- The benefit of awaiting something is that the surrounding function can cede control to something able to act immediately
- `async def` - defines either a coroutine function or an asynchronous generator
- `async with` / `async for` - async versions of those functions
- `await` - suspends surrounding coroutine, passes control back to event loop

So this is the code I came across which I wanted to understand better. It's from [here](https://github.com/UKGovernmentBEIS/inspect_evals/pull/449/files).

```python
    from inspect_ai.scorer import scorer
    ...
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

So it looks like it's doing a couple of funky things - using a decorator to modify the `score` function to be a `scorer` in the way defined in `inspect_ai`. Then it also defines it as an asynchronous function, which I now know means that it's a coroutine object which can suspend its execution.

So what is this `scorer` object? The decorator modifies it as a `scorer`, which is defined in the `inspect_ai` repo [here](https://github.com/UKGovernmentBEIS/inspect_ai/blob/main/src/inspect_ai/scorer/_scorer.py). I've removed part of the code below for readability, so just be aware it's not showing the full definition.

`````python
@runtime_checkable
class Scorer(Protocol):
    async def __call__(
        self,
        state: TaskState,
        target: Target,
    ) -> Score:
        r"""Score model outputs.

        Evaluate the passed outputs and targets and return a
        dictionary with scoring outcomes and context.

        Args:
            state: Task state
            target: Ideal target for the output.

        Examples:
          ```python
          @scorer
          def custom_scorer() -> Scorer:
              async def score(state: TaskState, target: Target) -> Score:
                  # Compare state / model output with target
                  # to yield a score
                  return Score(value=...)

              return score
          ````
        """
        ...
`````

And this just seems to that scorers return a score. Scorers gonna score!

Then the `score`, is defined [here](https://github.com/UKGovernmentBEIS/inspect_ai/blob/main/src/inspect_ai/scorer/_score.py).

```python
async def score(conversation: ModelConversation) -> list[Score]:
    """Score a model conversation."""

    if isinstance(conversation, TaskState):
        state = conversation
    else:
        current_state = sample_state()
        if current_state is None:
            raise RuntimeError(
                "The score() function can only be called while executing a task"
            )
        state = copy(current_state)
        state.messages = conversation.messages
        state.output = conversation.output

    # get current scorers and target
    scorers = _scorers.get(None)
    target = _target.get(None)
    if scorers is None or target is None:
        raise RuntimeError(
            "The score() function can only be called while executing a task with a scorer."
        )

    scores: list[Score] = []
    for scorer in scorers:
        score = await scorer(state, target)
        scores.append(score)
        transcript()._event(
            ScoreEvent(score=score, target=target.target, intermediate=True)
        )
    return scores
```

And we find the asynchronous bit through the `await` keyword.

```python
    for scorer in scorers:
        score = await scorer(state, target)
```

So this looks to be sending off multiple `scorer` tasks and waiting until they're all completed. I made a more basic example focusing on the async part without the rest of the code.

```python
# async_runs.py
import asyncio
import time

async def fetch_one(i):
    await asyncio.sleep(2)      # a task taking a few seconds
    return i * 2

async def main():
    tasks = [asyncio.create_task(fetch_one(i)) for i in range(10)]
    results = await asyncio.gather(*tasks)  # groups the individual awaitables to be treated as a single awaitable
    print(results)

start = time.time()
asyncio.run(main())
end = time.time()
print(f"Time elapsed: {(end-start):0.2f} seconds")
```

This printed the following:

```
[0, 2, 4, 6, 8, 10, 12, 14, 16, 18]
Time elapsed: 2.00 seconds
```

So if this was running sequentially it'd take 20 seconds, and this time it's taken 2 seconds, so we can see why using `async def` and `await` with `Scorer` objects would be a good idea if they take a while to calculate.

## Testing

We love testing, but how are we going to test an async function? Here's what the test from their Inspect_Evals repo looks like.

```python
@pytest.mark.asyncio
    async def test_bbeh_scorer_correct(self):
        """Test scorer with correct answer."""
        scorer_func = bbeh_scorer()

        # Mock TaskState with completion
        mock_state = Mock(spec=TaskState)
        mock_state.output.completion = "The answer is 4"

        # Mock Target
        mock_target = Mock()
        mock_target.text = "4"

        score = await scorer_func(mock_state, mock_target)

        assert score.value == CORRECT
        assert score.answer == "The answer is 4"

```

So can I do a similar test for my own function?

```python
# test_async_runs.py
import pytest
from async_runs import fetch_one

@pytest.mark.asyncio
async def test_fetch_one():
    """Test the fetch one function with a particular value."""
    scorer_func = fetch_one(2)
    score = await scorer_func
    assert score == 4
```

This then can be tested with `uv run pytest`.

```
======================================== 1 passed in 2.01s ========================================
```

Boosh! Done.
