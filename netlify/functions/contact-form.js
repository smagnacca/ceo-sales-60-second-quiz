const { google } = require("googleapis");
const sgMail = require("@sendgrid/mail");
const path = require("path");
const fs = require("fs");

const SPREADSHEET_ID = "1RHtpqWJMbQPhTTBzF2HU5hzg9SISutY_m40UU_vCleE";
const TAB_NAME = "Discovery_Calls";

// Headers for the sheet
const HEADERS = ["Timestamp", "Name", "Email", "Company", "Role", "Team Size", "Message"];

async function getAuthClient() {
  // In Netlify, service account JSON is injected as an env var
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON env var is not set");
  }
  const credentials = JSON.parse(serviceAccountJson);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return auth.getClient();
}

async function ensureTabExists(sheets) {
  // Check if tab exists; create it with headers if not
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const sheetNames = meta.data.sheets.map((s) => s.properties.title);

  if (!sheetNames.includes(TAB_NAME)) {
    // Create the tab
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: { title: TAB_NAME },
            },
          },
        ],
      },
    });
    // Write headers
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${TAB_NAME}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [HEADERS] },
    });
  }
}

function parseBody(body, contentType) {
  if (!body) return {};
  if (contentType && contentType.includes("application/json")) {
    try { return JSON.parse(body); } catch { return {}; }
  }
  // application/x-www-form-urlencoded
  const params = new URLSearchParams(body);
  const result = {};
  params.forEach((v, k) => { result[k] = v; });
  return result;
}

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const contentType = event.headers["content-type"] || "";
    const fields = parseBody(event.body, contentType);

    const name = (fields.name || "").trim();
    const email = (fields.email || "").trim();
    const company = (fields.company || "").trim();
    const role = (fields.role || "").trim();
    const teamSize = (fields.team_size || "").trim();
    const message = (fields.message || "").trim();

    if (!name || !email || !company || !role) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: "Missing required fields" }),
      };
    }

    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    await ensureTabExists(sheets);

    const timestamp = new Date().toISOString();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${TAB_NAME}!A1`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [[timestamp, name, email, company, role, teamSize, message]],
      },
    });

    // Send notification email to Scott
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    await sgMail.send({
      to: "scott.magnacca1@gmail.com",
      from: "scott@scottmagnacca.com",
      replyTo: email,
      subject: `New Discovery Call Lead: ${name} from ${company}`,
      html: `
        <h2>New Discovery Call Submission</h2>
        <p><strong>Source:</strong> Website Form</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Role:</strong> ${role}</p>
        <p><strong>Team Size:</strong> ${teamSize || "Not specified"}</p>
        <p><strong>Message:</strong></p>
        <p>${(message || "").replace(/\n/g, "<br>")}</p>
        <p><strong>Submitted:</strong> ${timestamp}</p>
      `,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error("contact-form error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
