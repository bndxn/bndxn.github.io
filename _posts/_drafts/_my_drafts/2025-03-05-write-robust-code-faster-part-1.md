---
layout: post
title: Write robust code faster - part 1
date: 2025-01-23 13:59:00
description: Why testing will speed up development
tags: technical, development
categories:
thumbnail:
images:
  lightbox2: true
  photoswipe: true
  spotlight: true
  venobox: true
---

There are different approaches in terms of testing, but most people grudgingly agree it is useful, but a hassle to set up.

Here's a quick refresher and some tips I've found helpful in setting up tests.

## What are we optimising for?

I've worked in organisations with very stringent testing requirements, and some with no testing at all.

## Types of tests

- Unit -
- Integration -
- E2E -

## Unit tests

You can take your pick of pytest, unittest, and many other frameworks. I've found that pytest works well.

The main issue I experienced with this is setting up the `pythonpath` variable.

```python
# myfunc.py
def split_into_blocks(message: str) -> List[str]:
    """Take a message as a string and split into different blocks."""
    blocks = message.split('\n')
    return [b.strip() for b in blocks]

# test_myfunc.py

from myfunc import split_into_blocks

def test_split_into_blocks_happy():

    example_message = """Some example text
    and some more here
     and a few new lines. """

    expected_output = [
        "Some example text",
        "and some more here",
        "and a few new lines."
    ]

    assert expected_output = split_into_blocks(example_message)
```

## E2E and integration tests

I've really enjoyed using `pytest-bdd` to set these up, because you get to see testing more as meeting a requirement closer to a user requirement.

```gherkin
Given a user

```

## Putting these tests into practice

Unit tests running a pre-commit hook with some specified minimum test coverage. This encourages me to write with code on one window and tests on the other.

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v2.3.0
    hooks:
      - id: check-yaml
      - id: end-of-file-fixer
      - id: trailing-whitespace
  - repo: local
    hooks:
      - id: pytest
        name: pytest
        entry: poetry run pytest
        language: system
        always_run: true
        pass_filnames: false
        types: [python]
        stages: [push]
```

E2E tests which require connections to separate services run better on pull requests, and remotely. I think this is a good idea because it avoids the need to have all credentials present locally on every developer's machine - instead you can make them available in your CI/CD pipeline.
