# BRAND + DESIGN SYSTEM

## Working product name: Signalry

**Category:** Content intelligence and planning workspace\
**Tagline:** Make every post teach you something.\
**Positioning:** The content workspace that connects what you publish
with what you learn next.

> Naming status: strategic working recommendation, not legal clearance.
> Before committing, check trademark registers in target markets,
> company registries, domains and social handles. "Signalry" is intended
> to evoke signal-finding in noisy content data; do not imply that a
> domain or mark is available.

------------------------------------------------------------------------

## 0. How to use this document

This is the product's design authority for the MVP described in the
accompanying PRD. It is written for implementation in **Next.js App
Router, React, TypeScript, Tailwind CSS and shadcn/ui**, with Recharts
where appropriate.

-   Follow the existing repository and installed component conventions.
    Inspect before restructuring.
-   Use shadcn/ui primitives as accessible foundations, then compose a
    distinctive product interface with Tailwind. Do not ship an
    untouched shadcn demo.
-   This is a frontend-only investor-validation prototype. Every
    account, metric, generation result, schedule and publishing state is
    seeded or simulated.
-   Never imply that Instagram or LinkedIn is connected, that a real
    model generated output, or that a post was actually published.
-   The reference is an inspiration for product storytelling and
    interface craft, not a screen to copy.

### Design references and interpretation

