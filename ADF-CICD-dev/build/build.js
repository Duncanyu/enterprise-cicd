const path = require("path");
const { buildFactory } = require("@microsoft/azure-data-factory-utilities");

const factoryPath = path.resolve(__dirname, ".."); // one level up
const exportPath = path.resolve(__dirname, "./ExportedArmTemplate");

const options = {
  factory: {
    name: "edpypfadfdev",
    resourceId: "/subscriptions/<your-subscription-id>/resourceGroups/adf-cicd/providers/Microsoft.DataFactory/factories/edpypfadfdev",
  },
  exportFolder: exportPath,
};

buildFactory(factoryPath, options)
  .then(() => console.log("✅ Export complete. Files saved to ExportedArmTemplate folder."))
  .catch((err) => console.error("❌ Build failed:", err));
