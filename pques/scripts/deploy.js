import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying ProofOfPrompt...");

  const ProofOfPrompt = await hre.ethers.getContractFactory("ProofOfPrompt");
  const pop = await ProofOfPrompt.deploy();

  await pop.waitForDeployment();

  const address = await pop.getAddress();

  console.log("✅ ProofOfPrompt deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});