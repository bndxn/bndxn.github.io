---
layout: post
title: Building micrograd
date: 2025-06-05 14:00:00
description: 
tags: llm, backpropagation, python, calculus
categories: 
thumbnail: 
images:
  lightbox2: true
  photoswipe: true
  spotlight: true
  venobox: true
---

This is a messy WIP! I'm posting this to make myself accountable to my goal of following some Karpathy videos. And I'm hoping these unfinished notes encourage me to finish the video and tidy them up, asap!

# Building micrograd

Notes following along with this: https://www.youtube.com/watch?v=VMj-3S1tku0

Micrograd has parent and child nodes and we implement a forward and backward pass.

We use the chain rule to see how differences in the node weights impact the outcomes. 

Neural networks are mathematical expressions taking inputs and giving predictions or a loss function. Backpropagation can be applied to any mathematical expressions, it doesn't need to be a neural networks.  

## What is the meaning of the derivative? 

If we have some function, e.g. `f(x) = 3*x**2 - 4*x + 5`.

A derivative is the sensitivity of the function to a change in the inputs, the slope of the response.

We tried some examples of expressions and altered some of the variables by adding a small `h`. Then we can see how the output changes as a result - i


```python
import math
```


```python
class Value:

    def __init__(self, data):
        self.data = data

    def __repr__(self):
        """Used to return a string representation of an object."""
        return f"Value(data={self.data})"
    
    def __add__(self, other):
        out = Value(self.data + other.data)
        return out
    
    def __mul__(self, other):
        out = Value(self.data * other.data)
        return out
    
a = Value(2.0)
b = Value(-3.0)
a *b
```




    Value(data=-6.0)



We need to store the connections between the nodes, and how the expressions came to be. 


```python
class Value:

    def __init__(self, data, _children=(), _op='', label=''):
        self.data = data
        self.grad = 0 # we start from assuming the gradient is zero
        self._prev = set(_children)
        self._op = _op
        self.label = label 
        self._backward = lambda : None # does the function at each node, and for a leaf function there's nothing to do

    def __repr__(self):
        """Used to return a string representation of an object."""
        return f"Value(data={self.data})"
    
    def __add__(self, other):
        """Python knows that '+' is the same as '__add__' here."""
        out = Value(self.data + other.data,  (self, other),'+')
        
        def _backward():
            # when we just add nodes values together, their local grad is just 1
            self.grad  = 1.0 * out.grad # out.grad here because that's the grad of the input Value 
            other.grad = 1.0 * out.grad

        out._backward = _backward
        return out
    
    def __mul__(self, other):
        out = Value(self.data * other.data, (self, other), '*')

        def _backward():
            # when we multiply node values together, their grads are the other datas
            self.grad = other.data * out.grad
            other.grad = self.data * out.grad

        out._backward = _backward

        return out
    

    def tanh(self):
        x = self.data
        t = (math.exp(2*x) -1 )/(math.exp(2*x) + 1)
        out = Value(t, (self,), 'tanh')

        def _backward():
            self.grad = 1 - t ** 2

        out._backward  = _backward

        return out
    
a = Value(2.0, label='a')
b = Value(-3.0, label='b')
c = Value(10, label='c')
e = a*b; e.label='e'
d = e + c; d.label='d'
f = Value(-2.0, label='f')
L = d * f; L.label='L'
```

## Manual backpropagation

Recap: 
* We see how one of the nodes affects L
* We can work out the effect analytically using the chain rule
* We can also work the effect numerically using python

Backpropagation is a recursive application of chain rule, backwards through the computation graph. 


```python
from graphviz import Digraph

def trace(root):
    # builds a set of all nodes and edges in a graph
    nodes, edges = set(), set()
    def build(v):
        if v not in nodes:
            nodes.add(v)
            for child in v._prev:
                edges.add((child, v))
                build(child)
    build(root)
    return nodes, edges

def draw_dot(root):
    dot = Digraph(format='svg', graph_attr={'rankdir': 'LR'})  # LR = left to right

    nodes, edges = trace(root)
    for n in nodes:
        uid = str(id(n))
        # for any value in the graph, create a rectangular ('record') node for it
        dot.node(name=uid, label="{ %s | data %.4f | grad %.4f }" % (n.label, n.data, n.grad), shape='record')
        if n._op:
            # if this value is a result of some operation, create an op node for it
            dot.node(name=uid + n._op, label=n._op)
            # and connect this node to it
            dot.edge(uid + n._op, uid)

    for n1, n2 in edges:
        # connect n1 to the op node of n2
        dot.edge(str(id(n1)), str(id(n2)) + n2._op)

    return dot

```


```python
draw_dot(L)
```




    
![svg](code_along_files/code_along_7_0.svg)
    




