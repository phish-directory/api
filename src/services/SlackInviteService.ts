import { db } from "../utils/db";
import { users } from "../db/schema";
import { eq, isNull } from "drizzle-orm";
import { inviteToSlack } from "../func/slackInvite";
import postmark from "../utils/postmark";

type InviteResult = {
  email: string;
  name: string;
  status: "success" | "failed" | "error";
  error?: string;
};

export class SlackInviteService {
  static async inviteUninvitedUsers() {
    try {
      // Get all users who haven't been invited to Slack
      const uninvitedUsers = await db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
        })
        .from(users)
        .where(
          eq(users.invitedToSlack, false) && 
          isNull(users.deleted_at)
        );

      if (uninvitedUsers.length === 0) {
        return;
      }

      const inviteResults: InviteResult[] = [];

      // Process each uninvited user
      for (const user of uninvitedUsers) {
        try {
          const response = await inviteToSlack(user.email);
          
          if (response.success) {
            // Update the user's invitedToSlack status
            await db
              .update(users)
              .set({ invitedToSlack: true })
              .where(eq(users.id, user.id));

            inviteResults.push({
              email: user.email,
              name: `${user.firstName} ${user.lastName}`,
              status: "success"
            });
          } else {
            inviteResults.push({
              email: user.email,
              name: `${user.firstName} ${user.lastName}`,
              status: "failed",
              error: response.data.error
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          inviteResults.push({
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            status: "error",
            error: errorMessage
          });
        }
      }

      // Send report email
      if (inviteResults.length > 0) {
        const successfulInvites = inviteResults.filter(r => r.status === "success");
        const failedInvites = inviteResults.filter(r => r.status !== "success");

        const htmlContent = `
          <h1>Slack Invite Batch Report</h1>
          <p>Total users processed: ${inviteResults.length}</p>
          <p>Successful invites: ${successfulInvites.length}</p>
          <p>Failed invites: ${failedInvites.length}</p>

          ${successfulInvites.length > 0 ? `
            <h2>Successful Invites:</h2>
            <ul>
              ${successfulInvites.map(r => `<li>${r.name} (${r.email})</li>`).join("")}
            </ul>
          ` : ""}

          ${failedInvites.length > 0 ? `
            <h2>Failed Invites:</h2>
            <ul>
              ${failedInvites.map(r => `<li>${r.name} (${r.email}) - Error: ${r.error || 'Unknown error'}</li>`).join("")}
            </ul>
          ` : ""}
        `;

        await postmark.sendEmail({
          From: "bot@phish.directory",
          To: "jasper.mayone@phish.directory",
          Subject: `Slack Invite Batch Report - ${inviteResults.length} Users Processed`,
          HtmlBody: htmlContent,
          MessageStream: "api-transactional"
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error in SlackInviteService.inviteUninvitedUsers:", error);
      
      // Send error notification
      await postmark.sendEmail({
        From: "bot@phish.directory",
        To: "jasper@phish.directory",
        Subject: "Error in Slack Invite Service",
        TextBody: `An error occurred while processing uninvited users: ${errorMessage}`,
        MessageStream: "api-transactional"
      });
    }
  }
}
