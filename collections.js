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
    },
    nextState: {
      type:'object',
      nested:'State'
    },
    changeState:'boolean'
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
//todo fix the walls
CellState = ActorState.inherit({
  name:'CellState',
  fields: {
    walls: {
      type:'array',
      nested: {
        type:'Wall',
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

Actor = GameObject.inherit({
  name:'Actor',
  fields: {
    gameController: {
      type:'object',
      nested:'GameController'
    },
    move: function(direction) {
      this.GameController.move(this,direction);
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

GameController = Astro.Class({
  name:'GameController',
  fields: {
    game: {
      type:'object',
      nested:'Game'
    },
    move:function(actor,direction,gameState) {
      var from = actor.state.position;
      //only players and monsters can move
      if(!(actor instanceof Cell)) {
        //distance can only be 1 and only in one direction
        let dx = 0;
        let dy = 0;
        switch(direction) {
          case 'up':
            dy=-1;
            break;
          case 'down':
            dy=1;
            break;
          case 'left':
            dx=-1;
            break;
          case 'right':
            dx=1;
            break;
        }
        var nextState =  _.extend({},actor.state);
        nextState.position.x +=dx;
        nextState.position.y +=dy;
        
        //find the cellstate with this position
        var thecell = {};
        _.each(this.game.gameState.cellStates,function(cellstate,index,cellStates) {
          if(cellstate.position.x==this.from.x && cellstate.position.y==this.from.y) {
            _.find(cellstate.walls,function(wall){
              return wall==direction;
            },{direction:direction})
          } 
        },{thecell:thecell,from:from,direction:direction});
        
        
        
        
        actor.nextState=nextState;
        actor.changeState = true;
        
        
        if()
      }
      else {
        console.log('cells are imovable');
      }
    },
    validators: {
      actor: function() {
        this.actor.validate();
      }
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


