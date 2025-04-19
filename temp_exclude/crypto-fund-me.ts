import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { CryptoFundMe } from "../target/types/crypto_fund_me";
import { expect } from "chai";

describe("crypto-fund-me", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.CryptoFundMe as Program<CryptoFundMe>;

  it("Is initialized!", async () => {
    // Add your test here
    console.log("Your test goes here!");
  });
}); 