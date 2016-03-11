PlayerSessions = new Mongo.Collection('playerSessions');

PlayerSession = Astro.Class({
  name:'PlayerSession',
  fields: {
    sessionId: {
      type:'string',
      default: function() {
        return Random.id();
      }
    },
    boards: {
      type: 'array',
      nested: 'Board'
    },
    nickName: 'string' // if set then overrides the nickName of any userprofile associated with this session 
  }
});

Player = Astro.Class({ // a player is confined to a single board
  name:'Player',
  fields: {
    name:'string',
    nickName: 'string',
    controller: { //who is the controller of this player
      type:'object',
      nested:'PlayerSession',
      default: function() {
        return {};
      }
    },
    playerState: { // a player state is associated with a single board state, the gamestate keeps track of the current player state
      name: 'PlayerState',
      fields: {
        alive: 'boolean',
        operations: {
          type:'array',
          nested: {
            name:'Operation',
            fields: {
              typeOf: 'string',
              validators: {
                typeOf: Validators.choice(['add','remove'])
              }
            }
          }
        }
      }
    }
  }
});

MonsterState = Astro.Class({
  name:'MonsterState',
  fields:{
    
  }
});

UserProfile = Astro.Class({
  name:'UserProfile',
  fields: {
    nickname: 'string',
    playerSessions: {
      type:'array',
      nested:'PlayerSession'
    }
  }
});

Board = Astro.Class({
  name:'Board',
  fields: {
    sizeX:'number',
    sizeY:'number',
    createdAt: 'date',
    controllers: {
      type:'array',
      nested:'PlayerSession'
    },
    validators: {
      sizeX: [Validators.required(),Validators.number(),Validators.lte(100),Validators.gte(10)],
      sizeY: [Validators.required(),Validators.number(),Validators.lte(100),Validators.gte(10)]
    },
    boardState: {
      type: 'object',
      nested: {
        name:'BoardState',
        timeStamp: 'date',
        fields: {
          stateController: { //what player is controlling this state of the board
            type: 'object',
            nested: 'Player'
          },
          cells: {
            type:'array',
            nested: {
              name: 'Cell',
              fields: {
                players: {
                  type: 'array',
                  nested: 'Player'
                },
                walls: {
                  type:'array', //several 'up' typeOf wall in the array means that many layers etc
                  behavior: ['updateDiffXY'],
                  nested: {
                    name:'Wall',
                    fields: {
                      typeOf: 'string',
                      validators: {
                        typeOf: Validators.choice(['up','down','left','right']),
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
  }
});

Games = new Mongo.Collection('games');

GameState = Astro.Class({
  name:'GameState',
  fields: {
    boardState: { //what is the state of the board
      type:'object',
      nested: 'BoardState'
    },
    players: { //who are playing the game
      type:'object',
      nested:'Player'
    },
    spectators: { // who are watching the game
      type: 'array',
      nested:'PlayerSession',
    }
  }
});

Game = Astro.Class({ // a game holds all info of a game such as number of rounds played , points, wins , etc
  name:'Game',
  collection: Games,
  fields: {
    board: { // A game has a single board and a board is associated with a single game
      type:'object',
      nested:'Board'
    },
    createdAt: 'date',
    creator: {
      type:'object',
      nested:'UserProfile'
    },
    gameStates: { // the head of the stack is the current state - the tail is the history
      type:'array',
      nested: 'GameState'
    }
  }
});




