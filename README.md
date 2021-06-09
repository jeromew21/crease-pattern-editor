# Origami Crease Pattern Editor

![screenshot](https://raw.githubusercontent.com/jeromew21/crease-pattern-editor/master/resources/2021-04-08_04-02.png)

## Features

Circle Packing

Triangle tiling

### Hopeful features

Line editing

Grid/intersection snapping

Polygon tiling

Circle packing optimization

Support for making diagrams

## Motivation

Certain subsets of origami design can be pretty much completely formalized (and in turn, automated). _[Origami Design Secrets](https://www.amazon.com/Origami-Design-Secrets-Mathematical-Methods/dp/1568814364)_ by Robert J. Lang is the English-speaking world's foremost resource for origami theory. Many of the techniques presented in the book beg for an easy-to-use implementation.

## Controls

The goal is to more or less replicate the UI motions of Gimp/Inkscape.

Move camera: Middle mouse drag

Multi-select: Shift-click

Delete selection: Delete


## Techinical overview

### Why Javascript?

I originally wanted to use C++, for more lower-level control over floating point math and—of course—static typing. This presents several downsides, including having to learn a cross-platform GUI API which sounds like more trouble than it's worth.

Javascript does have advantages, such as being portable and easy to prototype with.

### Why no React/Vue/Angular/...?

I'm a fan of React, but for this project, the UI elements aren't particularly dynamic: most of the action should be happenening within the main `canvas`. Vanilla JS + JQuery is more than enough. Switching to a framework may become a necessity in the future.
