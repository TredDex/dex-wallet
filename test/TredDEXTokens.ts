import { expect } from "chai";
import { ethers } from "hardhat";

describe("TredDEX tokens", function () {
  async function deploy() {
    const [owner, user] = await ethers.getSigners();

    const TradeUSD = await ethers.getContractFactory("TradeUSD");
    const tradeUSD = await TradeUSD.deploy(
      owner.address,
      ethers.parseUnits("1000000", 18)
    );

    const TradeToken = await ethers.getContractFactory("TradeToken");
    const trade = await TradeToken.deploy(
      owner.address,
      ethers.parseUnits("10000000000", 18)
    );

    return {
      owner,
      user,
      tradeUSD,
      trade,
    };
  }

  it("creates TRADEUSD with 18 decimals", async function () {
    const { tradeUSD } = await deploy();

    expect(await tradeUSD.decimals()).to.equal(18);
    expect(await tradeUSD.symbol()).to.equal("TRADEUSD");
  });

  it("creates TRADE with 18 decimals", async function () {
    const { trade } = await deploy();

    expect(await trade.decimals()).to.equal(18);
    expect(await trade.symbol()).to.equal("TRADE");
  });

  it("supports normal ERC20 transfers", async function () {
    const { trade, owner, user } = await deploy();

    const amount = ethers.parseUnits("100", 18);

    await trade.transfer(user.address, amount);

    expect(await trade.balanceOf(user.address)).to.equal(amount);
    expect(await trade.balanceOf(owner.address))
      .to.equal(ethers.parseUnits("9999999900", 18));
  });

  it("supports burning", async function () {
    const { trade, owner } = await deploy();

    const amount = ethers.parseUnits("100", 18);

    await trade.burn(amount);

    expect(await trade.balanceOf(owner.address))
      .to.equal(ethers.parseUnits("9999999900", 18));
  });
});
