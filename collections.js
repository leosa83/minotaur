Boards = new Mongo.Collection('boards');

Players = new Mongo.Collection('players');

Player = Astro.Class({
  name:'Player',
  collection: Players,
  fields: {
    name:'string',
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

PlayerSessions = new Mongo.Collection('playerSessions');

PlayerSession = Astro.Class({
  name:'PlayerSession',
  fields: {
    sessionId:'string',
    boards: {
      type: 'array',
      nested: 'Board'
    }
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
  collection: Boards,
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
        name:'State',
        timeStamp: 'date',
        fields: {
          cells: {
            type:'array',
            nested: {
              name: 'Cell',
              fields: {
                players: {
                  type: 'array',
                  nested: {
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

