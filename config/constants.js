const SERVERS = Object.freeze({
  pollo: {
    id: '534915212760055819',
    channels: {
      memberLog: { id: '534918740173783050' },
      noContext: { id: '1247871597080084490' },
    },
    categories: {
      games: { id: '785540936457125888' },
      archivedGames: { id: '917120901584150589' },
      retiredThreads: { id: '562373109555134496' },
    },
    roles: {
      nitro: {
        id: '585548115243696170',
      },
    },
  },
  hahabot: {
    id: '568227296767639552',
    memberLog: { id: '568230745252954115' },
  },
  mariachi: {
    id: '358046343803174912',
    memberLog: { id: '502159525932171275' },
  },
  gang: {
    id: '480131488764133399',
    memberLog: '480155424037797898',
  },
});

const EMOJI = Object.freeze({
  upvote: { id: '594816363722309645' },
  downvote: { id: '594816363533565991' },
  salute: {
    id: '719485363558809600',
    text: '<:salute:719485363558809600>',
  },
});

export { EMOJI, SERVERS };
