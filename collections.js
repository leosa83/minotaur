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
    },
    moves:'number'
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
CellState = State.inherit({
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
    },
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

AIBehavior = Astro.Class({ //TODO: fix the ai
  name:'AIController',
  fields: {
    library: {
      type:'object',
      nested: {
        name:'behaviors',
        fields: {
          algorithms: {
            type:'object',
            nested: {
              name:'Algorithms',
              fields: {
                closestPositionsByDimension: function(from,positions,dimension) {
                  //find the closest players in a dimension
                  var dxys = _.map(positions,function(position,index,list){
                    return {position:position,dxy:Math.abs(this.from[dimension]-position[dimension])};
                  },{from:from});
                  
                  //return position = positions[_.indexOf(dxys,_.min(dxys))]
                  //return _.filter(dxys,function(dxy) {return dxy = this.min;},{min:_.min(dxys)});
                  return _.map(positions,function(position,index,list){
                    return list[]
                  },{dxys:dxys})
                }
              }
            }
          },
          classicTheseusMoveDirection:function(from,positions) {
            //returns left , right , up, down , null
            var target;
            //check which position i closest in x
            var closestx = this.algorithms.closestPositionsByDimension(from,positions,'x');
            
            if(closestx.length>1) {
              //check which closest by y
              var closesty = _.map(this.algorithms.closestPositionsByDimension(from,positions,'y'),function(closestindex,index,array){
                return this.positions[closestindex];
              },{positions:positions});
              
              if(closesty.length>1) {
                //choose the first in x
                target = positions[closestx[0]];
              }
            }
            
            //calculate the direction
            const dx = target.x-from.x < 0 ? -1: target.x-from.x >= 1 ? 1: 0;
            const dy = target.y-from.y < 0 ? -1: target.y-from.y >= 1 ? 1: 0;
            
            // x moves are prio
            return dx < 0 ? 'left': dx > 0 ? 'right' : dy < 0 ? 'up': dy > 0 ? 'down' : null;  
          }
        }
      }
    }
  }
});
  Actors = Mongo.Collection('actors');
  Actor = GameObject.inherit({
  name:'Actor',
  collection:'Actors',
  fields: {
    actorIndex:'number',
    gameController: {
      type:'object',
      nested:'GameController'
    },
    move: function(sessionId,controllerId,direction) {
      this.gameController.move(this,direction);
    },
    operate:function(sessionId,controllerId,operation,position) {
      if(this.sessionController[sessionId==controllerId]) {
        this.gameController.operate(this,operations,position);
      }
      else {
        console.log('this session doesnt have the correct controller registered');
      }
    },
    defaultMoves:'number',
    //controllers allowd to control this actor
    controllers: {
      type:'array',
      nested:'string'
    }
  }
});
ActorController = Astro.Class({
  name:'ActorController',
  fields: {
    move: function(gameSession,direction) {
      //check if the sessionid is ok
      var game = gameSession.game;
      var gameState = game.gameState;
      var actor = game
      
      //move the actor passing this
      this.actor.move(this,direction);
    },
    sessionIds: {
      type:'array',
      nested:'string'
    },
    registerSession: function(sessionId,controllerId) {
      if(this.sessionController==null) {
        //check if the controller id is registered
        if(true){}
        //register the session controller
        this.sessionController[sessionId] = controllerId;        
      }
      else {
        console.log('controller for this session already registered, create a new controller');
      }
    }
  }
});
AIController = ActorController.inherit({
  name:'AIController',
  fields: {
    behavior: {
      type:'object',
      nested:'AIBehavior'
    }
  }
});

MonsterState = ActorState.inherit({
  name:'MonsterState',
  fields: {
    berserk:'boolean',
  }
});

GameController = Astro.Class({
  name:'GameController',
  fields: {
    move:function(gameSession,actor,direction) {
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
        var thecell = _.find(this.game.gameState.cellStates,function(cellstate,index,cellStates) {
          return cellstate.position.x==this.from.x && cellstate.position.y==this.from.y && _.indexOf(cellstate.walls,this.direction)<0; //if found and the cell doesnt have a wall in the direction of the move
        },{thecell:thecell,from:from,direction:direction});
        
        if(thecell==undefined) {
          nextState.position.x +=dx;
          nextState.position.y +=dy;
          actor.changeState = true;
          actor.nextState=nextState;
        }
        else {
          actor.changeState = false;
        }
      }
      else {
        // actor is a cell, a cell cant move
        console.log('Cells are imovable: you are trying to move cell: \n'+actor.toString());
      }
    },
    validators: {
      actor: function() {
        this.actor.validate();
      },
      game: function() {
        this.game.validate();
      }
    }
  }
});

Cell = Actor.inherit({
  name:'Cell',
  states: {
    type:'array',
    nested:'Cellstate'
  }
});
Player = Actor.inherit({
  name:'Player',
  states: {
    type:'array',
    nested:'PlayerState'
  }
});
Monster = Actor.inherit({
  name:'Monster',
  states: {
    type:'array',
    nested:'MonsterState'
  }
});
GameSessions = Mongo.Collection('gameSessions');
GameSession = Astro.Class({
  name:'GameSession',
  collection:GameSessions,
  fields: {
    user: {
      type:'object',
      nested:'User'
    },
    game: {
      type:'object',
      nested:'Game'
    },
    sessionId: {
      type:'string',
      default: function() {
        return Random.id();
      }
    },
    // if set then overrides the nickName of any userprofile associated with this session
    nickName: 'string',
  }
});


UserProfile = Astro.Class({
  name:'UserProfile',
  fields: {
    nickname: 'string',
    userSessions: {
      type:'array',
      nested:'GameSession'
    },
    gamesPlayed: {
      type:'array',
      nested:'Game',
      transient:true,
      default: function() {
        _.map(this.userSession,function(session,index,sessions){
          return _.map(session.gameSessions,function(gameSession,index,gameSessions){
            return gameSession.game;
          });
        });
      }
    }
  }
});





GameState = Astro.Class({
  name:'GameState',
  fields: {
    context: {
      type:'object',
      nested: {
        name:'Context',
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
          turn: 'number'
        }
      }
    },
    actors: {
      type:'array',
      nested:'Actor'
    },
    cells: {
      type:'array',
      nested:'Cell',
      default:function() {
        
      }
    },
    init:function() {
      this.actors[0] = new Monster();
      this.actors[1] = new Player();
    }
  }
});

Games = new Mongo.Collection('games');

Game = Astro.Class({ // a game holds all info of a game such as number of rounds played , points, wins , etc
  name:'Game',
  collection: Games,
  fields: {
    createdAt: 'date',
    owner: {
      type:'object',
      nested:'UserProfile'
    },
    gameSessions:{
      type:'array',
      nested:'GameSession'
    },
    registerSession: function(gameSession) {
      this.gameSessions.push(gameSession);
      return this.gameSessions.length-1; //actor index
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


