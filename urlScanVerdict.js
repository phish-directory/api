fetch("https://urlscan.io/result/verdict/", {
  "headers": {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/json",
    "priority": "u=1, i",
    "sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"macOS\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "cookie": "sid=s%3AwsFk7E7CPNuWf-E7nrsJwnSG2kVvQIFT.WqPxk7Inyk0ZSBPmuUoDrRyrJNK9zTgZxUUr5ZvFC%2Fs",
    "Referer": "https://urlscan.io/result/2df3a014-7e25-4bc7-9f4f-c83f880b1c9b/report/",
    "Referrer-Policy": "unsafe-url"
  },
  "body": "{\"verdict\":\"malicious\",\"comment\":\"This website is present on the phish.directory anti phishing list. More info at https://phish.directory or via email at team@phish.directory\",\"threatTypes\":[\"phishing\",\"scam\"],\"brands\":[],\"scope\":\"page.domain\",\"scopeValue\":\"captchabot.online\",\"uuid\":\"2df3a014-7e25-4bc7-9f4f-c83f880b1c9b\",\"type\":\"verdict\"}",
  "method": "POST"
});;