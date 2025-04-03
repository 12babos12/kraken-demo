import {
  type UTCTimestamp,
  type CandlestickData,
  type WhitespaceData,
  type Time,
} from "lightweight-charts";

const convertTimeToTimestamp = (time: Time | undefined) =>
  (time ?? 0) as UTCTimestamp;

export const calcMaSeriesData = (
  candleData: CandlestickData[],
  maLength: number
) => {
  const maData = [];

  for (let i = 0; i < candleData.length; i++) {
    if (i < maLength) {
      maData.push({
        time: convertTimeToTimestamp(candleData[i]?.time),
      });
    } else {
      let sum = 0;
      for (let j = 0; j < maLength; j++) {
        sum += candleData[i - j]?.close ?? 0;
      }
      const maValue = sum / maLength;
      maData.push({
        time: convertTimeToTimestamp(candleData[i]?.time),
        value: maValue,
      });
    }
  }

  return maData;
};

export const calcMaLastDataPoint = (
  candles: (WhitespaceData<Time> | CandlestickData<Time>)[],
  maLength: number
) => {
  const candleData = candles.filter(
    (c): c is CandlestickData<Time> => "close" in c
  );
  if (candleData.length < maLength) return null;
  const lastSlice = candleData.slice(-maLength);
  const sum = lastSlice.reduce((acc, c) => acc + c.close, 0);
  return {
    time: convertTimeToTimestamp(lastSlice[maLength - 1]?.time),
    value: sum / maLength,
  };
};
