import nodemailer from "nodemailer";

interface MailOptions {
  to: string;
  subject: string;
  body: string;
}

const domain = process.env.NEXT_PUBLIC_APP_URL;

// ─── Shared Layout ─────────────────────────────────────────────────────────────
function wrapInLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>DASE Supermarket</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background-color: #f2f5f2;
      font-family: 'DM Sans', Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    .wrapper {
      width: 100%;
      background-color: #f2f5f2;
      padding: 40px 16px;
    }

    .container {
      max-width: 580px;
      margin: 0 auto;
    }

    .header {
      background-color: #1a5c38;
      border-radius: 8px 8px 0 0;
      padding: 28px 40px;
      text-align: center;
    }

    .logo-wrap {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
    }

    .logo-img {
      width: 40px;
      height: 40px;
      object-fit: contain;
    }

    .brand-name {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 22px;
      color: #ffffff;
      letter-spacing: 0.02em;
    }

    .brand-sub {
      font-size: 10px;
      font-weight: 400;
      color: rgba(255,255,255,0.55);
      letter-spacing: 0.18em;
      text-transform: uppercase;
      margin-top: 3px;
    }

    .card {
      background-color: #ffffff;
      padding: 40px 40px 36px;
      border-left: 1px solid #e0e8e2;
      border-right: 1px solid #e0e8e2;
    }

    .tag {
      display: inline-block;
      background-color: #e8f3ed;
      color: #1a5c38;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 4px;
      margin-bottom: 16px;
    }

    .heading {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 28px;
      font-weight: 400;
      line-height: 1.3;
      color: #0f2e1c;
      margin-bottom: 12px;
    }

    .heading em {
      font-style: italic;
      color: #1a5c38;
    }

    .rule {
      height: 2px;
      background: linear-gradient(90deg, #1a5c38, transparent);
      margin-bottom: 20px;
      width: 48px;
      border: none;
    }

    .body-text {
      font-size: 14px;
      font-weight: 400;
      line-height: 1.75;
      color: #4a5e52;
      margin-bottom: 28px;
    }

    /* OTP */
    .otp-wrapper { text-align: center; margin: 28px 0; }
    .otp-label {
      font-size: 10px; font-weight: 600; letter-spacing: 0.2em;
      text-transform: uppercase; color: #7a9e88; margin-bottom: 12px;
    }
    .otp-box {
      display: inline-block; background-color: #f2f8f4;
      border: 1.5px dashed #a8d0b4; border-radius: 8px; padding: 20px 48px;
    }
    .otp-code {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 44px; letter-spacing: 0.18em; color: #1a5c38;
    }
    .otp-expiry { font-size: 12px; color: #7a9e88; margin-top: 12px; }
    .otp-expiry strong { color: #1a5c38; }

    /* CTA */
    .cta-wrapper { text-align: center; margin: 28px 0; }
    .cta-btn {
      display: inline-block; background-color: #1a5c38; color: #ffffff !important;
      font-family: 'DM Sans', Arial, sans-serif; font-size: 13px; font-weight: 600;
      letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none;
      padding: 14px 36px; border-radius: 6px;
    }
    .cta-link-text { font-size: 12px; color: #7a9e88; margin-top: 14px; word-break: break-all; }
    .cta-link-text a { color: #1a5c38; }

    /* Info note */
    .info-note {
      background-color: #f2f8f4; border-left: 3px solid #1a5c38;
      padding: 14px 18px; margin-top: 24px; border-radius: 0 6px 6px 0;
    }
    .info-note p { font-size: 12px; color: #4a6b55; line-height: 1.65; }
    .info-note strong { color: #1a5c38; font-weight: 600; }

    /* Data card */
    .data-card {
      background-color: #f8fbf9; border: 1px solid #d6e8dc;
      border-radius: 8px; overflow: hidden; margin: 20px 0;
    }
    .data-section-title {
      background-color: #1a5c38; color: #ffffff; font-size: 10px;
      font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase;
      padding: 8px 18px;
    }
    .data-row {
      display: flex; justify-content: space-between; align-items: flex-start;
      padding: 11px 18px; border-bottom: 1px solid #e4ede7; font-size: 13px;
    }
    .data-row:last-child { border-bottom: none; }
    .data-label { color: #7a9e88; font-weight: 500; flex-shrink: 0; padding-right: 16px; }
    .data-value { color: #1b2e22; font-weight: 500; text-align: right; word-break: break-word; }

    /* Items table */
    .items-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .items-table thead tr { background-color: #e8f3ed; }
    .items-table thead th {
      padding: 9px 12px; text-align: left; font-size: 10px; font-weight: 600;
      letter-spacing: 0.12em; text-transform: uppercase; color: #1a5c38;
    }
    .items-table thead th:last-child { text-align: right; }
    .items-table tbody tr { border-bottom: 1px solid #e4ede7; }
    .items-table tbody tr:last-child { border-bottom: none; }
    .items-table tbody td { padding: 10px 12px; color: #2d4a36; }
    .items-table tbody td:last-child { text-align: right; font-weight: 600; white-space: nowrap; }
    .item-meta { font-size: 11px; color: #7a9e88; margin-top: 2px; }
    .items-total-row { background-color: #1a5c38; }
    .items-total-row td { padding: 12px !important; color: #ffffff !important; font-weight: 600 !important; }

    /* Badge */
    .badge {
      display: inline-block; font-size: 10px; font-weight: 600;
      letter-spacing: 0.12em; text-transform: uppercase; padding: 3px 10px; border-radius: 99px;
    }
    .badge-green { background-color: #dcf5e7; color: #1a5c38; }
    .badge-yellow { background-color: #fef3c7; color: #92400e; }

    /* Footer */
    .footer {
      background-color: #1b2e22; border-radius: 0 0 8px 8px;
      padding: 24px 40px; text-align: center;
    }
    .footer-text { font-size: 12px; color: rgba(255,255,255,0.45); line-height: 1.7; }
    .footer-text a { color: rgba(255,255,255,0.65); text-decoration: none; }
    .footer-brand {
      font-family: 'DM Serif Display', Georgia, serif; font-size: 14px;
      color: rgba(255,255,255,0.3); margin-top: 12px; letter-spacing: 0.06em;
    }

    @media only screen and (max-width: 480px) {
      .card { padding: 28px 20px; }
      .header { padding: 22px 20px; }
      .footer { padding: 20px; }
      .heading { font-size: 24px; }
      .otp-code { font-size: 34px; }
      .otp-box { padding: 16px 28px; }
      .data-row { flex-direction: column; gap: 4px; }
      .data-value { text-align: left; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <span class="logo-wrap">
          <img src="${domain}/logo.svg" alt="DASE Supermarket" class="logo-img" width="40" height="40" />
          <span>
            <div class="brand-name">DASE Supermarket</div>
            <div class="brand-sub">Fresh &nbsp;·&nbsp; Quality &nbsp;·&nbsp; Value</div>
          </span>
        </span>
      </div>
      <div class="card">${content}</div>
      <div class="footer">
        <p class="footer-text">
          This email was sent by DASE Supermarket.<br/>
          If you did not initiate this action, please ignore this email.<br/>
          <a href="${domain}">www.dasesupermarket.com</a>
        </p>
        <div class="footer-brand">DASE Supermarket &nbsp;·&nbsp; Abuja, Nigeria</div>
      </div>
    </div>
  </div>
</body>
</html>`.trim();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function row(label: string, value: string): string {
  return `
    <div class="data-row">
      <span class="data-label">${label}</span>
      <span class="data-value">${value}</span>
    </div>`;
}

function sectionTitle(title: string): string {
  return `<div class="data-section-title">${title}</div>`;
}


// ─── Two-Factor Authentication ────────────────────────────────────────────────
function twoFactorBody(token: string): string {
  return wrapInLayout(`
    <div class="tag">Security</div>
    <div class="heading">Your Verification <em>Code</em></div>
    <hr class="rule" />
    <p class="body-text">
      To complete your sign-in, enter the one-time code below.
      This code keeps your account secure and expires shortly.
    </p>
    <div class="otp-wrapper">
      <div class="otp-label">One-Time Passcode</div>
      <div class="otp-box">
        <div class="otp-code">${token}</div>
      </div>
      <div class="otp-expiry">Expires in <strong>10 minutes</strong></div>
    </div>
    <div class="info-note">
      <p>
        <strong>Never share this code</strong> with anyone.
        DASE Supermarket will never ask for your security code via phone or email.
      </p>
    </div>
  `);
}


// ─── Password Reset ───────────────────────────────────────────────────────────
function passwordResetBody(resetLink: string): string {
  return wrapInLayout(`
    <div class="tag">Account Security</div>
    <div class="heading">Reset Your <em>Password</em></div>
    <hr class="rule" />
    <p class="body-text">
      We received a request to reset the password for your DASE Supermarket account.
      Click the button below to choose a new password. If you did not request this,
      you can safely ignore this email.
    </p>
    <div class="cta-wrapper">
      <a href="${resetLink}" class="cta-btn">Reset Password</a>
      <div class="cta-link-text">
        Or paste this link in your browser:<br/>
        <a href="${resetLink}">${resetLink}</a>
      </div>
    </div>
    <div class="info-note">
      <p>
        <strong>This link expires in 1 hour</strong> and can only be used once.
        If you need a new link, visit the login page and select "Forgot password."
      </p>
    </div>
  `);
}


// ─── Email Verification ───────────────────────────────────────────────────────
function emailVerificationBody(confirmLink: string): string {
  return wrapInLayout(`
    <div class="tag">Welcome</div>
    <div class="heading">Verify Your <em>Email Address</em></div>
    <hr class="rule" />
    <p class="body-text">
      Thank you for creating a DASE Supermarket account. To complete your
      registration and start shopping, please verify your email address below.
    </p>
    <div class="cta-wrapper">
      <a href="${confirmLink}" class="cta-btn">Verify Email Address</a>
      <div class="cta-link-text">
        Or paste this link in your browser:<br/>
        <a href="${confirmLink}">${confirmLink}</a>
      </div>
    </div>
    <div class="info-note">
      <p>
        <strong>This link expires in 24 hours.</strong> If you did not create
        an account with DASE Supermarket, please ignore this email.
      </p>
    </div>
  `);
}


// ─── Order Types ──────────────────────────────────────────────────────────────

/**
 * "SUPERMARKET" = all productId items
 * "KITCHEN"     = all/majority foodId items (Royal Oyo Kitchen)
 */
export type OrderCategory = "SUPERMARKET" | "KITCHEN";

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  variant?: string; // optional size/descriptor
}

export interface OrderEmailParams {
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  orderReference: string;
  /** Derived from orderItems: if majority have foodId → KITCHEN, else SUPERMARKET */
  category: OrderCategory;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  paymentReference?: string | null;
}

const CATEGORY_META: Record<OrderCategory, { label: string; emoji: string; section: string }> = {
  SUPERMARKET: { label: "Supermarket Order", emoji: "🛒", section: "DASE Supermarket" },
  KITCHEN:     { label: "Kitchen Order",      emoji: "🍽️", section: "Royal Oyo Kitchen" },
};

/**
 * Derive order category from DB orderItems.
 * If the majority of items have a foodId → KITCHEN, otherwise → SUPERMARKET.
 */
export function deriveOrderCategory(
  orderItems: Array<{ foodId?: string | null; productId?: string | null }>
): OrderCategory {
  const foodCount = orderItems.filter((i) => !!i.foodId).length;
  return foodCount > orderItems.length / 2 ? "KITCHEN" : "SUPERMARKET";
}


// ─── Order Email Builder ──────────────────────────────────────────────────────
function buildOrderContent(params: OrderEmailParams, variant: "customer" | "admin"): string {
  const {
    customerName, customerEmail, customerPhone,
    orderReference, category, items,
    totalAmount, paymentMethod, paymentReference,
  } = params;

  const meta = CATEGORY_META[category];
  const time = new Date().toLocaleString("en-NG", {
    timeZone: "Africa/Lagos",
    dateStyle: "full",
    timeStyle: "short",
  });

  const isCustomer = variant === "customer";

  const introText = isCustomer
    ? `Thank you, <strong>${customerName}</strong>. Your payment has been received and your order is confirmed. Here's your summary.`
    : `A new ${meta.label.toLowerCase()} has been placed and payment confirmed. Details below.`;

  const footerNote = isCustomer
    ? `For any issues, contact us at <a href="mailto:support@dasesupermarket.com" style="color:#1a5c38">support@dasesupermarket.com</a>.`
    : `Log in to the admin console to manage this order.`;

  const itemRows = items.map((item) => `
    <tr>
      <td style="padding:10px 12px;">
        <div style="color:#1b2e22;font-weight:500;">${item.name}</div>
        ${item.variant ? `<div class="item-meta">${item.variant}</div>` : ""}
      </td>
      <td style="padding:10px 12px;color:#4a6b55;text-align:center;">${item.quantity}</td>
      <td style="padding:10px 12px;color:#4a6b55;white-space:nowrap;">₦${item.price.toLocaleString("en-NG")}</td>
      <td style="padding:10px 12px;text-align:right;font-weight:600;white-space:nowrap;color:#1a5c38;">₦${item.subtotal.toLocaleString("en-NG")}</td>
    </tr>
  `).join("");

  return `
    <div class="tag">${meta.section}</div>
    <div class="heading">Your Order is <em>Confirmed</em></div>
    <hr class="rule" />
    <p class="body-text">${introText}</p>

    <div class="data-card">
      ${sectionTitle("Customer")}
      ${row("Name", customerName)}
      ${customerEmail ? row("Email", `<span style="word-break:break-all">${customerEmail}</span>`) : ""}
      ${customerPhone ? row("Phone", customerPhone) : ""}
    </div>

    <div class="data-card">
      ${sectionTitle("Order Details")}
      ${row("Reference", `<code style="font-family:monospace;color:#1a5c38">${orderReference}</code>`)}
      ${row("Type", meta.label)}
      ${row("Placed At", time)}
    </div>

    <div class="data-card">
      ${sectionTitle("Items")}
      <div style="overflow-x:auto;">
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align:center">Qty</th>
              <th>Unit Price</th>
              <th style="text-align:right">Subtotal</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
          <tfoot>
            <tr class="items-total-row">
              <td colspan="3" style="padding:12px 12px;font-size:13px;">Total</td>
              <td style="padding:12px 12px;text-align:right;font-family:'DM Serif Display',Georgia,serif;font-size:18px;">
                ₦${totalAmount.toLocaleString("en-NG")}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <div class="data-card">
      ${sectionTitle("Payment")}
      ${row("Method", `<span style="text-transform:capitalize">${paymentMethod}</span>`)}
      ${row("Status", `<span class="badge badge-green">✓ Paid</span>`)}
      ${paymentReference ? row("Reference", `<code style="font-family:monospace;word-break:break-all;font-size:12px">${paymentReference}</code>`) : ""}
    </div>

    <div class="info-note">
      <p>${footerNote}</p>
    </div>
  `;
}


// ─── Public Send Functions ────────────────────────────────────────────────────

export async function sendTwoFactorTokenEmail(email: string, token: string) {
  return sendMail({
    to: email,
    subject: "Your DASE Supermarket verification code",
    body: twoFactorBody(token),
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${domain}/auth/new-password?token=${token}`;
  return sendMail({
    to: email,
    subject: "Reset your DASE Supermarket password",
    body: passwordResetBody(resetLink),
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const confirmLink = `${domain}/auth/email-verification?token=${token}`;
  return sendMail({
    to: email,
    subject: "Verify your email — DASE Supermarket",
    body: emailVerificationBody(confirmLink),
  });
}

/** Confirmation sent to the customer */
export async function sendCustomerOrderConfirmation(params: OrderEmailParams) {
  if (!params.customerEmail) {
    console.warn("sendCustomerOrderConfirmation: no customerEmail — skipping");
    return;
  }
  const meta = CATEGORY_META[params.category];
  return sendMail({
    to: params.customerEmail,
    subject: `✅ ${meta.label} Confirmed — #${params.orderReference}`,
    body: wrapInLayout(buildOrderContent(params, "customer")),
  });
}

/** Notification sent to admin/staff */
export async function sendAdminOrderNotification(params: OrderEmailParams) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  const extraEmails = [
    "manager@dasesupermarket.com",
    "support@dasesupermarket.com",
    "ifeanyi.ripple@gmail.com",
     "damiadeleke@gmail.com",
//"darasimiadetona715@gmail.com",
    "harrietadeleke@gmail.com",

  ];
  const recipients = [adminEmail, ...extraEmails].filter(Boolean) as string[];
  if (recipients.length === 0) {
    console.warn("sendAdminOrderNotification: no recipients configured — skipping");
    return;
  }
  const meta = CATEGORY_META[params.category];
  return sendMail({
    to: recipients.join(","),
    subject: `${meta.emoji} New ${meta.label} — ${params.customerName} · #${params.orderReference}`,
    body: wrapInLayout(buildOrderContent(params, "admin")),
  });
}

/** Fires both customer + admin emails in parallel */
export async function sendOrderEmails(params: OrderEmailParams) {
  await Promise.allSettled([
    sendCustomerOrderConfirmation(params),
    sendAdminOrderNotification(params),
  ]);
}


// ─── Core Mail Sender ─────────────────────────────────────────────────────────
async function sendMail({ to, subject, body }: MailOptions) {
  const { SMTP_PASSWORD, SMTP_EMAIL } = process.env;

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: { user: SMTP_EMAIL!, pass: SMTP_PASSWORD! },
  });

  try {
    await transport.verify();
  } catch (error) {
    console.error("Error verifying transport:", error);
    return;
  }

  try {
    const result = await transport.sendMail({
      from: `"DASE Supermarket" <${SMTP_EMAIL}>`,
      to,
      subject,
      html: body,
    });
    console.log("Email sent:", result.messageId);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}


// import nodemailer from "nodemailer";

// interface MailOptions {
//   to: string;
//   subject: string;
//   body: string;
// }

//  const domain = process.env.NEXT_PUBLIC_APP_URL;

// export async function sendTwoFactorTokenEmail(email: string, token: string) {
  
//   return sendMail({
//     to: email,
//     subject: 'Two factor authentication code',
//     body: `<p>your two factor authentication code is:  ${token} </p>`
//   });
// }

// export async function sendPasswordResetEmail(email: string, token: string) {
//   const resetLink = `${domain}/auth/new-password?token=${token}`;

//   return sendMail({
//     to: email,
//     subject: 'Reset Your Password',
//     body: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
//   });
// }

// export async function sendVerificationEmail(email: string, token: string) {
//   const confirmLink = `${domain}/auth/email-verification?token=${token}`;

//   return sendMail({
//     to: email,
//     subject: 'Verify your email',
//     body: `<p>Click <a href="${confirmLink}">here</a> to verify your email.</p>`
//   });
// }

// async function sendMail({ to, subject, body }: MailOptions) {
//   const { SMTP_PASSWORD, SMTP_EMAIL } = process.env;

//   const transport = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: SMTP_EMAIL!,
//       pass: SMTP_PASSWORD!
//     }
//   });

//   try {
//     await transport.verify();
//   } catch (error) {
//     console.log("Error verifying transport:", error);
//     return;
//   }

//   try {
//     const sendResult = await transport.sendMail({
//       from: `"Ripplez" <${SMTP_EMAIL}>`,
//       to,
//       subject,
//       html: body
//     });
//     console.log("Email sent successfully:", sendResult);
//     return sendResult;
//   } catch (error) {
//     console.log("Error sending email:", error);
//     throw error;
//   }
// }
