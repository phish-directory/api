export async function inviteToSlack(email: string) {
  console.log(`Starting Slack invitation process for email: ${email}`);

  const xoxc = process.env.SLACK_BROWSER_TOKEN!;
  const xoxd = process.env.SLACK_COOKIE!;

  console.log(
    `Tokens available: SLACK_BROWSER_TOKEN ${xoxc ? "exists" : "missing"}`
  );

  if (!xoxc) {
    console.error("ERROR: SLACK_BROWSER_TOKEN is required but not provided");
    throw new Error("Missing required SLACK_BROWSER_TOKEN");
  }

  console.log("Preparing fetch request to Slack API");

  try {
    console.log("Sending invitation request to Slack API");
    const response = await fetch(
      "https://phishdirectory.slack.com/api/users.admin.inviteBulk?_x_id=60102c21-1741311043.437&_x_csid=iSfBA4IqB14&slack_route=T07J9QT2P8R&_x_version_ts=1741300354&_x_frontend_build_type=current&_x_desktop_ia=4&_x_gantry=true&fp=7c&_x_num_retries=0",
      {
        headers: {
          accept: "*/*",
          "accept-language": "en-US,en;q=0.9",
          "content-type":
            "multipart/form-data; boundary=----WebKitFormBoundaryBj3LlspRNf8aUHgB",
          priority: "u=1, i",
          "sec-ch-ua":
            '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
          cookie: `utm=%7B%7D; d-s=1741300026; b=.5116911f86b93b0f9a3dbd4d35612bf5; shown_ssb_redirect_page=1; ec=enQtODU2NDU5MDE2MTA3NS1lYjdlZmYxNDBlNTg5YjVlZDljOTZhMjRmZjUwZGZkNmM5MTk2OGYzNzVlNDQxNGUzNmUxNThkZTJlNmQ5OGI4; lc=1741300120; shown_download_ssb_modal=1; show_download_ssb_banner=1; no_download_ssb_banner=1; tz=-300; web_cache_last_updated401ea4474c52629a885b735ff1518700=1741300141348; PageCount=2; cjConsent=MHxOfDB8Tnww; cjUser=1f009cd9-8ce2-44c2-b9d0-9c2594348f17; _li_dcdm_c=.slack.com; _lc2_fpi=e00b11ac9c9b--01jnpxvr0brfn8e7tcgbavzcg9; _lc2_fpi_js=e00b11ac9c9b--01jnpxvr0brfn8e7tcgbavzcg9; optimizelySession=1741305012432; _cs_c=0; _cs_id=93230bcb-0cc5-aa12-8cc3-fac0c755e3e6.1741305012.1.1741305012.1741305012.1.1775469012461.1.x; _li_ss=CjoKBQgKEJ0aCgYI3QEQnRoKBgiJARCdGgoGCIEBEJ0aCgYIogEQnRoKCQj_____BxCnGgoGCNIBEJ0a; existing_users_hp={"launched":1741305011,"launch_count":1}; _gcl_au=1.1.612924174.1741305013; _ga=GA1.1.1572470668.1741305013; _ga_QTJQME5M5D=GS1.1.1741305012.1.0.1741305012.60.0.0; x=5116911f86b93b0f9a3dbd4d35612bf5.1741310675; OptanonConsent=isGpcEnabled=0&datestamp=Thu+Mar+06+2025+20%3A25%3A40+GMT-0500+(Eastern+Standard+Time)&version=202402.1.0&browserGpcFlag=0&isIABGlobal=false&hosts=&consentId=69ac1349-b9c2-4d5b-9d1f-24475d3d9785&interactionCount=1&isAnonUser=1&landingPath=NotLandingPage&groups=1%3A1%2C3%3A1%2C2%3A1%2C4%3A1&AwaitingReconsent=false; d=${xoxd}`,
        },
        referrerPolicy: "no-referrer",
        body: `------WebKitFormBoundaryBj3LlspRNf8aUHgB\r\nContent-Disposition: form-data; name="token"\r\n\r\n${xoxc}\r\n------WebKitFormBoundaryBj3LlspRNf8aUHgB\r\nContent-Disposition: form-data; name="invites"\r\n\r\n[{"email":"${email}","type":"regular","mode":"manual"}]\r\n------WebKitFormBoundaryBj3LlspRNf8aUHgB\r\nContent-Disposition: form-data; name="team_id"\r\n\r\nT07J9QT2P8R\r\n------WebKitFormBoundaryBj3LlspRNf8aUHgB\r\nContent-Disposition: form-data; name="restricted"\r\n\r\nfalse\r\n------WebKitFormBoundaryBj3LlspRNf8aUHgB\r\nContent-Disposition: form-data; name="ultra_restricted"\r\n\r\nfalse\r\n------WebKitFormBoundaryBj3LlspRNf8aUHgB\r\nContent-Disposition: form-data; name="campaign"\r\n\r\nteam_menu\r\n------WebKitFormBoundaryBj3LlspRNf8aUHgB\r\nContent-Disposition: form-data; name="_x_reason"\r\n\r\nsubmit-invite-to-workspace-invites\r\n------WebKitFormBoundaryBj3LlspRNf8aUHgB\r\nContent-Disposition: form-data; name="_x_mode"\r\n\r\nonline\r\n------WebKitFormBoundaryBj3LlspRNf8aUHgB\r\nContent-Disposition: form-data; name="_x_sonic"\r\n\r\ntrue\r\n------WebKitFormBoundaryBj3LlspRNf8aUHgB\r\nContent-Disposition: form-data; name="_x_app_name"\r\n\r\nclient\r\n------WebKitFormBoundaryBj3LlspRNf8aUHgB--\r\n`,
        method: "POST",
      }
    );

    console.log(`Slack API response status: ${response.status}`);

    // Parse and log the response
    try {
      const responseData = await response.json();
      console.log(
        "Slack API response data:",
        JSON.stringify(responseData, null, 2)
      );

      if (responseData.ok) {
        console.log(`Successfully invited ${email} to Slack workspace`);
        return { success: true, data: responseData };
      } else {
        console.error(
          `Failed to invite ${email}: ${responseData.error || "Unknown error"}`
        );
        return {
          success: false,
          error: responseData.error,
          data: responseData,
        };
      }
    } catch (parseError) {
      console.error("Error parsing Slack API response:", parseError);

      // Log the text response if JSON parsing fails
      const textResponse = await response.text();
      console.log(
        "Raw response text:",
        textResponse.substring(0, 500) +
          (textResponse.length > 500 ? "..." : "")
      );

      return {
        success: false,
        error: "Failed to parse response",
        // @ts-expect-error
        details: parseError.message,
      };
    }
  } catch (error) {
    console.error("Error sending invitation to Slack:", error);
    return {
      success: false,
      error: "Request failed",
      // @ts-expect-error
      details: error.message,
    };
  }
}
