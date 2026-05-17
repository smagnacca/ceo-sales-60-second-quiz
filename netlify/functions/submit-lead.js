// Receives quiz data → appends row to Google Sheets (Quiz_Leads tab)
// Auto-creates the Quiz_Leads tab + headers if it doesn't exist yet
// Zero npm deps — uses Node built-in crypto + native fetch (Node 18+)

const { createSign } = require("crypto");

const SHEET_ID  = "1RHtpqWJMbQPhTTBzF2HU5hzg9SISutY_m40UU_vCleE";
const SHEET_TAB = "Quiz_Leads";
const SCOPE     = "https://www.googleapis.com/auth/spreadsheets";
const HEADERS   = ["Timestamp","Name","Email","Company","Score","Q1 Answer","Q2 Answer","Q3 Answer","Q4 Answer","UTM Source","UTM Medium","UTM Campaign","UTM Content"];

function makeJWT(sa) {
  const now = Math.floor(Date.now() / 1000);
  const hdr = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const pay = Buffer.from(JSON.stringify({ iss: sa.client_email, scope: SCOPE, aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 })).toString("base64url");
  const inp = hdr + "." + pay;
  const sign = createSign("RSA-SHA256");
  sign.update(inp);
  return inp + "." + sign.sign(sa.private_key, "base64url");
}

async function getToken(sa) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=" + makeJWT(sa),
  });
  const d = await res.json();
  if (!d.access_token) throw new Error("Token error: " + JSON.stringify(d));
  return d.access_token;
}

async function ensureSheet(token) {
  // Get existing sheet names
  const metaRes = await fetch(
    "https://sheets.googleapis.com/v4/spreadsheets/" + SHEET_ID + "?fields=sheets.properties.title",
    { headers: { Authorization: "Bearer " + token } }
  );
  const meta = await metaRes.json();
  const exists = meta.sheets && meta.sheets.some(s => s.properties.title === SHEET_TAB);
  if (exists) return; // nothing to do

  // Create the tab
  const createRes = await fetch(
    "https://sheets.googleapis.com/v4/spreadsheets/" + SHEET_ID + ":batchUpdate",
    {
      method: "POST",
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify({ requests: [{ addSheet: { properties: { title: SHEET_TAB } } }] })
    }
  );
  if (!createRes.ok) throw new Error("Create sheet error: " + await createRes.text());

  // Add header row
  await fetch(
    "https://sheets.googleapis.com/v4/spreadsheets/" + SHEET_ID + "/values/" + encodeURIComponent(SHEET_TAB) + "!A1:append?valueInputOption=USER_ENTERED",
    {
      method: "POST",
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [HEADERS] })
    }
  );
}

async function appendRow(token, row) {
  const url = "https://sheets.googleapis.com/v4/spreadsheets/" + SHEET_ID + "/values/" + encodeURIComponent(SHEET_TAB) + "!A1:append?valueInputOption=USER_ENTERED";
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify({ values: [row] }),
  });
  if (!res.ok) throw new Error("Sheets error: " + await res.text());
}

exports.handler = async (event) => {
  const h = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: h, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers: h, body: "Method Not Allowed" };
  try {
    const { email, name, company, score, answers, utm_source, utm_medium, utm_campaign, utm_content } = JSON.parse(event.body || "{}");
    if (!email) return { statusCode: 400, headers: h, body: JSON.stringify({ error: "Email required" }) };
    const sa = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    const token = await getToken(sa);
    await ensureSheet(token);           // creates tab + headers if missing
    const row = [
      new Date().toISOString(),
      name    || "",
      email,
      company || "",
      score   != null ? score : "",
      answers && answers[0] != null ? answers[0] : "",
      answers && answers[1] != null ? answers[1] : "",
      answers && answers[2] != null ? answers[2] : "",
      answers && answers[3] != null ? answers[3] : "",
      utm_source   || "",
      utm_medium   || "",
      utm_campaign || "",
      utm_content  || "",
    ];
    await appendRow(token, row);
    return { statusCode: 200, headers: h, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error("submit-lead error:", err);
    return { statusCode: 500, headers: h, body: JSON.stringify({ error: err.message }) };
  }
};
