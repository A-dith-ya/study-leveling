import { CoinPackInfo } from "../types/storeTypes";

export const COIN_PACK_INFO: Record<string, CoinPackInfo> = {
  starter_pack: {
    identifier: "starter_pack",
    coinAmount: 200,
    title: "200 Coins",
  },
  pro_pack: { identifier: "pro_pack", coinAmount: 400, title: "400 Coins" },
  ultimate_pack: {
    identifier: "ultimate_pack",
    coinAmount: 800,
    title: "800 Coins",
  },
};
