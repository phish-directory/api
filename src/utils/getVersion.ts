export function getVersion() {
  const packageJson = require("../../package.json");
  return packageJson.version;
}

export function getPackageVersion(packageName: string) {
  const packageJson = require("../../package.json");
  return packageJson.dependencies[packageName];
}
