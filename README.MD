# Introduction

This project is about me learning to code using BlazeComponents and Astronomy

I will do this by creating a simple game multiplayer game

# The game

## The game consists of
1. A monster that takes the shortest route to any player on the board
2. A game board consisting of cells
3. Players that occupy a single cell
4. An exit
5. walls in one or several directions
6. "Operations" that can be used to add or remove walls from cells depending on type
7. Walls have zero or more layers. An add operations adds layers. Remove operations removes layers.

## The goal
The goal of the game is to get safely to the exit
Games are played in rounds. The player with the most wins in a 3 round battle wins. 

## The game mechanics

The game mechanics consists of the following:
### Each round has two phases
Phase 1:
Each player in turn gets to add and remove walls from any cell depending on how many operations the player has accumulated
Each add or remove of a wall counts from available operations
Add and removal operations can be done anywhere.
Phase 2:
The Minotaur moves
Players are rewarded one random operation

### Rules and Properties
Players have one move
A move is either:
  move the player to a proximal cell
  Use any number of operations accumulated
  Pass

A monsters move is only moving from one cell to another using the shortest path.
The shortes path is the shortest path to the closest player.
If the next move cant change the state of the minotaur, because of walls that move is dropped.
The minotaur has two moves for each tick. 

A maximum of 10 operations can be stored, all newly awarded operations will be dropped

If a monster gets trapped around walls it will go berserk within two ticks => trapped && tick => trapped && tick => berserk

A monster that is berserk ignores walls and removes them regardless of the number of layers of the wall.  It also has 4 moves the first tic, three moves the second tick, on the third tick the monster is back to normal