The requested reference, [Ootto](https://www.ootto.ai/), presents a
product as a coherent operating environment rather than a collection of
feature tiles. Its useful patterns are: 1. A strong, compact product
proposition. 2. Realistic product UI used as the primary visual proof.
3. A visible operating loop, not just a list of capabilities. 4. Clear
separation between automated work and human decisions. 5. Honest
treatment of demo data and product maturity. 6. Editorial typography,
restrained color and deliberate whitespace.

Translate those principles to a social content product: show the journey
from brief → content → calendar → performance → learning → next brief.
Do not reproduce Ootto's copy, brand, layout, color system or exact
components.

**Taste / Emil Koskey skills:** The requested "Taste" and "Emil Koskey"
skills were not present in the installed skill catalogue available for
this session. This document therefore applies the requested design-led,
editorial, high-craft direction directly; it does not claim to have
invoked those unavailable skills.

------------------------------------------------------------------------

# PART I --- BRAND STRATEGY

## 1. Naming recommendation

### Primary recommendation: Signalry

**Pronunciation:** SIG-nuhl-ree\
**Name logic:** "Signal" is the useful pattern hidden inside noisy
performance data. The "-ry" ending gives the name a distinct,
ownable-feeling product identity without making it sound like a generic
AI utility.

**Why it fits** - The product's most valuable promise is not simply
producing more posts. It is helping a team notice what works and decide
what to do next. - It can stretch across creation, planning, analytics
and recommendations. - It sounds like a product/workspace, not a social
media agency or a single-purpose caption generator. - It gives the brand
a strong verbal territory: signal, noise, patterns, tests, next move.

**Brand line:** Make every post teach you something.\
**Short descriptor:** Content, with a feedback loop.\
**Product promise:** Plan with intent. Publish with consistency. Learn
from the response.

### Alternative names worth screening

  -----------------------------------------------------------------------
  Name                    Strategic angle         Watch-out
  ----------------------- ----------------------- -----------------------
  Signalry                Performance patterns    Must clear similar
                          turned into better      "signal" marks
                          content decisions       

  Hookwell                Stronger hooks and      May over-index on hooks
                          repeatable creative     
                          learning                

  Postmarka               A considered system for Could sound like a
                          content planning and    publishing utility
                          learning                

  Loopframe               The content feedback    "Loop" is a crowded
                          loop, made visible      naming territory

  Draftsignal             Creation connected to   Slightly longer and
                          performance             more functional
                          intelligence            
  -----------------------------------------------------------------------

**Recommendation:** Use Signalry as the working name in the prototype.
Do not spend time polishing a logo before the product's positioning and
name clearance are settled.

## 2. Brand foundations

### Purpose

Help small marketing teams turn content activity into accumulated
knowledge.

### Audience

-   Social media managers responsible for multiple channels.
-   Founders and growth marketers who need a repeatable content
    practice.
-   Small creator and marketing teams that need structure without
    enterprise complexity.

### Positioning

For people who need to create consistently and improve deliberately,
Signalry is a content growth workspace that connects ideation,
platform-specific creation, planning and performance learning in one
place.

Unlike a standalone AI writer or a calendar-only scheduler, Signalry
makes the learning between publishing cycles visible.

### Brand character

-   **Clear-eyed:** confident in the data, careful about what it can
    prove.
-   **Editorial:** thoughtful hierarchy, strong writing, no dashboard
    confetti.
-   **Practical:** makes the next action obvious.
-   **Curious:** encourages useful experiments rather than declaring
    universal truths.
-   **Human:** helps a marketer make better calls; does not pretend to
    replace them.

### Voice and copy principles

1.  Say what happened, then say why it may matter.
2.  Use concrete verbs: compare, plan, test, review, save, adapt.
3.  Avoid inflated AI language: "revolutionary", "10x", "autonomous
    growth", "magic", "effortless".
4.  Distinguish observation from recommendation.
5.  Qualify small or illustrative datasets. Say "in this sample" rather
    than "your audience always".
6.  Keep interface copy short, calm and specific.

**Good:** "Problem-led hooks earned more saves in this sample. Test the
pattern in two new Reels."\
**Bad:** "Our AI discovered the viral formula that will skyrocket your
engagement."

## 3. Visual identity

### Creative direction: Signal, not noise

A quiet, light editorial workspace with a distinctive ink-and-citrus
identity. The product should feel like a capable creative operations
tool, not a neon AI cockpit.

-   Warm off-white canvas.
-   Deep ink typography.
-   Muted slate for secondary information.
-   One electric chartreuse accent for primary actions and selected
    states.
-   Platform colors used only as small identifiers, never as the
    product's primary palette.
-   Charts are restrained and legible.
-   UI surfaces are mostly flat; use borders and spacing before shadows.

### Logo direction

Create a typographic wordmark first. "Signalry" in a confident grotesk
or neo-grotesk, with a small custom signal mark.

**Mark concept:** Three short vertical bars or a compact waveform
resolving into one clear point. It should communicate signal emerging
from activity, not a broadcast icon or generic AI sparkle.

Logo rules: - Use a wordmark + symbol in the sidebar. - Symbol-only for
compact mobile navigation and favicon. - No gradients, 3D chrome, robot
heads, brains, stars or circuit-board motifs. - Do not use the logo as a
watermark on every panel. - Keep clear space equal to the mark's visual
height.

### Color tokens

Use CSS variables and Tailwind semantic tokens. The values below are
starting tokens; validate contrast in implementation.

  Token                    Hex         Use
  ------------------------ ----------- -------------------------------------
  `--background`           `#F7F7F3`   Main application canvas
  `--surface`              `#FFFFFF`   Cards, menus, dialogs
  `--surface-subtle`       `#F0F1EB`   Quiet inset areas
  `--foreground`           `#171A17`   Primary text
  `--muted-foreground`     `#737A72`   Supporting text
  `--border`               `#E4E7DF`   Dividers and outlines
  `--primary`              `#B7E34A`   Primary accent, selected nav marker
  `--primary-foreground`   `#17200B`   Text on accent
  `--secondary`            `#E9EDE3`   Secondary controls
  `--success`              `#287A55`   Positive state
  `--warning`              `#A66B20`   Needs attention
  `--destructive`          `#B7473D`   Errors and destructive actions
  `--chart-1`              `#334F3B`   Main series
  `--chart-2`              `#A7C85B`   Secondary series
  `--chart-3`              `#82918A`   Third series
  `--chart-4`              `#D39B55`   Fourth series
  `--chart-5`              `#9B8CB7`   Fifth series

**Color discipline** - Primary accent should occupy a small percentage
of the screen. Use it for the main action, selected state and a few
meaningful data points. - Do not color every metric card differently. -
Instagram and LinkedIn can use their recognizable colors in tiny
platform dots or icons, not full card backgrounds. - Never rely on color
alone for status. Pair color with a label and, where useful, an icon.

### Typography

Use **Geist Sans** if already installed; otherwise use **Inter**. Use a
single family throughout the product. Avoid mixing display fonts into
dense dashboard UI.

  Role            Style
  --------------- ---------------------------------------
  Page title      28--32px, 600, tight tracking
  Section title   16--18px, 600
  Card title      13--14px, 600
  Body            14px, 400, line-height 1.5
  Supporting      12--13px, 400
  Metric          28--32px, 600, tabular numerals
  Eyebrow         11px, 600, uppercase, modest tracking
  Button          13px, 550--600

Use tabular numerals for all metrics and timestamps. Avoid oversized
marketing typography inside the app.

### Iconography

-   Use Lucide icons, 16--18px in most controls.
-   Stroke width around 1.75--2.
-   Keep icons optically aligned with text.
-   Do not mix emoji, filled icon packs and outline icons in the same
    navigation.
-   Platform logos may use official/simple brand marks if already
    available; otherwise use text labels and neutral channel icons.

### Shape, borders and elevation

-   Main app radius: 12px.
-   Inputs and buttons: 8--10px.
-   Small badges: 6px or pill only when appropriate.
-   Cards: 1px border, white surface, no heavy shadow.
-   Popovers and dialogs: subtle shadow, clear border.
-   Avoid nested cards inside cards. Use section dividers and spacing
    instead.

------------------------------------------------------------------------

# PART II --- PRODUCT EXPERIENCE

## 4. Product design principles

### 4.1 One workspace, one story

The six modules must feel like parts of one operating system. Keep the
same shell, page header, filters, spacing and interaction language.

### 4.2 Show the work

Use realistic content previews, actual calendar items, meaningful chart
labels and believable insight evidence. Avoid generic placeholder blocks
and decorative illustrations.

### 4.3 AI is a tool, not the visual identity

The Studio can be the most expressive module, but it should still feel
like a writing and planning tool. No glowing gradients, fake chat
bubbles everywhere, animated neural networks or "AI magic" badges.

### 4.4 Explain the evidence

Every insight should point to a metric, comparison or sample content
item. Make it possible to inspect the source behind the recommendation.

### 4.5 Keep human control visible

Users edit, choose, schedule and mark insights reviewed. All publishing
actions remain simulated.

### 4.6 Dense where useful, calm everywhere else

Analytics can be information-dense. Dashboard and planner should
prioritize scanning. Studio should prioritize writing and previewing.

## 5. Information architecture and navigation

Primary navigation, in this order:

1.  **Overview** `/dashboard`
2.  **Studio** `/studio`
3.  **Planner** `/planner`
4.  **Publishing** `/publishing`
5.  **Analytics** `/analytics`
6.  **Insights** `/insights`

Sidebar footer: - Workspace switcher: "Northstar Studio" (seeded demo
workspace) - Help / keyboard shortcuts (optional, non-primary) - Avatar
menu labelled "Demo account" (do not imply authentication)

### Application shell

**Desktop (≥ 1200px)** - Fixed or sticky left sidebar: 232px wide. -
Main content fills remaining width, max content width around 1440px. -
Top header: 64px high. - Main page padding: 28--32px. - Sidebar
background: `#F1F2EC` or canvas tint, separated by a subtle border. -
Main content background: `#F7F7F3`.

**Tablet (768--1199px)** - Collapsible sidebar, default compact at
72px. - Main page padding: 24px. - Tables may horizontally scroll only
if a compact column layout cannot preserve meaning.

**Mobile (\<768px)** - Sidebar becomes a compact top bar or bottom
navigation with the six destinations grouped sensibly. - Prioritize
Overview, Studio and Planner in the primary mobile nav; remaining routes
remain reachable through "More". - Stack cards, filters and charts. -
Calendar defaults to agenda/list view. - Studio editor and preview stack
vertically. - Never force desktop-width tables onto a phone.

### Header

Left: breadcrumb or page title context.\
Right: date context / sample data indicator, contextual action,
notification only if it has a real demo interaction, avatar.

A persistent, subtle **"Demo workspace · Sample data"** indicator should
appear in the header or workspace switcher. Do not use a large warning
banner on every page.

## 6. Page specifications

### 6.1 Overview dashboard --- `/dashboard`

**User question:** "What is happening with our content, and what needs
my attention?"

**Page header** - Eyebrow: `WORKSPACE` - Title: `Good afternoon` or
`Overview` (prefer stable "Overview" for demo consistency). - Supporting
copy: "A clear view of what's planned, what's working and what to try
next." - Right action: `Create content` (primary, opens Studio).

**Layout** 1. KPI strip: four cards in one row on desktop. 2. Main row:
performance trend (8 columns) + channel mix (4 columns). 3. Lower row:
upcoming content (7 columns) + top content (5 columns). 4. Bottom: one
featured insight with evidence and a `Explore insight` action.

**KPI cards** - Impressions - Engagement rate - Posts published -
Followers gained

Each card includes: - Label. - Main value. - Change vs previous period
(sample comparison). - Tiny neutral trend line only if it adds
meaning. - Tooltip or helper text defining the metric. - No oversized
icon in a colored circle.

Use sample values that feel coherent with seeded analytics. Clearly
identify them as demo data.

**Performance chart** - Recharts line or area chart. - Default range:
Last 30 days. - Platform filter: All / Instagram / LinkedIn. - X-axis:
dates with restrained ticks. - Y-axis: compact values. - Tooltip
includes date, channel and metric. - Avoid gradient fills and excessive
grid lines. - Legend uses direct labels and small dots.

**Channel mix** - Show Instagram and LinkedIn as two rows with
impressions and engagement rate. - Avoid a giant donut chart unless the
data story genuinely requires it.

**Upcoming content** - List 3--4 scheduled items with format
thumbnail/letter, title, platform, date and status. - Clicking opens a
content detail drawer or Planner item.

**Top content** - Show thumbnail or format glyph, post title, platform,
key metric and performance label. - Click opens Analytics detail or
content preview.

**Featured insight** - Example: "Problem-led openings earned 18% more
saves in this sample." - Supporting evidence: number of posts compared
and metric window. - CTA: `See why` or `Use this pattern`.

**Interactions** - Date-range filter updates dashboard metrics and chart
using supported mock data. - Platform filter updates relevant data. -
Create content routes to Studio. - Content rows open a detail view. -
Insight CTA opens Insights with the relevant insight selected.

### 6.2 AI Content Studio --- `/studio`

**User question:** "Help me turn this campaign brief into a strong,
platform-ready piece of content."

This is the hero module. It should feel like a compact creative desk,
not a generic chat interface.

**Page header** - Title: `Studio` - Description: "Shape an idea into
content made for the channel." - Small label: `DEMO GENERATION` near the
generation control or result, not a persistent alarm. - Primary action:
`New brief` or `Generate content`.

**Desktop layout** - Main workspace: two columns, approximately 5/7. -
Left: brief composer, 440--500px. - Right: generated content and
platform preview. - Keep the result visible after generation; do not
replace the whole screen with a chat transcript.

**Brief composer fields** 1. Platform: Instagram / LinkedIn. 2. Format:
Post / Carousel / Reel. Reel only available for Instagram. 3. Objective:
Awareness / Engagement / Leads / Conversion. 4. Topic or campaign brief:
multiline, 3--5 rows. 5. Audience: short text field. 6. Tone: select
(e.g. Clear, Conversational, Expert, Bold, Warm). 7. Content pillar:
optional select (Educational, Entertaining, Thought leadership, Product,
Customer proof). 8. Optional CTA intent.

Use labels above inputs, not placeholder-only labels. Provide useful
example text in the topic field as placeholder, not prefilled content
that looks user-authored.

**Generate action** - Full-width primary button in composer footer. - On
click: show a brief local loading state (roughly 500--800ms simulated;
no fake token streaming). - Generate deterministic output based on
platform, format, objective and topic. - Display a small "Simulated
result" disclosure near output. - If the brief is empty, show inline
validation.

**Result area** - Header row: platform icon/label, format badge,
variation selector (A/B/C). - Actions: Copy, Save draft, Add to
planner. - Editable fields should be directly editable, with clear
labels. - Show a platform preview toggle or a realistic preview card.

**Output structures** - Instagram Post: caption, hashtags, CTA. -
Instagram Reel: opening hook, script, scene outline, CTA. - Instagram
Carousel: slide-by-slide copy, caption, CTA. - LinkedIn Post: opening
hook, body, CTA. - Hook variations: at least three alternative hooks.

**Platform preview** - Instagram: restrained mobile-post frame with
creator/workspace name, caption and media placeholder. Do not recreate
the entire Instagram app UI or use Instagram's exact interface. -
LinkedIn: text-first post preview with a neutral profile header and
realistic paragraph wrapping. - Carousel: stacked slide thumbnails or a
horizontal slide rail with editable slide text. - Reel: vertical 9:16
preview area with scene beats, captions and a play affordance that does
not pretend to play a real video.

**Empty state** - Show a simple starter prompt and one sample brief. -
No robot illustration. Use a typographic example card: "A practical
launch lesson for first-time founders".

**After generation** - Save draft updates shared local content state. -
Add to planner opens a date picker / scheduling dialog. - Copy uses
clipboard and shows a toast. - Regenerate changes the variation
deterministically. - Edit updates the shared item before saving. - The
result must flow into Planner and Publishing.

### 6.3 Content Planner --- `/planner`

**User question:** "What are we publishing, and is the mix balanced?"

**Header** - Title: `Planner` - Description: "A working calendar for the
ideas you intend to put into the world." - Primary action:
`Add content`. - View toggle: Month / List. - Filters: Platform, Status,
Content pillar.

**Month view** - 7-column calendar grid. - Weekday header and date
numbers. - Content entries as compact rows with platform dot, title and
format. - Limit visible items per day; show `+N more` for overflow. -
Current day has a restrained outline or accent marker. - Previous/next
month controls and `Today`. - Calendar cards must remain legible at
common laptop widths.

**List view** - Group by date. - Columns/fields: date, content title,
platform, format, pillar, status, actions. - On mobile, render stacked
list rows.

**Statuses** - Draft: neutral gray. - Planned: muted blue-gray. -
Scheduled: warm accent or dark green. - Published (simulated): green. -
Label must always accompany status color.

**Content detail** - Use a right-side Sheet for quick inspection and
editing. - Fields: title, platform, format, date/time, caption/brief,
status, content pillar. - Actions: Edit, Move date, Mark as scheduled,
Move to draft. - Do not expose "Publish now" as a real action. If shown
for demo flow, label it `Simulate publish`.

**Add content** - Opens a dialog or sheet with title, platform, format,
date, time and optional brief. - Allow a new blank draft or selecting
existing Studio draft. - Save to shared local state and reflect
immediately in calendar/list.

**Interactions** - Month navigation. - Month/list toggle. -
Platform/status filters. - Open item. - Edit item. - Change
date/status. - Add Studio result to a date. - Drag and drop is optional,
not required for MVP.

### 6.4 Publishing Center --- `/publishing`

**User question:** "What is queued, and what has been marked as
published in this demo?"

**Header** - Title: `Publishing` - Description: "Keep the handoff from
planned content to publish-ready content in view." - Persistent but
subtle status note: `Demo publishing · No social accounts connected`.

**Summary strip** - Ready to publish - Scheduled - Published this period

All values are local demo data.

**Queue** - Tabs: All / Instagram / LinkedIn. - Secondary filter:
Scheduled / Draft / Published. - List/table fields: content, channel,
scheduled for, status, action. - Preview content inline or via detail
sheet. - Actions: Edit, Move to planner, Mark as published
(simulated). - When simulated status changes, show toast and update
Dashboard/Planner/Publishing consistently.

**History** - Recently published (simulated) list with timestamp and
channel. - Label the section `Demo history` or `Simulated history`.

**Empty state** - "Nothing in the queue yet." - CTA: `Plan a post`.

**Important interaction rule** No action may invoke a social platform,
external API or network publishing request. Avoid green "Live"
indicators.

### 6.5 Analytics --- `/analytics`

**User question:** "Which content and creative choices are earning
attention?"

**Header** - Title: `Analytics` - Description: "Compare the content,
formats and openings behind the numbers." - Sample-data disclosure
visible in page chrome. - Filters: Date range, Platform, Format, Content
pillar.

**KPI strip** - Impressions - Reach - Engagement rate - Video views
(where applicable) - Saves or shares as secondary metric

**Chart layout** 1. Performance over time: line chart with impressions
and engagement rate toggle. Avoid plotting unrelated scales on one axis.
2. Platform comparison: grouped horizontal bars for Instagram and
LinkedIn. 3. Format comparison: bar chart with posts, engagement rate or
saves. 4. Hook performance: ranked table or horizontal bar chart.

**Top-performing content table** Columns: - Content title - Platform -
Format - Hook type - Impressions - Engagement rate - Saves / shares -
Published date

Sort by metric. Row click opens detail drawer with: - Content preview. -
Key performance values. - Hook category. - Comparison context. - Related
insight if present.

**Hook comparison** Use the PRD's hook types: - Problem-focused -
Curiosity - Benefit-led - Contrarian - Storytelling - Question-led

Show sample size alongside averages. Avoid claiming statistical
significance or causality. Example: "Problem-focused · 6 posts · 5.8%
average engagement".

**Filters** - All filters must update every relevant chart/table. -
Provide a clear `Reset` action. - If a filter returns no data, show a
useful empty state and keep the filters visible. - Do not fabricate
interpolated data for unsupported date ranges.

### 6.6 AI Insights --- `/insights`

**User question:** "What did we learn, and what should we try next?"

This is the differentiator. Treat it as a thoughtful editorial analysis
page, not a feed of AI-generated cards.

**Header** - Title: `Insights` - Description: "Patterns from this
sample, translated into practical next moves." - Small disclosure:
`Rule-based demo insights · Sample data`.

**Featured recommendation** - One prominent insight at top. - Headline:
a specific observation. - Evidence: sample size, metric, comparison and
time window. - Interpretation: one or two sentences. - Suggested
experiment: a concrete action. - CTA: `Use in Studio`.

Example: - Observation: "Problem-focused openings earned more saves than
generic educational openings." - Evidence: "6 posts · 5.8% average
engagement · 1.4× the sample average." - Interpretation: "Specific
tension may be giving readers a stronger reason to continue." -
Experiment: "Create two Reels that open with a recognisable audience
problem, then compare saves per reach."

**Insight categories** - Winning hooks - Format patterns - Content
pillar patterns - Platform differences - Suggested experiments -
Recommended next content actions

**Insight card anatomy** - Category label. - Clear headline. - Evidence
line. - Brief explanation. - Confidence/sample-size qualifier. -
Actions: `View evidence`, `Use in Studio`, `Save`, `Mark reviewed`.

**Evidence drawer** - Show the underlying posts and metrics. - Show the
rule used to derive the insight in plain language, e.g. "Average
engagement rate by hook type". - State that this is a deterministic rule
over seeded data.

**Use in Studio** - Route to Studio with topic, audience, platform,
format, objective and hook pattern prefilled where known. - The user can
edit all fields before generating. - Preserve source insight reference
in local state for the demo narrative.

**Reviewed and saved** - Local state only. - Saved/reviewed state must
be visually distinct but quiet. - Allow filter: All / Saved / Reviewed /
New.

------------------------------------------------------------------------

# PART III --- SYSTEM AND COMPONENTS

## 7. Design tokens and Tailwind implementation

Use CSS variables as the source of truth, with Tailwind semantic colors
mapped to them. Keep tokens centralized in `globals.css` and
`tailwind.config` only if the project version requires it.

Suggested semantic mapping:

``` css
:root {
  --background: 60 17% 96%;
  --foreground: 120 6% 9%;
  --card: 0 0% 100%;
  --card-foreground: 120 6% 9%;
  --popover: 0 0% 100%;
  --popover-foreground: 120 6% 9%;
  --primary: 80 72% 59%;
  --primary-foreground: 85 55% 9%;
  --secondary: 90 18% 91%;
  --secondary-foreground: 120 6% 15%;
  --muted: 80 12% 93%;
  --muted-foreground: 110 4% 46%;
  --accent: 80 18% 91%;
  --accent-foreground: 120 6% 15%;
  --destructive: 5 50% 51%;
  --destructive-foreground: 0 0% 100%;
  --border: 90 10% 89%;
  --input: 90 10% 89%;
  --ring: 80 72% 59%;
  --radius: 0.75rem;
}
```

If the existing shadcn setup uses OKLCH tokens, preserve that convention
and translate the palette accurately. Do not introduce a second token
system.

### Spacing scale

Use Tailwind's default 4px rhythm.

-   4px: icon-to-label micro gap.
-   8px: compact control spacing.
-   12px: related content.
-   16px: card internal rhythm.
-   20--24px: section groups.
-   28--32px: page gutters.
-   40--48px: major section separation.

### Layout widths

-   Sidebar: 232px desktop.
-   Header: 64px.
-   Main content max width: 1440px.
-   Standard card padding: 18--20px.
-   Form field height: 40px.
-   Button height: 36px default, 40px primary.
-   Table row: 52--60px depending on density.

## 8. shadcn/ui component inventory

Use existing generated shadcn components. Add only what is needed.

  Component            Use
  -------------------- ----------------------------------------------
  Button               Primary and secondary actions
  Input                Short text fields
  Textarea             Brief and editable copy
  Select               Platform, format, objective, tone
  Tabs                 Analytics/platform and planner view switches
  Card                 KPI, insight and content sections
  Badge                Status, format and platform labels
  Tooltip              Metric definitions and icon-only controls
  Dropdown Menu        Row actions and account menu
  Sheet                Content details and evidence
  Dialog               Add content and scheduling
  Popover + Calendar   Date selection
  Table                Analytics and publishing lists
  Separator            Quiet section division
  Skeleton             Brief loading state
  Toast / Sonner       Save, copy and status feedback
  Checkbox             Multi-filter selections
  Toggle Group         Month/List or chart metric toggles
  Scroll Area          Sidebar and compact overflow where required

**Composition rule:** shadcn components are primitives. Avoid rendering
every section as a Card. Use semantic headings, whitespace, dividers and
plain layout containers to create hierarchy.

## 9. Shared component specifications

### `AppSidebar`

-   Brand mark + Signalry wordmark.
-   Six primary destinations.
-   Active route indicated by soft surface and narrow accent marker.
-   Workspace switcher at bottom.
-   Keyboard focus visible.
-   On mobile, use a compact navigation pattern.

### `AppHeader`

-   Page context.
-   Sample-data label.
-   Contextual primary action.
-   Demo account menu.
-   Keep height and alignment consistent across routes.

### `PageHeader`

-   Title, concise description, actions.
-   Optional eyebrow for section context.
-   Consistent bottom spacing.

### `MetricCard`

-   Label, value, period delta, optional sparkline.
-   Tabular numerals.
-   Tooltip definition.
-   No colored icon tile by default.

### `PlatformBadge`

-   Small icon or text label.
-   Instagram / LinkedIn.
-   Neutral background with subtle brand cue.
-   Never use a giant platform-color pill.

### `StatusBadge`

-   Draft, Planned, Scheduled, Published (simulated).
-   Text always visible.

### `ContentRow`

-   Title and format.
-   Platform.
-   Date/time.
-   Status.
-   Contextual action.
-   Entire row keyboard accessible if clickable.

### `ContentPreview`

-   Platform-specific, but not a pixel-perfect social app clone.
-   Supports post, carousel, Reel and LinkedIn.
-   Editable mode and read-only preview mode.

### `InsightCard`

-   Category, observation, evidence, recommendation and actions.
-   Prominent insight should be one level more visually important than
    secondary insights.

### `FilterBar`

-   Filters grouped logically.
-   Selected filters visible.
-   Reset action when non-default filters are active.
-   Mobile filters collapse into a sheet.

### `EmptyState`

-   Short, useful explanation.
-   One primary action.
-   No generic robot illustration.

### `DemoDataNotice`

-   Small text label or tooltip.
-   Explain sample data once in the shell and contextually on
    analytics/publishing pages.

## 10. Interaction and motion

### Motion principles

-   Functional, quick, almost invisible.
-   Motion should clarify a state change, not decorate the interface.
-   Prefer opacity and small position changes.
-   Respect `prefers-reduced-motion`.

### Timing

-   Hover/focus: 100--140ms.
-   Menu/dialog: 140--180ms.
-   Sheet: 180--220ms.
-   Chart/filter update: 160--220ms.
-   Simulated generation: 500--800ms, with a clear loading state.

### Interaction rules

-   Every primary button performs an action.
-   Copy action copies the visible editable text and confirms with
    toast.
-   Save action updates shared local state.
-   Filters update the displayed dataset, not just their own labels.
-   Dialogs and sheets close with Escape and have accessible titles.
-   Avoid hover-only affordances.
-   Provide disabled states with a reason when necessary.
-   Never use fake progress bars that imply real model work.

------------------------------------------------------------------------

# PART IV --- DATA, STATES AND RESPONSIVE BEHAVIOUR

## 11. Mock data and product truth

All data is local and deterministic. Use a consistent seed dataset
across all modules so the investor walkthrough feels connected.

### Recommended seeded workspace

**Workspace:** Northstar Studio\
**Demo period:** Last 30 days\
**Channels:** Instagram and LinkedIn\
**Seed content:** 18--24 posts, including drafts, planned, scheduled and
simulated published posts.

### Required mock entities

``` ts
type Platform = "instagram" | "linkedin";
type ContentFormat = "post" | "carousel" | "reel";
type ContentStatus = "draft" | "planned" | "scheduled" | "published";
type Objective = "awareness" | "engagement" | "leads" | "conversion";
type HookType =
  | "problem"
  | "curiosity"
  | "benefit"
  | "contrarian"
  | "storytelling"
  | "question";

type ContentItem = {
  id: string;
  title: string;
  platform: Platform;
  format: ContentFormat;
  objective: Objective;
  pillar: string;
  hookType?: HookType;
  hook?: string;
  body: string;
  caption?: string;
  hashtags?: string[];
  cta?: string;
  scheduledAt?: string;
  publishedAt?: string;
  status: ContentStatus;
  metrics?: {
    impressions: number;
    reach: number;
    views?: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    profileVisits: number;
    followersGained: number;
    engagementRate: number;
  };
};
```

Create separate typed collections for: - `mock-posts.ts` -
`mock-analytics.ts` - `mock-campaigns.ts` - `mock-insights.ts`

Keep content IDs stable. Do not generate random IDs during render. Use a
small deterministic ID helper for newly created local items.

### Data consistency

-   Dashboard totals should aggregate from the same content/analytics
    source as Analytics.
-   Top-performing content should match the Analytics table.
-   Planner and Publishing should share the same content items.
-   Marking a post as published should update status in every module.
-   Insights should be derived from the seeded data using simple
    documented rules.
-   If the sample size is too small, show "Not enough sample posts"
    instead of inventing a pattern.

## 12. Deterministic demo generation

The mock generator should be rule-based and explainable. It may use a
small set of structured templates keyed by platform, format, objective
and hook type.

It must: - Change output when platform, format or objective changes. -
Return valid fields for each output format. - Provide 3 hook
variations. - Use the user's topic and audience in the copy. - Avoid
repeating one generic caption regardless of input. - Avoid claiming that
a language model was called. - Never make a network request.

A suitable module boundary:

``` ts
// lib/mock-ai.ts
export function generateDemoContent(input: StudioBrief): GeneratedContent {
  // Deterministic templates, no API call.
}
```

## 13. Shared frontend state

Use a small React context or a focused state store already present in
the repository. Do not add a state library solely for this MVP.

Shared state must cover: - Content items. - Current filters where
cross-page consistency matters. - Saved/reviewed insight IDs. - Selected
insight used to prefill Studio. - Demo date range if globally shared.

Derived data should be computed from the source state. Avoid duplicating
totals or maintaining separate copies of a content item per route.

Persistence is not required. If localStorage already exists in the
project and is useful, use a versioned schema and guard against
malformed data. Do not build persistence infrastructure.

## 14. Responsive and accessibility requirements

### Breakpoints

Use Tailwind defaults unless the repository defines its own: - `sm`:
640px - `md`: 768px - `lg`: 1024px - `xl`: 1280px - `2xl`: 1536px

### Accessibility

-   Semantic landmarks: nav, main, header, section.
-   One page-level `h1`.
-   Logical heading order.
-   Every input has a visible label.
-   Icon-only buttons have accessible names.
-   Focus ring is visible against both canvas and surface.
-   Charts include accessible summaries or adjacent tabular data.
-   Status is communicated with text, not color alone.
-   Dialogs and sheets trap focus and return focus on close.
-   Keyboard operation for navigation, menus, filters and content
    actions.
-   Respect reduced motion.
-   Meet WCAG AA contrast for text and controls.

------------------------------------------------------------------------

# PART V --- IMPLEMENTATION CONTRACT

## 15. Suggested project structure

Adapt to the existing repository rather than forcing a restructure.

``` text
src/
  app/
    layout.tsx
    page.tsx
    dashboard/page.tsx
    studio/page.tsx
    planner/page.tsx
    publishing/page.tsx
    analytics/page.tsx
    insights/page.tsx
    globals.css
  components/
    layout/
      app-shell.tsx
      app-sidebar.tsx
      app-header.tsx
      page-header.tsx
    shared/
      metric-card.tsx
      platform-badge.tsx
      status-badge.tsx
      filter-bar.tsx
      content-row.tsx
      content-preview.tsx
      content-detail-sheet.tsx
      empty-state.tsx
      demo-data-notice.tsx
    dashboard/
    studio/
    planner/
    publishing/
    analytics/
    insights/
    ui/                  # shadcn/ui generated primitives
  data/
    mock-posts.ts
    mock-analytics.ts
    mock-campaigns.ts
    mock-insights.ts
  lib/
    utils.ts
    mock-ai.ts
    analytics-engine.ts
    insight-engine.ts
    formatters.ts
  hooks/
  providers/
    workspace-provider.tsx
  types/
    index.ts
```

## 16. Engineering rules

-   Use TypeScript strict types for shared models.
-   Use App Router conventions already in the repo.
-   Keep page files thin; compose feature components.
-   Prefer server components for static page structure and client
    components only where interactivity is required.
-   Do not add API routes, server actions, database clients or backend
    abstractions.
-   Do not add a package unless a required feature cannot be implemented
    with existing dependencies.
-   Use Recharts only if already installed or justified by the current
    project.
-   Use Lucide icons consistently.
-   Avoid barrel imports where direct imports are straightforward.
-   Avoid unnecessary global state subscriptions.
-   Derive filtered lists and metrics from source state.
-   Use stable keys and IDs.
-   Keep components focused and avoid deeply nested conditional JSX.
-   Handle empty, loading, validation and error states.
-   No dead primary buttons or placeholder links.

## 17. Implementation sequence and ownership

### Phase 0 --- Inspect

-   Read the repository tree, package file, Tailwind configuration and
    shadcn setup.
-   Identify existing chart, toast, icon and calendar dependencies.
-   Read this design document once.
-   Do not edit files before inspection.

### Phase 1 --- Contract

-   Define route names, shared types, tokens and mock data contracts.
-   Establish the workspace state contract.
-   Confirm which existing UI primitives can be reused.

### Phase 2 --- Shell

-   Build sidebar, header, page container and navigation.
-   Apply design tokens.
-   Validate responsive shell before feature implementation.

### Phase 3 --- Features

-   Workstream A: Studio, Planner and Publishing.
-   Workstream B: Dashboard, Analytics and Insights.
-   Keep shared types, state provider and mock data under one owner.
-   Avoid parallel edits to the same files.

### Phase 4 --- Connect the loop

-   Studio result → saved draft → Planner → Publishing.
-   Analytics → Insights evidence.
-   Insight recommendation → prefilled Studio brief.
-   Status updates reflected across modules.

### Phase 5 --- QA

-   Type check.
-   Lint.
-   Production build.
-   Route smoke test.
-   Test primary interactions.
-   Verify desktop, tablet and mobile layouts.
-   Confirm all sample-data disclosures.

### Phase 6 --- Investor demo review

Run the five-minute demo in the exact sequence below and remove any
friction.

## 18. Five-minute investor demo

  -----------------------------------------------------------------------
  Time                    Screen                  Story
  ----------------------- ----------------------- -----------------------
  0:00--1:00              Overview                Show the workspace,
                                                  channel mix,
                                                  performance trend and
                                                  upcoming content

  1:00--2:00              Studio                  Enter a campaign brief,
                                                  generate Instagram Reel
                                                  hooks and LinkedIn copy

  2:00--3:00              Planner + Publishing    Edit the result, add it
                                                  to the calendar and
                                                  show the simulated
                                                  queue

  3:00--4:00              Analytics               Compare formats and
                                                  hooks using the sample
                                                  dataset

  4:00--5:00              Insights → Studio       Open an evidence-backed
                                                  recommendation and use
                                                  it to start the next
                                                  brief
  -----------------------------------------------------------------------

The final line of the product story:

**Signalry doesn't stop at helping you make content. It helps you
understand what worked, and make the next decision with more context.**

## 19. Definition of done

-   [ ] Six routes are accessible through persistent navigation.
-   [ ] Brand tokens and typography are consistent.
-   [ ] The app feels like one product, not six dashboard templates.
-   [ ] Dashboard metrics and charts use coherent seeded data.
-   [ ] Studio generates deterministic platform-specific outputs.
-   [ ] Outputs are editable, copyable and saveable.
-   [ ] Studio content flows into Planner.
-   [ ] Planner supports month/list views and filters.
-   [ ] Publishing queue updates from shared state and is clearly
    simulated.
-   [ ] Analytics filters and comparisons work.
-   [ ] Hook comparisons show sample size and evidence.
-   [ ] Insights are deterministic, explainable and evidence-backed.
-   [ ] Insights can prefill a new Studio brief.
-   [ ] All primary actions work and provide feedback.
-   [ ] Empty, loading, validation and error states are covered.
-   [ ] Desktop and tablet are polished; mobile remains usable.
-   [ ] No real integration, AI generation or publishing is implied.
-   [ ] Type check and production build pass.

------------------------------------------------------------------------

# APPENDIX A --- DO / DON'T

  -----------------------------------------------------------------------
  Do                                  Don't
  ----------------------------------- -----------------------------------
  Use real-looking sample content and Use lorem ipsum or random metric
  coherent data                       values

  Use whitespace and hierarchy to     Put every section in a floating
  organize the page                   card

  Use one restrained accent color     Make every metric a different color

  Show evidence behind insights       Present generic AI advice as fact

  Use clear labels for simulated      Show fake "Live" account indicators
  states                              

  Make Studio a focused creative      Make the entire product look like a
  workspace                           chatbot

  Keep charts legible and purposeful  Add charts just to fill empty space

  Use shadcn as accessible primitives Ship the default shadcn starter
                                      aesthetic

  Make interactions update shared     Use buttons that only look
  state                               clickable

  Treat mobile as a real layout       Shrink the desktop dashboard until
                                      it breaks
  -----------------------------------------------------------------------

# APPENDIX B --- FINAL DESIGN REVIEW CHECKLIST

Before calling the UI done, ask:

1.  Does the first screen explain the product's value within five
    seconds?
2.  Is it immediately clear that this is a content workspace, not a
    generic AI chatbot?
3.  Can the user see the relationship between content creation and
    performance learning?
4.  Does every insight show evidence and a next action?
5.  Does the UI feel calm, editorial and intentional at realistic data
    density?
6.  Are sample metrics and simulated publishing unmistakably honest?
7.  Can a first-time investor complete the entire demo without
    explanation?
8.  Are any visual elements present only because "AI products usually
    have them"? Remove them.
