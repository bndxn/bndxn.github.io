---
layout: post
title: LLM post-training
date: 2025-06-05 10:00:00
description: 
tags: ml, llm, llmops, ml, self-development
categories: 
thumbnail: assets/img/mit_llm_lecture_loop.png
images:
  lightbox2: true
  photoswipe: true
  spotlight: true
  venobox: true
---

Working with and deploying LLMs is a rapidly changing landscape, where new models and tools are coming out every month if not every week. In my current role I'm focusing on deploying an already trained and fine-tuned LLM. I wanted to get an overview of the post-training process, and I stumbled across [this](https://www.youtube.com/watch?v=_HfdncCbMOE) video through MIT's [Intro to Deep Learning course](https://introtodeeplearning.com/). 

I thought it was very useful and I wanted to make notes for myself, and which might be useful for others, so I put together this article.

<div class="row justify-content-center mt-3">
    <div class="col-sm-auto">
        {% include figure.liquid loading="eager" path="assets/img/mit_llm_lecture_intro.png" class="img-fluid rounded z-depth-1 mx-auto d-block" %}
    </div>
</div>
<div class="caption text-center">
    Introduction to lecture
</div>

It's the second of two lectures on LLMs. The first one appeared to explain more about how they work from scratch, including tokenizers, attention, etc., which I'm covering in more detail in the great [Andrej Karpathy](https://karpathy.ai/)'s [zero to hero videos](https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ) which I'm going through separately. 

The speaker is Maxime Labonne, who is the Head of Post-Training at Liquid AI, and has an [LLM course](https://github.com/mlabonne/llm-course) on Github with 54K stars (at the time of writing), and has written a book called the [LLM Engineer's Handbook](https://www.amazon.co.uk/LLM-Engineers-Handbook-engineering-production/dp/1836200072). 

In the lecture, Maxime focuses on LLM post-training, which are the steps after a base model is created from raw text. It seems to be geared to people who might take open source [text generation models from HuggingFace](https://huggingface.co/models?pipeline_tag=text-generation) and want to adapt them to a specific task. 

Maxime Labonne calls it "LLM Post-Training", and he sets out this order in his lecture:
1. Dataset generation 
2. Training algorithms
3. Evaluation
4. Future trends
5. Test time compute scaling 

I go through these sections below, but I actually want to turn this whole order upside down.


## Turning it all upside down

So if you go sequentially down the list above, there's a lot of detail to get bogged down in. I want to add a different spin to it. 

First, I think we should **start with evaluation**. By the time we get to it in the lecture, and I guess on a project too, it comes across as lower priority than model selection and quantisation. But as Maxime admits, evaluation in LLMs is a mess and there are no good solutions. Probably the best is a mixture of LLM as a judge (using a different LLM to assess your answers), and human preferences. 

Second, I think we should conceive of LLM engineering as **two loops** - one big, one small, the small running inside the big. The small loop is the training of a specific model, and it takes place within the big loop. The key point is that we need to write **a pipeline** because we're going to make changes to the steps and want to re-run it. Maybe one time we change the data, the next time we change the optimiser, the next time we use a model etc., so there are probably going to be >10 loops - make sure this is a standard and easily reproduceable automated process, and you'll save yourself a lot of time. This links to one of my [principles](/principles): **build pipelines**.

Towards the end of the lecture, Maxime also implies that we want to spend about a third of our team on each of these areas. I'd guess that the tendency is to focus on the fine-tuning and maths, at the expense of evaluation and possibly data.

<div class="row justify-content-center mt-3">
    <div class="col-sm-auto">
        {% include figure.liquid loading="eager" path="assets/img/mit_llm_lecture_loop.png" class="img-fluid rounded z-depth-1 mx-auto d-block" %}
    </div>
</div>
<div class="caption text-center">
    The loop of LLM post-training
</div>


## Data

What is post-training? Everything after the base model which only does next token prediction. Two main steps: supervised fine-tuning (instruction-answer pairs), then preference alignment (a chosen and rejected answer from a pair). 

Fine-tuning is typically using 10K to 1M specific samples, whereas general purpose tuning is where you use more samples. 

When should we fine-tune a model? Start with in-context learning and RAG pipelines. You want to develop a training loop because you'll probably want to tweak things and run it again. 

Organisations are fine-tuning models because of control and customisability - often political. 

Here are some things to consider when choosing data:
* Factual accuracy (could use code checkers)
* Diversity (samples that are different, cover all possible interactions between users and the model)
* Complexity (non-trivial tasks which force reasoning)

Data formats for instruction data are: (system, instruction, output), and for preference it is the same but also includes a rejected output. 

Lots of different ways to generate training data - backtranslation, scoring and filtering, using other LLMs as judges, deduplication and filtering. 

For preference tuning, you might want a chosen and rejected answer. 

Maxime suggests storing things in a chat template, rather than completions.

## Training

He suggests three libraries for fine-tuning: 
* TRL (from HuggingFace) - very up-to-date
* Axolotl (built on top of TRL) - can preprocess data, more user-friendly, yaml config
* Unsloth (good for efficiency)

Three main training techniques: 
* Full fine-tuning, loading the model in full precision, requires lots of compute
* LoRA - only train ~0.5% of the model parameters, but requires loading the whole model
* QLoRA - variant of LoRA, only loads a quantised version of the model, good for resource constraints

Second stage alignment techniques - over 100 different ones. Two examples:
* Proximal policy optimisation - loads three models, training, reward, and frozen
* Direct preference optimisation - uses two models froze

Recommendation: don't over think it - use LoRA, and DPO. 

There are lots of training parameters you might want to tweak: the most important being the learning rate. 

When monitoring experiments, looking at the training loss, you want a steady decline. 

Model merging can be used (averaging model weights) and often gives better performance than source models.


## Evaluation

This is the main problem in the LLM world! "We don't really know what we're doing, but it's really important". He compares different evaluation methods: 
* Automated benchmark, e.g. MMLU - uses a dataset, but these don't replicate real-world interaction
* Domain-specific benchmark - e.g. code, medicine
* Humans to rate the answer - can be precise, no contanimination; but is costly and humans are biased towards longer and more confident models
* LLM as a judge - a separate model. Easier to scale, similar problems to humans (bias, and costly), also can use multiple LLMs as a jury. 

A key point is to start earlier than you think - "it's like test-driven development".

## Future trends

Biggest trend is "test-time compute scaling": what if we use more compute during inference? Here are some ways to increase compute at test time:
* Majority voting: get multiple solutions and take the most frequent
* Best of N: use a reward model or a judge LLM to score the answer and take the best
* Beam search: uses process-reward models, scores steps in the answer - see [this post](https://huggingface.co/spaces/HuggingFaceH4/blogpost-scaling-test-time-compute) from HF

Large enough sampling has been [shown](https://huggingface.co/spaces/HuggingFaceH4/blogpost-scaling-test-time-compute) to make smaller models as accurate as much larger models.

One of the questions at the end also proposed using the uncertainty in best of N to communicate the model's uncertainty - e.g. five of eight models agree means 5/8 = 62.5% confidence. Maxime says you could also use a reward model for this too.


## Implications for my project

As I mentioned earlier, I'm currently working on deploying an LLM that has been fine-tuned already. I'll keep this brief and non-specific, but a few potential ideas:

* Including rejected answers as well as good ones
* LLM as judge for answers
* Chatbot Arena human selection of answers from different models
* Chat completions vs regular completions
* Using beam search for intermediate steps
