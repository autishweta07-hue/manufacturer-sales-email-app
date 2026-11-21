# Manufacturer Sales Email Application

Internal MVP for importing manufacturers, reviewing leads, composing a personalised outreach email, previewing and testing it, then running a confirmed campaign with tracking, CTA responses, opt-outs and Excel export.

## A. Starting the application

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create local configuration:

   ```bash
   cp .env.example .env.local
   ```

3. Edit `.env.local`.

   Required for safe local use:

   ```env
   TRACKING_SECRET=a-long-random-string-at-least-16-characters
   PUBLIC_APP_URL=http://localhost:3000
   ALLOW_SENDING=false
   DATA_DIR=./data
   ```

   Required only when you are ready to test or send real email:

   ```env
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=authorized-sender@example.com
   SMTP_PASS=your-password
   EMAIL_FROM="Company Name <sales@example.com>"
   EMAIL_REPLY_TO=sales@example.com
   WEBHOOK_SECRET=a-different-long-random-string
   OPEN_TRACKING_ENABLED=false
   ```

   `ALLOW_SENDING` is a master kill switch. It is `false` by default. No test email or campaign can be sent until it is deliberately set to `true` and SMTP is configured.

   Optional internal access control:

   ```env
   APP_USER=internal
   APP_PASS=strong-password
   ```

4. Start the frontend and backend together:

   ```bash
   npm run dev
   ```

   Open `http://localhost:3000`. There is no separate backend service or database. Application data is written only to `DATA_DIR` (default `./data`).

   For a production-style run:

   ```bash
   npm run build
   npm start
   ```

## B. Uploading leads

1. Open **Upload leads** (`/leads`).
2. Select the Excel workbook. The supplied file is `Manufacturers (1).xlsx`.
3. The app detects the header row and maps `Company Name`, `Contact Person` and `Email`. Check the mapping before importing.
4. Import. The original spreadsheet is read-only; the app never overwrites it. Imported leads are copied into the app's own store.
5. Open **Recipients** (`/recipients`).
6. Review each row:
   - `valid` — eligible.
   - `invalid` / `missing` — excluded from sending.
   - `duplicate` — same address appeared earlier.
   - `opted-out` — permanently excluded.
   - `excluded` — manually deselected.
   - Multiple emails are flagged; only the first valid address is used.
7. Exclude any recipient you do not want to contact. Invalid, duplicate and opted-out contacts cannot be selected for a campaign.

## C. Sending emails

1. Open **Compose** (`/compose`). A professional manufacturer outreach template is preloaded and fully editable.
2. Replace every `[BRACKETED PLACEHOLDER]` with verified business information. Do not invent claims or performance statistics. `{{Name}}` and `{{Company_Name}}` are filled automatically per recipient.
3. Choose the sales deck:
   - **Hosted link** — sends a tracked link.
   - **Uploaded file** — uploads a PDF/PPT/PPTX and sends a tracked download link.
4. Start with a small sample (2–5 recipients) and an internal test address. Select recipients and save the draft.
5. Open **Preview & test** (`/preview`).
   - Render one recipient or all selected recipients.
   - Check personalization and unresolved placeholders.
   - To send a test email, set `ALLOW_SENDING=true` and configure SMTP, then send to an internal address only.
6. Create the campaign. The exact recipient count is displayed before the final step.
7. Tick the approval checkbox and select **Confirm and send**.
   - The API additionally requires `confirm: true`, the campaign's `confirmToken`, `ALLOW_SENDING=true` and configured SMTP.
   - Nothing is sent on app startup, during tests, or automatically.
8. Keep `ALLOW_SENDING=false` until you are explicitly ready. Real manufacturer sending remains disabled otherwise.

## D. Checking analytics

1. Open **Overview** (`/dashboard`) or **Campaigns** (`/campaigns`).
2. Available metrics come from stored records:
   - Total leads — imported lead count.
   - Emails sent / failed / pending — recorded SMTP results.
   - Delivered / bounced — provider webhook events; shown as **Not available** unless `WEBHOOK_SECRET` and a provider integration are configured.
   - Opens — shown as **Not available** unless `OPEN_TRACKING_ENABLED=true`; approximate when enabled.
   - Deck clicks — signed redirect events.
   - Deck downloads — signed file delivery events when a deck file is used.
   - Interested / Not interested / Request a Call — signed CTA links.
   - Unsubscribed — one-click opt-outs, permanently stored.
   - Pending follow-ups — sales-team status on recipient rows.
3. Open a campaign to inspect the recipient-level table, event log and follow-up notes.
4. Select **Export Excel** to download a workbook with `Summary`, `Recipients` and `Events` sheets.

Delivery and tracking integrations are wired in code but are not claimed as verified here; no authorized SMTP account, provider webhook or test recipient was supplied. Verify them with internal addresses before any real outreach.

## Safety rules

- Never modify or overwrite the original Excel file.
- Never send to the full manufacturer database automatically.
- Never trigger sending during startup, development or testing.
- Use a small sample and internal addresses first.
- Require explicit confirmation and display the exact recipient count.
- Exclude invalid, duplicate and unsubscribed contacts.
- Keep `ALLOW_SENDING=false` until approved.

## Verification commands

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

## Design note

`design-1.md` is the supplied design reference. It describes an unrelated “Signalry” social-content prototype, so this implementation reuses its visual system only: warm off-white canvas, ink typography, chartreuse accent, 232px sidebar, 64px header, flat bordered cards and restrained spacing. Navigation and screens follow the manufacturer-outreach requirements instead of the unrelated prototype's page list.
