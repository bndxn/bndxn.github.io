---
layout: post
title: Write robust code faster - part 1
date: 2025-01-23 13:59:00
description: Why testing will speed up development
tags: management
categories: 
thumbnail: 
images:
  lightbox2: true
  photoswipe: true
  spotlight: true
  venobox: true
---

There are different approaches in terms of testing, but most people grudgingly agree it is useful, but a hassle to set up. 

So here are some tips on getting it set up faster. 

## Unit tests

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

## Integration tests

I'm not so sure these are helpful in terms of components within a repo. Maybe it's more useful for software engineering. 

The core thing here seems to be 


# E2E tests

I've really enjoyed using `pytest-bdd` to set these up, because you get to see testing more as meeting a requirement closer to a user requirement. 


