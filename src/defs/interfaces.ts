/**
 * Interface for domain check response
 */
export interface DomainCheckResponse {
  domain: string;
  phishing: boolean;
  times: {
    created_at: Date;
    updated_at: Date;
    last_checked: Date | null;
  };
  rawData?: any[]; // Optional property for extended data
}
