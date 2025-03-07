export async function inviteToSlack(email: string) {
  const xoxc = process.env.SLACK_BROWSER_TOKEN!;
  const xoxd = process.env.SLACK_COOKIE!;

  const payload = `------WebKitFormBoundaryIk2wxHLsyrGnUA6A
Content-Disposition: form-data; name="token"

${xoxc}
------WebKitFormBoundaryIk2wxHLsyrGnUA6A
Content-Disposition: form-data; name="invites"

[{"email":"${email}","type":"regular","mode":"manual"}]
------WebKitFormBoundaryIk2wxHLsyrGnUA6A
Content-Disposition: form-data; name="team_id"

T07J9QT2P8R
------WebKitFormBoundaryIk2wxHLsyrGnUA6A
Content-Disposition: form-data; name="restricted"

false
------WebKitFormBoundaryIk2wxHLsyrGnUA6A
Content-Disposition: form-data; name="ultra_restricted"

false
------WebKitFormBoundaryIk2wxHLsyrGnUA6A
Content-Disposition: form-data; name="campaign"

team_menu
------WebKitFormBoundaryIk2wxHLsyrGnUA6A
Content-Disposition: form-data; name="_x_reason"

submit-invite-to-workspace-invites
------WebKitFormBoundaryIk2wxHLsyrGnUA6A
Content-Disposition: form-data; name="_x_mode"

online
------WebKitFormBoundaryIk2wxHLsyrGnUA6A
Content-Disposition: form-data; name="_x_sonic"

true
------WebKitFormBoundaryIk2wxHLsyrGnUA6A
Content-Disposition: form-data; name="_x_app_name"

client
------WebKitFormBoundaryIk2wxHLsyrGnUA6A--`;

  let result;

  try {
    const data = await fetch(
      "https://phishdirectory.slack.com/api/users.admin.inviteBulk",
      {
        headers: {
          "content-type":
            "multipart/form-data; boundary=----WebKitFormBoundaryIk2wxHLsyrGnUA6A",
        },
        referrerPolicy: "no-referrer",
        body: payload,
        method: "POST",
        mode: "cors",
        credentials: "include",
      }
    );

    result = data.ok;
  } catch (e) {
    console.error(e);
    result = false;
  }

  return result;
}
