import { SERVERS } from '../config/constants.js';

const getMemberLogId = (guildId) => {
  const server = Object.values(SERVERS).find(({ id }) => id === guildId);

  return server?.channels?.memberLog.id ?? undefined;
};

// eslint-disable-next-line import/prefer-default-export
export { getMemberLogId };