```python
# nudging our input
# if we want to increase L, then we go in the direction of the gradient

a.data += 0.01 * a.grad
b.data += 0.01 * b.grad
c.data += 0.01 * e.grad
f.data += 0.01 * f.grad
# we only include the leaf nodes, as the others, e.g. "e" will be influenced by a and b


# we then have to rewrite the forward pass, update the values
e = a*b
d = e + c
L = d * f

print(L.data)
```

    -8.0



```python
## Filling in the gradients

def lol():
    # manually creating local derivative
    # Keeping in local scope

    h = 0.0001

    a = Value(2.0, label='a')
    b = Value(-3.0, label='b')
    c = Value(10, label='c')
    e = a*b; e.label='e'
    d = e + c 
    f = Value(-2.0)
    L = d * f; L.label='L'
    L1 = L.data

    a = Value(2.0, label='a')
    b = Value(-3.0, label='b')
    c = Value(10, label='c')
    e = a*b; e.label='e'
    d = e + c
    d.data += h
    f = Value(-2.0)
    L = d * f; L.label='L'
    L2 = L.data

    print((L2-L1)/h)

lol()
```

    -1.9999999999953388


We could get this through the chain rule, 

L = d * f
we think
dL/dd = f

proof: 
def of derivative: (f(x+h)-f(x))/h
in this case we sub f for the function, so 

((f*(d+h) - f*d))/h = (f*d + f*h - f*d)/h = f*h / h = f



```python
L.grad = 1
f.grad = 4.0
d.grad = -2
```

Now we want the gradient of an earlier node, e.g. c.

How does c affect d?

dd / dc ?

d = c + e 

f(x+h) - f(x) / h

((c + h) + e) - (c + e) / h

h / h = 1

Chain rule tells us we *multiply* the derivatives. 

Key point: if the gradient is 1, we can interpret it as routing the effect


```python
c.grad = -2.0 * 1
e.grad = -2.0 * 1
```

Recursing back 

dL/da = -2
dL/da = dL/de * de/da
dL/da = -2 * de/da

e = a*b

f(x+h) - f(x) / h
(a+h)*b - a*b / h = ab + hb - ab / h = hb/ h = b




```python
a.grad = -2 * -3
b.grad = -2 * 2  
```


```python
a.grad
```




    6



## Backpropagate through a neuron

A neuron takes the sum of the weights and inputs 

Consider: 
* \sum{ w_i x_i} + b
* Activation function, usually **squashing** - sigmoid, tanh: (e**2x -1)/(e**2x + 1)

We cap the outputs
 smoothly close to -1 and +1


```python
import matplotlib.pyplot as plt
import numpy as np

plt.plot(np.arange(-5,5,0.2), np.tanh(np.arange(-5,5,0.2))); plt.grid();
```


    
![png](code_along_files/code_along_18_0.png)
    



```python
# 2D neuron, x1 and x2
x1 = Value(2.0, label='x1')
x2 = Value(0.0, label='x2')

# weights, the synaptic strength
w1 = Value(-3.0, label='w1')
w2 = Value(1.0, label='w2')

# bias
b = Value(6.8813735, label='b')

x1w1 = x1 * w1; x1w1.label = 'x1*w1'
x2w2 = x2 * w2; x2w2.label = 'x2*w2'
x1w1x2w2 = x1w1 + x2w2; x1w1x2w2.label = 'x1*w1 + x2*w2'
n = x1w1x2w2 + b; n.label = 'n'    

# implementing tanh requires exponentiation, and we haven't done that yet
# the only thing that matters is that we can differentiate the function

o = n.tanh(); o.label = 'o' 
```


```python
draw_dot(o)
```




    
![svg](code_along_files/code_along_20_0.svg)
    




```python
o.grad = 1.0
```


```python
# o = tanh(h)
# do/dn = 1 - tanh(n)**2  (based on calculus, seeing online)
# so do/dn = 1 - o**2
```


```python
1 - o.data**2
```




    0.5000000615321112




```python
# so based on this, we can set:
n.grad = 0.5
```

so for (x1w1 + x2x2) and b, we know they are just added together and then go through the activation, so 

d((x1w1 + x2w2))/dL = dL/dn * d((x1w1 + x2w2))/dn
dL/dn = 0.5 (from earlier)
d((x1w1 + x2w2))/dn = 1

so we can set


```python
x1w1x2w2.grad = 0.5
b.grad = 0.5
```


```python
# then because these are just pluses
x1w1.grad = 0.5
x2w2.grad = 0.5
```


```python
x2.grad = w2.data * x2w2.grad
x2.grad 
```




    0.5




```python
w2.grad = x2.data * x2w2.grad
w2.grad
```




    0.0



It makes sense that some gradients are zero because the data is zero - so it's not making any contribution to the loss function. 


```python
x1.grad = w1.data * x1w1.grad
w1.grad = x1.data * x1w1.grad
print(x1.grad, w1.grad)
```

    -1.5 1.0


Paused at 1:10:28!


