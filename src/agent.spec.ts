import {
  TransactionEvent,
  HandleTransaction,
  EventType,
  Network,
} from "forta-agent";
import { provideTransactionHandler, createFinding } from "./agent";
import { BLACKLISTED_ADDRS } from "./utils";

describe("Detect transaction involving blacklisted addresse", () => {
  let handleTransaction: HandleTransaction;
  const createTxEvent = (addressesInvolved: { [key: string]: boolean }) => {
    const tx = {} as any;
    const receipt = {} as any;
    const block = {} as any;
    const addresses = addressesInvolved as any;
    return new TransactionEvent(
      EventType.BLOCK,
      Network.MAINNET,
      tx,
      receipt,
      [],
      addresses,
      block
    );
  };

  beforeAll(() => {
    handleTransaction = provideTransactionHandler(BLACKLISTED_ADDRS);
  });

  it("returns empty findings if there are not blacklisted addresses involved", async () => {
    const addressesInvolved: { [key: string]: boolean } = {
      "0x111111": true,
      "0x141414": true,
    };

    const txEvent = createTxEvent(addressesInvolved);

    const findings = await handleTransaction(txEvent);

    expect(findings).toStrictEqual([]);
  });

  it("returns a finding if a blacklisted address is involved", async () => {
    const addressesInvolved: { [key: string]: boolean } = {
      "0x111111": true,
      [BLACKLISTED_ADDRS[0]]: true,
    };
    const txEvent = createTxEvent(addressesInvolved);

    const findings = await handleTransaction(txEvent);

    expect(findings).toStrictEqual([createFinding(BLACKLISTED_ADDRS[0])]);
  });

  it("returns a finding if multiple blacklisted addresses are involved", async () => {
    const addressesInvolved: { [key: string]: boolean } = {
      [BLACKLISTED_ADDRS[0]]: true,
      [BLACKLISTED_ADDRS[1]]: true,
      [BLACKLISTED_ADDRS[2]]: true,
    };
    const txEvent = createTxEvent(addressesInvolved);

    const findings = await handleTransaction(txEvent);

    expect(findings).toStrictEqual(
      Object.keys(addressesInvolved).map(createFinding)
    );
  });
});
