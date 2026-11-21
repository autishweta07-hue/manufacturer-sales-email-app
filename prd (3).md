# Product Requirements Document (PRD)

## Manufacturer Sales Email Application

**Document status:** Draft\
**Version:** 1.0\
**Date:** 20 November 2026

## 1. Product Overview

Build a lightweight internal web application that enables the sales team
to upload a manufacturer contact list from Excel, create personalized
sales emails, share a company sales deck, send individual emails in
controlled batches, and monitor measurable engagement and prospect
responses.

The application is intended for internal use. It should prioritize a
simple workflow, reliable email sending, recipient privacy, and clear
reporting. Avoid unnecessary features and complex architecture.

## 2. Goals

-   Import manufacturer contacts from `Pune_Manufacturers.xlsx`.
-   Personalize an email for each contact using spreadsheet data.
-   Send each recipient a separate email from an authorized company
    email account.
-   Share the sales deck as an attachment or trackable link.
-   Respect unsubscribe requests and avoid emailing opted-out contacts.
-   Track supported delivery and engagement events.
-   Record prospect responses and export campaign results to Excel.

## 3. Users

**Internal sales user:** Uploads the lead list, prepares and previews
the email, sends the campaign, and monitors responses.

No public user accounts or customer-facing portal are required for the
MVP.

## 4. Essential Features and Requirements

### 4.1 Lead Management

-   Allow the user to upload an `.xlsx` file, initially
    `Pune_Manufacturers.xlsx`.
-   Read the first relevant worksheet and display the imported rows for
    review.
-   Map spreadsheet columns to these application fields:
    -   `{{Name}}` --- contact person's name
    -   `{{Email}}` --- recipient email address
    -   `{{Company_Name}}` --- company name
-   Allow the user to confirm or adjust the column mapping if the
    spreadsheet headers differ.
-   Validate email addresses and identify missing required values or
    duplicate email addresses.
-   Show valid, invalid, duplicate, and opted-out contacts before
    sending.
-   Allow the user to exclude individual contacts from a campaign.
-   Do not send to rows with missing or invalid email addresses.

### 4.2 Email Personalization

-   Provide editable subject and email body fields.
-   Support these personalization variables:
    -   `{{Name}}`
    -   `{{Company_Name}}`
    -   `{{Email}}` (available where useful, but should not normally be
        displayed in the message)
-   Replace variables separately for each recipient before sending.
-   Provide a preview for an individual recipient and a way to inspect
    multiple recipient previews.
-   Allow the user to attach the sales deck or include a sales deck
    link.
-   Prefer a hosted deck link when click/download measurement is
    required. If using a link, make sure the destination is accessible
    to recipients.
-   If a variable has no value, flag it during preview and prevent
    accidental sending of an unresolved placeholder.
-   Send one individual message per recipient. Never place the full
    recipient list in To, CC, or BCC.

### 4.3 Bulk Email Sending

-   Send to the reviewed and selected recipients using an authorized
    company email account and legitimate email delivery provider.
-   Provide:
    -   Test email to an address entered by the user.
    -   Final campaign preview.
    -   Explicit confirmation before sending.
    -   Configurable batch size and delay between messages or batches.
    -   A visible sending progress and success/failure counts.
-   Apply configurable sending limits that respect the email provider's
    limits and applicable anti-spam requirements.
-   Record each send attempt and its result.
-   Do not automatically retry permanent failures. Transient failures
    may be retried safely with a limited retry policy.
-   Include a clear unsubscribe link in every marketing email.
-   Maintain an opt-out list and exclude unsubscribed contacts from
    future campaigns.
-   Process unsubscribe requests promptly and prevent further campaign
    emails to those addresses.
-   Do not treat a test email as a real campaign send.

### 4.4 Email Tracking and Prospect Responses

Track only events that are technically available and appropriate to
measure:

-   Email send attempts and successful sends.
-   Delivery and bounce events, where the email provider supports them.
-   Email opens only if open tracking is enabled and disclosed. Explain
    in the UI that open data may be inaccurate or incomplete.
-   Sales deck link clicks.
-   Sales deck downloads only when the chosen hosting method can
    reliably measure them.
-   Unsubscribe events.
-   Prospect CTA responses.

Do not attempt to measure how long a recipient reads an email or
otherwise infer private reading behavior.

#### Email call-to-action

Include three clearly labelled response options in the email:

-   **Interested**
-   **Not Interested**
-   **Request a Call**

Each option should link to a simple response endpoint or page. When
clicked:

-   Record the response, campaign, recipient, and timestamp.
-   Show a brief confirmation to the recipient.
-   Update the campaign dashboard.
-   Mark "Request a Call" as requiring follow-up.

The response page should not require the recipient to create an account
or sign in.

### 4.5 Dashboard and Export

Provide a simple campaign dashboard with these summary metrics:

-   Total leads uploaded.
-   Valid, invalid, duplicate, and excluded leads.
-   Total emails sent.
-   Delivered and bounced counts, where supported.
-   Open activity, when enabled.
-   Sales deck clicks and measurable downloads.
-   Interested prospects.
-   Not interested responses.
-   Request-a-call responses.
-   Unsubscribed contacts.
-   Pending follow-ups.

Also provide a recipient-level table showing company, contact, email,
send status, relevant engagement events, response, and follow-up status.

Allow users to export campaign results and lead statuses to `.xlsx`.

Clearly distinguish events that are unavailable or unsupported from
events with a count of zero.

## 5. Main User Workflow

1.  User opens the internal application.
2.  User uploads `Pune_Manufacturers.xlsx`.
3.  Application reads the file, maps columns, validates rows, and
    displays the recipient list.
