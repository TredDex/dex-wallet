import { createConfig, http } from "wagmi";
import { bsc, bscTestnet } from "./chains";

export const wagmiConfig = createConfig({
  chains: [bsc, bscTestnet],
  transports: {
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
  },
});
