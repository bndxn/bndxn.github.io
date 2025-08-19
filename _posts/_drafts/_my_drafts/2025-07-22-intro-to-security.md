---
layout: post
title: Intro to computer security
date: 2025-07-22 13:59:00
description: Overview of information and security
tags: infosec, architecture, security
categories: 
thumbnail: 
images:
  lightbox2: true
  photoswipe: true
  spotlight: true
  venobox: true
---

MIT lecture on computer security

- Security is having a computer system still be useful while there is an adversary
- We typically have goals that are loosely defined, e.g. something is read-only by a few people, so many other classes of attacks are not possible
- But this opens up a huge range of things to consider, so we use threat models to narrow down the options. Threat model is the set of assumptions
- Satisfying the goal means following some kind of policy, a plan or config. This is implemented through some kind of mechanism.
- you can debate mechanisms but it’s hard to validate threat models
- it’s easier to attack than defend since there are many types of attack
- maybe it’s just enough to make the cost of attacks higher for attackers, than the value of information they’d gain
- attacks are often many different things pieced together, rather than just “one and done”, e.g. using amazon to reset iCloud to reset gmail. Or an unanticipated usage, e.g. the kid adds a principal to their class then resets their password - the assumption that a principal can be added to a class
- insecure defaults are a bad idea, e.g. router password being “password”

## Threat models
How do you mess up your threat model? 
- Assumption that secret designs, "security by obscurity" would make things secure is bad, because people can figure it the design. But it's worse than that because you can't recover from it - if your design is compromised, then you have to redesign the whole system rather than just rotating your keys. You want to be able to iterate. 
- Assumptions about user behaviour - users might put passwords in the wrong place, or give out 2FA codes to the wrong person. It can be hard to change user behaviour but you can change systems.
- Assuming overly-specific attacks - for example, captchas try to prevent automatic spam, which assumed ML systems, but now hackers just pay humans in low-cost countries to solve captchas, now means spam is less of an issue
- Incorrect assumption that your computer is running the expected software - where it the software coming from - a supply chain attack? this can also happen during updates, especially if the ownership of the app has been transferred from the original developer to someone else