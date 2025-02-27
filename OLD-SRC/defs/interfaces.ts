/**
 * Interface for domain check response
 */
export interface DomainCheckResponse {
  domain: string;
  phishing: boolean;
  times: {
    createdAt: Date;
    updatedAt: Date;
    lastChecked: Date | null;
  };
  rawData?: any[]; // Optional property for extended data
}
