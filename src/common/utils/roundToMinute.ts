import { type UTCTimestamp } from "lightweight-charts";

export function roundToMinute(time: string | number): UTCTimestamp {
  const timestamp = typeof time === "string" ? Date.parse(time) / 1000 : time;
  return (Math.floor(timestamp / 60) * 60) as UTCTimestamp;
}
