const RESEND_API_URL = "https://api.resend.com/emails";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "JobHunt4U <notifications@jobhunt4u.com>",
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error ${response.status}: ${error}`);
  }
}

export async function sendInterviewReminder(
  user: { email: string; name: string },
  jobTitle: string,
  company: string,
  interviewDate: string
): Promise<void> {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Interview Reminder — JobHunt4U</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#1e293b;border-radius:12px;overflow:hidden;max-width:600px;">
          <!-- Header -->
          <tr>
            <td style="background-color:#3B82F6;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">JobHunt4U</h1>
              <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">Your AI-powered job hunting co-pilot</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 8px;color:#94a3b8;font-size:14px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">INTERVIEW REMINDER</p>
              <h2 style="margin:0 0 24px;color:#f1f5f9;font-size:26px;font-weight:700;">Your interview is tomorrow! 🎯</h2>
              <p style="margin:0 0 24px;color:#cbd5e1;font-size:16px;line-height:1.6;">Hi ${user.name},</p>
              <p style="margin:0 0 32px;color:#cbd5e1;font-size:16px;line-height:1.6;">
                You have an interview scheduled for tomorrow. Here are the details:
              </p>
              <!-- Job card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;border-radius:8px;border:1px solid #334155;margin-bottom:32px;">
                <tr>
                  <td style="padding:24px;">
                    <p style="margin:0 0 4px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Position</p>
                    <p style="margin:0 0 16px;color:#f1f5f9;font-size:18px;font-weight:600;">${jobTitle}</p>
                    <p style="margin:0 0 4px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Company</p>
                    <p style="margin:0 0 16px;color:#f1f5f9;font-size:16px;font-weight:500;">${company}</p>
                    <p style="margin:0 0 4px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Date</p>
                    <p style="margin:0;color:#3B82F6;font-size:16px;font-weight:600;">${interviewDate}</p>
                  </td>
                </tr>
              </table>
              <!-- Tips -->
              <h3 style="margin:0 0 16px;color:#f1f5f9;font-size:18px;font-weight:600;">Tips for today</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #1e293b;">
                    <p style="margin:0;color:#cbd5e1;font-size:15px;line-height:1.5;">
                      <span style="color:#3B82F6;font-weight:700;margin-right:8px;">01</span>
                      Research ${company} — check their website, recent news, and Glassdoor reviews.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #1e293b;">
                    <p style="margin:0;color:#cbd5e1;font-size:15px;line-height:1.5;">
                      <span style="color:#3B82F6;font-weight:700;margin-right:8px;">02</span>
                      Prepare 3–5 thoughtful questions to ask your interviewer.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #1e293b;">
                    <p style="margin:0;color:#cbd5e1;font-size:15px;line-height:1.5;">
                      <span style="color:#3B82F6;font-weight:700;margin-right:8px;">03</span>
                      Review your resume and be ready to walk through your experience.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;">
                    <p style="margin:0;color:#cbd5e1;font-size:15px;line-height:1.5;">
                      <span style="color:#3B82F6;font-weight:700;margin-right:8px;">04</span>
                      Get a good night's sleep — you've got this!
                    </p>
                  </td>
                </tr>
              </table>
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://jobhunt4u.com/dashboard/interview-prep"
                       style="display:inline-block;background-color:#3B82F6;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;">
                      Go to Interview Prep
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#0f172a;padding:24px 40px;text-align:center;border-top:1px solid #334155;">
              <p style="margin:0;color:#475569;font-size:13px;">
                You're receiving this because you have an interview scheduled in JobHunt4U.<br />
                &copy; 2026 JobHunt4U. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  await sendEmail({
    to: user.email,
    subject: `Interview tomorrow: ${jobTitle} at ${company}`,
    html,
  });
}

export async function sendWeeklyDigest(
  user: { email: string; name: string },
  jobs: Array<{ title: string; company: string; match_score: number }>
): Promise<void> {
  const jobRows = jobs
    .slice(0, 5)
    .map(
      (job, i) => `
    <tr style="border-bottom:1px solid #1e293b;">
      <td style="padding:14px 16px;color:#94a3b8;font-size:13px;font-weight:600;">${i + 1}</td>
      <td style="padding:14px 16px;">
        <p style="margin:0;color:#f1f5f9;font-size:15px;font-weight:600;">${job.title}</p>
        <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;">${job.company}</p>
      </td>
      <td style="padding:14px 16px;text-align:right;">
        <span style="display:inline-block;background-color:${job.match_score >= 80 ? "#052e16" : job.match_score >= 60 ? "#172554" : "#1c1917"};color:${job.match_score >= 80 ? "#4ade80" : job.match_score >= 60 ? "#60a5fa" : "#a8a29e"};padding:4px 10px;border-radius:20px;font-size:13px;font-weight:700;">
          ${job.match_score}%
        </span>
      </td>
    </tr>
  `
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Weekly Job Digest — JobHunt4U</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#1e293b;border-radius:12px;overflow:hidden;max-width:600px;">
          <!-- Header -->
          <tr>
            <td style="background-color:#3B82F6;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">JobHunt4U</h1>
              <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">Your weekly job matches are ready</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 8px;color:#94a3b8;font-size:14px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">WEEKLY DIGEST</p>
              <h2 style="margin:0 0 24px;color:#f1f5f9;font-size:26px;font-weight:700;">Top job matches this week</h2>
              <p style="margin:0 0 32px;color:#cbd5e1;font-size:16px;line-height:1.6;">
                Hi ${user.name}, here are your top ${jobs.slice(0, 5).length} AI-matched job opportunities for this week:
              </p>
              <!-- Jobs table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;border-radius:8px;border:1px solid #334155;margin-bottom:32px;border-collapse:collapse;">
                <thead>
                  <tr style="background-color:#0f172a;border-bottom:2px solid #334155;">
                    <th style="padding:12px 16px;color:#475569;font-size:12px;text-transform:uppercase;letter-spacing:1px;text-align:left;font-weight:600;">#</th>
                    <th style="padding:12px 16px;color:#475569;font-size:12px;text-transform:uppercase;letter-spacing:1px;text-align:left;font-weight:600;">Position</th>
                    <th style="padding:12px 16px;color:#475569;font-size:12px;text-transform:uppercase;letter-spacing:1px;text-align:right;font-weight:600;">Match</th>
                  </tr>
                </thead>
                <tbody>
                  ${jobRows}
                </tbody>
              </table>
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="https://jobhunt4u.com/login?next=/dashboard/jobs"
                       style="display:inline-block;background-color:#3B82F6;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;">
                      View All Matches
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;color:#475569;font-size:14px;text-align:center;line-height:1.6;">
                Match scores are calculated by our AI based on your resume and profile.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#0f172a;padding:24px 40px;text-align:center;border-top:1px solid #334155;">
              <p style="margin:0;color:#475569;font-size:13px;">
                You're receiving this weekly digest because you have a resume uploaded in JobHunt4U.<br />
                &copy; 2026 JobHunt4U. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  await sendEmail({
    to: user.email,
    subject: `Your weekly job matches are ready — ${jobs.slice(0, 5).length} new opportunities`,
    html,
  });
}
