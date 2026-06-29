import axios from 'axios';
import { codeBlock } from 'discord.js';
import EasyTable from 'easy-table';
import { dmmItems, leaguesItems } from '../config/runescape-items.js';
import { formatLongNumber } from '../utils/text.js';

const userAgent = 'hahabot discord bot by @yungando';
const maxDiscordMessageLength = 1980;

const itemSets = [
  { name: 'deadman', itemSet: dmmItems },
  { name: 'leagues', itemSet: leaguesItems },
];

const getLatestPrices = async () => {
  const res = await axios.get(
    'https://prices.runescape.wiki/api/v1/osrs/latest',
    {
      headers: { 'User-Agent': userAgent },
    },
  );

  return res.data.data;
};

const filterPrices = (allPrices, itemSet) => {
  const filteredPrices = itemSet.map((item) => ({ ...allPrices[item.id], ...item }));

  return filteredPrices.filter((item) => item.low > 0);
};

const calculateGpPerPoint = (itemPrices) => (
  itemPrices.map((item) => {
    const gpPerPoint = item.low / item.pointCost;

    return { ...item, gpPerPoint };
  })
);

const truncateTable = (pricesTable) => {
  if (pricesTable.length < maxDiscordMessageLength) return pricesTable;

  const slicedTable = pricesTable.slice(0, maxDiscordMessageLength);
  const lastNewline = slicedTable.lastIndexOf('\n');
  if (lastNewline === -1) return slicedTable;

  return slicedTable.slice(0, lastNewline);
};

const createPricesTable = (itemSetName, items) => {
  const pricesTable = new EasyTable();

  items.forEach((item) => {
    pricesTable.cell('Item', item.name);
    pricesTable.cell('Point cost', formatLongNumber(item.pointCost));
    pricesTable.cell('GE price', formatLongNumber(item.low));
    pricesTable.cell('GP per point', item.gpPerPoint.toFixed(2));
    pricesTable.newRow();
  });

  return truncateTable(pricesTable.toString());
};

const handleRunelitePrices = async (itemSetName) => {
  const allPrices = await getLatestPrices();

  const { itemSet } = itemSets.find((set) => set.name === itemSetName);

  const itemPrices = filterPrices(allPrices, itemSet);
  const itemGpPerPoint = calculateGpPerPoint(itemPrices);
  const sortedItems = itemGpPerPoint.toSorted((a, b) => b.gpPerPoint - a.gpPerPoint);

  const pricesTable = createPricesTable(itemSetName, sortedItems);

  return codeBlock(pricesTable);
};

export default handleRunelitePrices;
