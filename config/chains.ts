import {
  bsc,
  bscTestnet,
} from "wagmi/chains";

export const supportedChains = [
  bsc,
  bscTestnet,
] as const;

export { bsc, bscTestnet };
