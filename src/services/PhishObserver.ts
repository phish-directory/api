import axios, { AxiosError } from "axios";
import { getDbDomain } from "../functions/db/getDbDomain";
import { prisma } from "../prisma";
import { headersWithPhishObserver } from "../utils/headers";
import { sanitizeDomain } from "../utils/sanitizeDomain";

interface PhishObserverError {
  error: string;
  details?: string;
}

interface SubmissionResponse {
  id: string;
  [key: string]: any;
}

/**
 * A service that provides access to the PhishObserver service for checking and reporting domains.
 */
export class PhishObserverService {
  private readonly baseUrl = "https://phish.observer/api";

  domain = {
    /**
     * Asynchronously checks a given domain against the PhishObserver service for any known bad domains.
     *
     * @param {string} domain - The domain name to be checked.
     * @returns {Promise<any>} The search response data or an error object
     */
    check: async (domain: string) => {
      // metrics.increment("services.phishobserver.domain.check");

      const sanitizedDomain = sanitizeDomain(domain);

      try {
        // Submit the domain for checking
        const submissionResponse = await axios.post<SubmissionResponse>(
          `${this.baseUrl}/submit`,
          {
            url: `https://${sanitizedDomain}`,
            tags: ["phish.directory"],
          },
          { headers: headersWithPhishObserver }
        );

        // Get the submission details
        const searchResponse = await axios.get(
          `${this.baseUrl}/submission/${submissionResponse.data.id}`,
          { headers: headersWithPhishObserver }
        );

        // Store the response in the database
        const dbDomain = await getDbDomain(sanitizedDomain);
        await prisma.rawAPIData.create({
          data: {
            sourceAPI: "PhishObserver",
            domain: {
              connect: {
                id: dbDomain.id,
              },
            },
            data: searchResponse.data,
          },
        });

        return searchResponse.data;
      } catch (error) {
        if (error instanceof AxiosError && error.response) {
          const { status, data } = error.response;

          // Handle known error cases
          if (status === 400) {
            const errorResponse: PhishObserverError = {
              error: data.error || "Bad Request",
              details: data.message || data.details,
            };

            if (data.error === "Blocked domain") {
              return errorResponse;
            }

            // Handle rate limiting
            if (data.error === "Too Many Requests") {
              return {
                error: "Rate limited",
                details: "Too many requests to PhishObserver API",
              };
            }

            return errorResponse;
          }

          // Handle authentication errors
          if (status === 401) {
            return {
              error: "Authentication failed",
              details: "Invalid or expired API key",
            };
          }

          // Handle server errors
          if (status >= 500) {
            return {
              error: "Server error",
              details: "PhishObserver service is currently unavailable",
            };
          }
        }

        // Handle network errors or other unexpected issues
        return {
          error: "Unknown error",
          details:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
        };
      }
    },
  };
}
