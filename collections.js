//TODO: implement GameRule ,ActorSlot

PlayerSessions = new Mongo.Collection('playerSessions');

State = Astro.Class({
  name:'State'
});
GameObject = Astro.Class({
  name:'GameObject',
  fields: {
    state:{
      type:'object',
      nested:'State'
    }
  }
});
ActorState = State.inherit({
  name:'ActorState',
  fields: {
    position: {
      type:'object',
      nested: {
        name:'Position',
        fields: {
          x:'number',
          y:'number'
        }
      }
    }
  }
});
PlayerState = ActorState.inherit({
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
});
CellState = ActorState.inherit({
  name:'CellState',
  fields: {
    walls: {
      type:'array',
      nested: {
        name:'Wall',
        fields: {
         typeOf:'string',
         validators: {
           typeOf:Validators.choice(['up','down','left','right'])
         } 
        }
      }
    }
  }
});

Rule = Astro.Class({ //checks if a state is allowed //TODO: wrap a set of states into an object, this object can be set, then the allowed function works on that, this allows to attach rules to objects that will auto validate themselves on statechange
  name:'Rule',
  fields: {
    description:'string',
    typeOf:'string',
    allowed: function(fromState,toState,action,gameContext,gameState) {
      return true;
    },
    validators: {
      typeOf:Validators.choice(['state','action','actor']) //to what does the rule apply // state => checks if a state is allowed , action => checks if a state change is allowed , actor => checks if...
    }
  }
});

GameRules = Astro.Class({
  name:'GameRules',
  fields: {
    rules: {
      type:'array',
      nested:'Rule'
    }
  }
});
GameContext = Astro.Class({
  name:'GameContext',
  fields: {
    boardSize: {
      type:'object',
      nested: {
        name:'Size',
        fields: {
          x:'number',
          y:'number'
        }
      }
    },
    actorSlots: {
      type:'array',
      nested: {
        name:'ActorSlot', // maps an actor with a slot id - purpose to be able to know whose turn it is , slot id implicit from position in the array, An empty actor slot means there is room for more players
        fields: {
          actor: {
            type:'object',
            nested:'Actor'
          }
        }
      }
    },
    controller: 'number', // the actor in the actorSlots who is in control of the game 
    nextController:function(controller) {
      if(controller==null) {
        return (this.controller+1)%+this.actorSlots.length
      }
    }
  }
});
Actor = GameObject.inherit({
  name:'Actor',
  fields: {
    gameController: {
      type:'object',
      nested:'GameController'
    }
  }
});
ActorController = Astro.Class({
  name:'ActorController',
  fields: {
    actor: {
      type:'object',
      nested:'Actor'
    }
  }
});
AIController = ActorController.inherit({
  name:'AIController',
  fields: {
    gameRules: {
      type:'array',
      nested:'GameRule'
    },
    gameState: {
      type:'object',
      nested:'GameState'
    }
  }
});
AIMonster = AIController.inherit({
  name:'AIMonster'
});
MonsterState = ActorState.inherit({
  name:'MonsterState',
  fields: {
    behavior: {
      type:'object',
      nested:'AIMonster'
    }
  }
});
Action = Astro.Class({
  name:'Action',
  fields: {
    commands: {
      type:'array',
      nested: {
        name:'Command',
        fields: {
          gameObject: { //what GameObject to change
            type:'object',
            nested:'GameObject'
          },
          toState: {
            type:'object',
            nested:'State'
          }
        }
      }
    }
  }
});
ActionFactory = Astro.Class({  // describes a mapping between an event and an action to take
  name:'ActionFactory',
  fields: {
    action:{
      type:'object',
      nested:'Action'
    },
    event: {
      type:'object',
      nested:'Event'
    }
  }
});
GameController = Astro.Class({
  name:'GameController',
  fields: {
    actionFactories: { // describes the full set of event action mappers that make up the interaction or game mechanics
      type:'array',
      nested:'ActionFactory'
    }
  }
});


Player = Actor.inherit({
  name:'Player'
});
Monster = Actor.inherit({
  name:'Monster'
});

PlayerSession = Astro.Class({
  name:'PlayerSession',
  fields: {
    sessionId: {
      type:'string',
      default: function() {
        return Random.id();
      }
    },
    games: {
      type: 'array',
      nested: 'Game'
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

GameContext = Astro.Class({
  name:'GameContext',
  fields: {
    size: {
      type:'object',
      nested: {
        name:'Size',
        fields:{
          x:'number',
          y:'number'
        }
      }
    }
  }
});



Games = new Mongo.Collection('games');

GameState = Astro.Class({
  name:'GameState',
  fields: {
    cellStates: {
      type:'array',
      nested:'CellState'
    },
    monsterStates: {
      type:'array',
      nested:'MonsterState'
    },
    playerStates: {
      type:'array',
      nested:'PlayerState'
    }
  }
});

Game = Astro.Class({ // a game holds all info of a game such as number of rounds played , points, wins , etc
  name:'Game',
  collection: Games,
  fields: {
    gameContext: { // A game has a single board and a board is associated with a single game
      type:'object',
      nested:'GameContext'
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

//// 
/*
Board = Astro.Class({
  name:'Board',
  fields: {
    size: {
      type:'object',
      nested: {
        name:'Size',
        fields:{
          x:'number',
          y:'number'
        }
      }
    },
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
*/


