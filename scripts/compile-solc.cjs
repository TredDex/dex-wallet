const fs = require("fs");
const path = require("path");
const solc = require("solc");

const ROOT = process.cwd();
const CONTRACTS_DIR = path.join(ROOT, "contracts");
const ARTIFACTS_DIR = path.join(ROOT, "artifacts", "contracts");

function findImports(importPath) {
  const candidates = [
    path.join(ROOT, importPath),
    path.join(ROOT, "node_modules", importPath),
  ];

  for (const file of candidates) {
    if (fs.existsSync(file)) {
      return {
        contents: fs.readFileSync(file, "utf8"),
      };
    }
  }

  return {
    error: `File not found: ${importPath}`,
  };
}

function collectSolidityFiles(dir) {
  const result = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      result.push(...collectSolidityFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(".sol")) {
      result.push(full);
    }
  }

  return result;
}

const files = collectSolidityFiles(CONTRACTS_DIR);

if (files.length === 0) {
  console.error("No Solidity contracts found.");
  process.exit(1);
}

const sources = {};

for (const file of files) {
  const relative = path.relative(ROOT, file).split(path.sep).join("/");
  sources[relative] = {
    content: fs.readFileSync(file, "utf8"),
  };
}

const input = {
  language: "Solidity",
  sources,
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
    outputSelection: {
      "*": {
        "*": [
          "abi",
          "evm.bytecode",
          "evm.deployedBytecode",
          "metadata",
          "storageLayout",
        ],
      },
    },
  },
};

console.log("========================================");
console.log("DEX WALLET PORTABLE SOLIDITY COMPILER");
console.log("========================================");
console.log("solc:", solc.version());
console.log("");

const output = JSON.parse(
  solc.compile(JSON.stringify(input), { import: findImports })
);

if (output.errors) {
  let fatal = false;

  for (const error of output.errors) {
    console.error(error.formattedMessage);

    if (error.severity === "error") {
      fatal = true;
    }
  }

  if (fatal) {
    console.error("\nCompilation failed.");
    process.exit(1);
  }
}

let compiled = 0;

for (const [sourceName, contracts] of Object.entries(output.contracts || {})) {
  for (const [contractName, contract] of Object.entries(contracts)) {
    const outputDir = path.join(
      ROOT,
      "artifacts",
      "contracts",
      path.dirname(sourceName)
    );

    fs.mkdirSync(outputDir, { recursive: true });

    const artifact = {
      _format: "hh-sol-artifact-1",
      contractName,
      sourceName,
      abi: contract.abi,
      bytecode: "0x" + (contract.evm.bytecode.object || ""),
      deployedBytecode:
        "0x" + (contract.evm.deployedBytecode.object || ""),
      linkReferences: contract.evm.bytecode.linkReferences || {},
      deployedLinkReferences:
        contract.evm.deployedBytecode.linkReferences || {},
    };

    const artifactPath = path.join(
      outputDir,
      `${contractName}.json`
    );

    fs.writeFileSync(
      artifactPath,
      JSON.stringify(artifact, null, 2) + "\n"
    );

    console.log(`✓ ${sourceName}:${contractName}`);
    console.log(`  → ${path.relative(ROOT, artifactPath)}`);

    compiled++;
  }
}

if (compiled === 0) {
  console.error("No contracts were compiled.");
  process.exit(1);
}

console.log("");
console.log(`✓ Successfully compiled ${compiled} contract(s).`);
