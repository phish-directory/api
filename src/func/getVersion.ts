import packageJson from "../../package.json";

export function getVersion(): string {
  return packageJson.version;
}

export function getPackageVersion(packageName: string): string | undefined {
  return packageJson.dependencies?.[packageName];
}
