# Origami Crease Pattern Editor

## Features

Circle Packing

### Hopeful features

Angle editing

Grid snapping

Full crease pattern generation 

## Motivation

Certain subsets of origami design can be pretty much completely formalized and automated. [Origami Design Secrets](https://www.amazon.com/Origami-Design-Secrets-Mathematical-Methods/dp/1568814364) is the English-speaking world's foremost resource for this, and as I go through some of the techniques beg for an easy-to-use implementation

## Techinical overview

### Why Javascript?

I originally wanted to use C++, for more lower-level control over floating point math and --- of course --- static typing. This presents several downsides, including having to learn a cross-platform GUI API which sounds like more trouble than it's worth.

Javascript does have advantages, such as being portable and easy to prototype with.

### Why no React/Vue/Angular/...?

I'm a fan of React, but for this project, the UI elements aren't particularly dynamic: most of the action should be happenening within the main `canvas`. JQuery is more than enough.