4.  User reviews the contacts and excludes any recipients who should not
    be contacted.
5.  User creates or edits the email subject and body using
    personalization variables.
6.  User adds the sales deck as an attachment or link.
7.  User previews the personalized email and sends a test email to their
    own address.
8.  User verifies the test email, personalization, deck access, and CTA
    links.
9.  User confirms the campaign and starts sending.
10. Application sends individual emails in controlled batches and
    records send results.
11. Dashboard displays delivery and measurable engagement events as they
    arrive.
12. Sales user reviews prospect responses, handles follow-ups, and
    exports results to Excel.

## 6. MVP Screens

1.  **Upload Leads:** Excel upload, column mapping, validation summary.
2.  **Review Recipients:** Recipient table, filters/statuses, exclude
    controls.
3.  **Email Composer:** Subject, body, personalization variable
    guidance, deck attachment/link.
4.  **Preview and Test:** Recipient preview, test recipient, send test
    action, campaign confirmation.
5.  **Campaign Dashboard:** Summary metrics, recipient-level results,
    follow-up status, Excel export.

Keep navigation simple. A separate administration console is not
required for the MVP.

## 7. Data to Store

Store only the information needed to operate campaigns and report
results:

-   Lead: contact name, email, company name, and opt-out status.
-   Campaign: campaign name, subject, body/template, deck reference,
    creation time, and status.
-   Recipient campaign record: lead reference, send status, timestamps,
    and provider message identifier where available.
-   Events: event type, recipient/campaign reference, and timestamp.
-   Prospect response: response type and timestamp.
-   Follow-up status: pending or completed, with an optional internal
    note.

Do not store email account passwords directly in application code or
source control. Use the email provider's secure authorization mechanism
and keep credentials/secrets in environment configuration or a secrets
manager.

## 8. Non-Functional Requirements

-   **Simplicity:** Build only the screens and workflows listed in this
    PRD.
-   **Privacy:** Keep recipient addresses private by sending individual
    emails.
-   **Security:** Restrict the application to authorized internal users;
    protect uploaded contact data and email credentials.
-   **Reliability:** Record send outcomes and avoid duplicate sends when
    a campaign is resumed.
-   **Compliance:** Support unsubscribe handling and applicable email
    marketing, privacy, and provider policies. The business is
    responsible for ensuring it has a lawful basis and permission to
    contact each recipient.
-   **Usability:** Provide clear validation errors, send progress, and
    campaign status.
-   **Data handling:** Limit access to lead data and provide a
    reasonable retention/deletion process for uploaded files and
    campaign records.

## 9. Out of Scope for MVP

-   AI-generated email copy or automatic lead research/enrichment.
-   CRM integrations and complex sales pipeline management.
-   Multi-step automated email sequences or scheduled follow-up
    campaigns.
-   Multiple teams, role hierarchies, or advanced permission management.
-   A/B testing, advanced segmentation, and predictive analytics.
-   Measuring private reading time or recipient behavior beyond
    supported events.
-   Building a custom email delivery infrastructure.

## 10. Acceptance Criteria

The MVP is ready for controlled internal use when all of the following
are verified:

### Lead import

-   [ ] Upload a small sample `.xlsx` file successfully.
-   [ ] Correctly map contact name, email, and company name.
-   [ ] Identify invalid/missing email addresses and duplicates.
-   [ ] Display recipients for review before sending.
-   [ ] Exclude opted-out contacts.

### Email creation and sending

-   [ ] Personalization variables render correctly for different
    recipients.
-   [ ] Unresolved or missing variables are flagged before sending.
-   [ ] A test email can be sent to an internal address.
-   [ ] The sales deck attachment or link works for the test recipient.
-   [ ] Each recipient receives an individual email without seeing other
    recipients' addresses.
-   [ ] Sending limits and delays are applied.
-   [ ] Send outcomes are recorded and campaign progress is visible.

### Tracking and responses

-   [ ] Supported delivery and bounce events update the dashboard.
-   [ ] Open tracking, if enabled, is disclosed and labelled as
    approximate.
-   [ ] Deck clicks and measurable downloads are recorded.
-   [ ] Interested, Not Interested, and Request a Call actions record
    the correct response.
-   [ ] Unsubscribe actions update the opt-out list and prevent future
    campaign sends.

### Dashboard and export

-   [ ] Dashboard metrics match the recorded campaign data.
-   [ ] Recipient-level statuses are visible.
-   [ ] Results can be exported to Excel and opened successfully.

### Final verification

-   [ ] Complete all tests using a small sample list and internal test
    recipients first.
-   [ ] Fix and retest defects before importing or emailing the actual
    manufacturer list.
-   [ ] Obtain internal approval before the first real campaign.

## 11. Key Assumptions and Decisions

-   The initial source file is `Pune_Manufacturers.xlsx`.
-   The initial required lead fields are contact name, email, and
    company name.
-   The sales deck and authorized company sending account will be
    supplied by the business.
-   The business will choose an email provider that supports the
    required sending, unsubscribe, and event reporting capabilities.
-   Delivery, open, and download tracking depend on provider and hosting
    support; the application must not claim events it cannot verify.
-   The first release is for a small internal sales team and a
    controlled manufacturer outreach campaign.

## 12. MVP Success Measure

The MVP is successful when a sales user can import and review the
manufacturer list, send a tested and personalized individual email to
selected contacts, share the sales deck, identify measurable prospect
responses, manage unsubscribes, and export campaign results without
using a separate manual spreadsheet workflow.
