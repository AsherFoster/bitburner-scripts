function getProfit(prices: number[], trades: number[]): number {
  let profit = 0;
  // trades is alternating buy/sell
  for (let trade = 0; trade < trades.length; trade += 2) {
    // profit = sell - buy
    profit += prices[trades[trade + 1]] - prices[trades[trade]];
  }
  return profit;
}

function findBestTrade(prices: number[], currentTrades: number[], tradesLeft: number): number[] {
  // At the high end, for each next step, pick the best one
  // At the low end, calculate the best final step, and return it
  let bestTrade: number[] = [];
  let bestProfit = 0;

  if (currentTrades.length % 2 === 0) {
    bestTrade = currentTrades;
    bestProfit = getProfit(prices, currentTrades);
  }
  // for every option after the last trade
  for (let opt = currentTrades.length ? currentTrades[currentTrades.length - 1] + 1 : 0; opt < prices.length; opt++) {
    const testTrade = currentTrades.concat(opt);
    const fullTrades = tradesLeft > 1 ? findBestTrade(prices, testTrade, tradesLeft - 1) : testTrade;
    const profit = getProfit(prices, fullTrades);
    if (profit > bestProfit) {
      bestProfit = profit;
      bestTrade = fullTrades;
    }
  }

  return bestTrade;
}

export const traderI = {
  type: 'Algorithmic Stock Trader I',
  description: /profit you can earn using at most one transaction/,
  solve(prices: number[]) {
    const bestTrade = findBestTrade(prices, [], 2); // probably expensive to compute but hey, it's easy

    return getProfit(prices, bestTrade);
  }
};

export const traderII = {
  type: 'Algorithmic Stock Trader II',
  description: /maximum possible profit you can earn using as many transactions as you'd like/,
  solve(prices: number[]) {
    const bestTrade = findBestTrade(prices, [], prices.length); // probably expensive to compute but hey, it's easy

    return getProfit(prices, bestTrade);
  }
};


export const traderIII = {
  type: 'Algorithmic Stock Trader III',
  description: /you can earn using at most two transactions/, // assert that some key rules don't change
  solve(prices: number[]) {
    const TRADE_COUNT = 2;

    // TRADE_COUNT * 2 because this fn picks buys/sells individually
    const bestTrade = findBestTrade(prices, [], TRADE_COUNT * 2);

    return getProfit(prices, bestTrade);
  }
};
