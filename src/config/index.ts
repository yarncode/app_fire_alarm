export interface PayloadConfigEnv {
  server: {
    hostName: string;
    apiPort: number;
    entryPath: string;
    apiVersion: string;
  };
}
export type ENV_APP = 'dev' | 'pro';
export const CONFIG_ENV: ENV_APP = 'dev';
export const main_config: { [key in ENV_APP]: PayloadConfigEnv } = {
  dev: {
    server: {
      hostName: 'localhost',
      apiPort: 3300,
      entryPath: 'api',
      apiVersion: 'v1',
    },
  },
  pro: {
    server: {
      hostName: 'localhost',
      apiPort: 3300,
      entryPath: 'api',
      apiVersion: 'v1',
    },
  },
};
