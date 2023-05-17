export type GCloudIpRanges = {
  syncToken: string;
  creationTime: string;
  prefixes: {
    ipv4Prefix?: string;
    ipv6Prefix?: string;
    service: string;
    scope: string;
  }[];
};
