export type Config = {
  apiKey: string;
  dataDir: string;
};

let config: Config = getDefaultConfig();

function getDefaultConfig() {
  return {
    apiKey: process.env.API_KEY,
    dataDir: process.env.DATA_DIR,
  } as Config;
}

/**
 * Updates the config to the default config - one that reads from the environment variables
 */
export function reloadConfig() {
  config = getDefaultConfig();
}

/**
 * Updates the config to the new manually specified config
 * @param newConfig The new config
 */
export function setConfig(newConfig: Config) {
  // Copy config to prevent mutation
  config = {...newConfig} as Config;
}

/**
 * Returns the current config
 * @returns The current config
 */
export function getConfig(): Readonly<Config> {
  // Copy config to prevent mutation
  return config;
}
