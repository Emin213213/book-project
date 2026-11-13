export class InvalidConfigurationException extends Error {
  constructor(variableName: string, requirement: string) {
    super(`Configuration Error: ${variableName} ${requirement}`);
    this.name = this.constructor.name;
  }
}
