import type { EncodeObject } from "@cosmjs/proto-signing";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { GasPrice, SigningStargateClient } from "@cosmjs/stargate";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";

const addresses = {
  griko_nibras: `cosmos1kpzxx2lxg05xxn8mfygrerhmkj0ypn8edmu2pu`,
  kikiding: `cosmos1g3jjhgkyf36pjhe7u5cw8j9u6cgl8x929ej430`,
  asaadam: `cosmos1q7u2wv5rmzphm53cww42ydcrsgjp7he8u3f85f`,
};

const run = async () => {
  // https://github.com/cosmos/chain-registry/blob/master/cosmoshub/chain.json
  const chainId = "cosmoshub-4";
  const rpcEndpoint = "https://rpc.cosmos.directory/cosmoshub";
  const bech32Prefix = "cosmos";

  const mnemonic = process.env.MNEMONIC || raise("configure mnemonic in .env file");
  const offlineSigner = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: bech32Prefix });

  const accounts = await offlineSigner.getAccounts();
  const account = accounts[0] || raise("no account found");

  const signingClient = await SigningStargateClient.connectWithSigner(rpcEndpoint, offlineSigner, {
    gasPrice: GasPrice.fromString("0.025uatom"),
  });

  const sendTokenPayload = MsgSend.fromPartial({
    fromAddress: account.address,
    toAddress: addresses.griko_nibras,
    amount: [{ amount: "10000", denom: "uatom" }],
  });

  const encodedSendTokenPayload = MsgSend.encode(sendTokenPayload).finish();

  const messagesToSend: EncodeObject[] = [
    {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: encodedSendTokenPayload,
    },
  ];

  const response = await signingClient.signAndBroadcast(account.address, messagesToSend, "auto");

  console.log(response);
};

const raise = (message?: string): never => {
  throw new Error(message);
};

void run();
