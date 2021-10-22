import { ethers } from "ethers";
import {
  Finding,
  FindingSeverity,
  FindingType,
  getJsonRpcUrl,
  TransactionEvent,
} from "forta-agent";
import { BLACKLISTED_ADDRS, COMPTROLLER_ABI, COMPTROLLER_ADDR } from "./utils";

export const createFinding = (blacklistedAddr: string) =>
  Finding.fromObject({
    name: "Blacklisted Addr interacted with Compound",
    description: `Detect interaction of blacklisted address with Compound Protocol`,
    alertId: "COMPOUND_BLACKLIST",
    severity: FindingSeverity.Critical,
    type: FindingType.Suspicious,
    metadata: {
      Addresses: JSON.stringify(blacklistedAddr),
    },
  });

export const provideTransactionHandler = (blacklist: string[]) => {
  const provider = new ethers.providers.JsonRpcProvider(getJsonRpcUrl());
  const comptroller = new ethers.Contract(
    COMPTROLLER_ADDR,
    COMPTROLLER_ABI,
    provider
  );

  return async (txEvent: TransactionEvent) => {
    const ctokenAddrs: [string] = await comptroller.getAllMarkets({
      blockTag: txEvent.blockNumber,
    });
    const compoundAddrs = [COMPTROLLER_ADDR, ...ctokenAddrs]

    if (txEvent.to && !(txEvent.to in compoundAddrs)) return [];

    return blacklist
      .filter((addr) => txEvent.addresses[addr])
      .map(createFinding);
  };
};

export default {
  handleTransaction: provideTransactionHandler(BLACKLISTED_ADDRS),
};
