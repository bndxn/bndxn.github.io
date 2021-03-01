---
layout: post
title:  "The Signal and the Noise"
date:   2021-02-13 15:29:00 +0000
categories: jekyll update
---

### The book in 50 words

Accurate forecasting is rare, because of poor design and confusion over what we're modelling. This means we often mistake randomness as a trend. Better forecasts combine information from a range of sources and models, update on new information, and are produced and implemented in well-designed institutions that reward accuracy.  

### Summary by chapter 

| Chapter topic | Approach | Limitations|
| ----------- | ----------- |-----------|
| 1. Financial Crisis | Historical | * Errors in a non-linear system grow fast <br> * Poor regulation/institutional design | 
| 2. Political pundits | None ? | * Highly politicised <br> * System rewards controversiality not accuracy|  
| 3. Baseball | Mixed | * Both scouts and stats analysts have partial information <br> * Combining yields better results|
| 4. Weather | Model | * Higher resolutions are computationally demanding <br> * Weather systems are chaotic|
| 5. Earthquakes | Historical | * Incorrect exceptionalism to base rates <br> * Overfitting noisy data | 
| 6. Economics | Model | * Measurement problems <br> * Unclear causality |
| 7. Pandemics | Model | * Measurement problems <br> * Heterogenous observations |
| 8. Bayesianism | N/A | See notes below on Bayes |
| 9. Chess | Model | * Possible moves get big quickly <br> * Humans are easily spooked by clever computers |
| 10. Poker | Model | * Poker is too complex to solve <br> * Bluffing and personality still important |
| 11. Stock markets | Model | * EMH is theoretically true <br> * Incentives lead to irrational exuberance | 
| 12. Climate change | Model | * Bumpy trends are hard to interpret <br> * Lots of turbulence in models | 
| 13. Terrorism | Mixed | * Terrorism is a rare event <br> * But deaths per event fit a power-law (see below) |
 

### Reflections on the text

One challenge with forecasting is knowing whether to use historical trends or model-based predictions.

* Historical: expect things will follow similar trends to what has happened historically. 
* Model-based: form a conceptual model, and then use regressions.  

In the book, there are some times when each method is preferred. For example, historical trends did a poor job in predicting the financial crisis. A conceptual model would have been better. On the other hand, the conceptually faulty  


### Bayesianism

Chapter 8, titled 'Less and less and less wrong' includes a discussion of Bayesianism. Silver summarises Bayes as follows: 

1. We begin with a prior probability of a hypothesis being true - P(A).
2. Estimate how likely it is that we get result B, conditional on the hypothesis (A) being true. 
3. Estimate how likely it is that we get result B, whether or not A is true. 

#### Bayes' theorem

![Imgur](https://upload.wikimedia.org/wikipedia/commons/1/18/Bayes%27_Theorem_MMB_01.jpg)

There's a nice illustration of a woman finding unfamiliar female underwear in a bedroom they share with their husband. What is the probability their husband is cheating on them? 

![Imgur](https://i.imgur.com/A8sIthW.png)

Slightly more intuitively, the chance of finding the underwear given that the husband is cheating is based on three things: the chance that the husband cheating means unfamiliar underwear is left in the house, multiplied by the chance of cheating, divided by the general possibility that unfamiliar underwear appears (e.g. if a sister stayed over). 


#### The frequentist challenge

There were challenges, with the term 'Bayesian' being used in a derogratory way by R. A. Fisher, who asserted that the theory 'must be wholly rejected' (get ref). Fisher, who we know from Fisher's t-test for statistical signifiance, and other tools, and his contemporaries developed the 'frequentist' approach to statistical analysis. 

Silver explains Fisher's challenge to Bayes concisely: 

> In particular, they took issue with the notion of the Bayesian prior. It all seemed too > subjective: we have to stipulate, in advance, how likely we think something is before 
> embarking on an experiment about it? Doesn’t that cut against the notion of objective 
> science? 

However, there are weaknesses to the frequentist approach. It requires data to be normally distributed around a true value, but often data is sparse and biased. Moreover Bayes requires us to be up front about our priors, but the frequentist approach does not - and this might mean that an implausible prior is smuggled into a frequentist analysis, like these [spurious correlations](https://www.tylervigen.com/spurious-correlations).  

### Things I learned 

* Forecasts are often rewarded for values other than accuracy (Ch4). For example, weather forecasts are geared to social and economic loss aversion, which means they sometimes have a [wet bias](https://en.wikipedia.org/wiki/Wet_bias). It rains less frequently than the weather people say, but that doesn't mean you should leave your raincoat at home. 

* GDP data undergoes significant revisions which are large enough to change the sign (Ch6), e.g. from +2% growth to -1%. This is because GDP and similar measures are pulled from many sources and often have significant lags. 

* Forecasts are often communicated without their confidence intervals (Ch6). For example, the flood level in North Dakota in 1997 was forecast as 49 feet (plus or minus 9 feet). Attention focused on 49 feet, and when the flood was 51 feet, barriers were flooded. 

* The proliferation of big data means that we can run all sorts of spurious regressions, which fit exactly. (Does this mean the problem is over/under-specified?) 

* Self-cancelling and self-fulling predictionsm (Ch7). When we make predictions about human activity, humans can then respond to the prediction which might alter the outcome itself (cf [Chris Whitty](https://www.theguardian.com/world/2020/sep/21/uk-could-have-50000-covid-cases-a-day-by-mid-october-says-chief-medical-officer-chris-whitty), Levels 1 and 2 chaos theory in [Sapiens](https://danielmiessler.com/blog/first-second-order-chaos/). 

* Deaths from terrorism fit a [power-law shape](https://en.wikipedia.org/wiki/Power_law), and can be plotted as a straight line on a double-log scale. Power-laws are called this because one variable is a power (e.g. x^2, x^5) of another. This is distinct from a linear (or log-linear) relationship where one variable increase proportionally with (or proportionally to the log of) the other. 


### Links

* [The IGM Booth Economic Experts Panel](https://www.igmchicago.org/) which is a panel of academic economists who give their view on the impacts of range of policy decisions. They have some interesting views, such as that raising the minimum wage in the US is [probably a good idea](https://www.igmchicago.org/surveys/the-us-minimum-wage/). 

* [Metaculus](https://www.metaculus.com/questions/) is an American reputation-based, massive online prediction solicitation and aggregation engine. See discussions on everything from Covid metrics to space exploration. 
