# The Fifth Postulate — Claude Design Prompt

Copy everything below the line into Claude Design.

---

I'm building a web app called **The Fifth Postulate** — an AI-powered creative manager for independent YouTube content creators. This is a hackathon project being judged on design quality, originality, and technical implementation. I need a complete, polished, interactive prototype.

## Visual Identity — follow precisely

**Color scheme:** Soft red (think terracotta or muted vermillion, NOT bright red, NOT blood red) and cream/offwhite. The soft red is the accent and primary action color. The cream is the background and card color. Text is a warm dark brown or charcoal, never pure black.

**Texture:** The entire app should feel like a matte paper sketchbook. Subtle paper grain texture on backgrounds. Cards should feel like thick drawing paper — soft shadows, no harsh borders. Think Moleskine notebook meets premium creative tool.

**Decorative elements:** Soft geometric shapes — triangles, squares, circles — in a lighter cream or faded terracotta, placed around corners and margins of the layout. They should feel hand-placed, like stamps on a journal page. Not overwhelming, just atmospheric.

**Typography:** Use one distinctive serif or semi-serif font for headings (something like Playfair Display, Lora, or Crimson Text — pick one and commit) and a clean readable sans-serif for body text (something like Source Sans, Nunito, or DM Sans). The pairing should feel literary and warm, not corporate. Use the same fonts across every single view — no switching.

## Layout

Left sidebar navigation, narrow, cream-colored with soft red highlights on the active item. Five nav items with minimal elegant icons (no emoji): Footprint, Mirror, Sandbox, Vault, Cadence. Top bar shows "The Fifth Postulate" in the heading serif font, with a "Connect YouTube" button on the right styled as a soft red pill button.

## The Five Feature Views

Populate all views with realistic sample data for a fictional cooking and lifestyle creator called "Maya's Kitchen" who has been on YouTube for 2 years, has 45K subscribers, and is 6 months into a burnout pattern (posting frequency increased, per-video engagement declining).

### 1. Footprint — "Your Wrapped"

This is a Spotify Wrapped-style visual summary of the creator's YouTube activity. Design it to feel like a beautiful infographic on paper, not a data table. Show:

- Total views, likes, and comments for the past 6 months as large display numbers with subtle trend arrows
- Top 5 performing videos as a ranked visual list with thumbnail placeholders, titles, and view counts
- A content category breakdown as a soft donut chart or horizontal bar chart showing what percentage of content falls into which topics (e.g. Recipes 62%, Vlogs 18%, Kitchen Tips 12%, Travel 8%)
- Audience growth trajectory as a subtle sparkline
- Most active posting days as a small weekly heatmap
- A synthesis section at the bottom — a short paragraph in a highlighted paper-style card that reads something like: "Your Shorts get 3.2x the engagement of long-form uploads, but you only post one Short per month. Meanwhile, your Travel content outperforms Recipes in engagement rate despite being only 8% of your uploads."

The whole view should feel like opening a beautifully designed annual report about yourself.

### 2. Mirror — "Creative Health"

A health dashboard with a caring, supportive tone. Show:

- A composed chart: bars for weekly upload frequency, line overlay for engagement rate per video, spanning 6 months. Style the chart to match the paper aesthetic — soft grid lines, warm colors, no harsh contrasts
- A large health score (0-100) displayed as a circular gauge or large number with color coding: green above 70, amber 40-70, soft red below 40. For Maya, show it at 38 with a "Needs Attention" label
- An AI interpretation paragraph in a warm, caring tone: "You've increased your posting frequency by 40% over the past 8 weeks, but your engagement per video has dropped 22%. This pattern often precedes creative exhaustion. It might be time to step back and recharge."
- A "Taking a Meaningful Break" section styled as a paper card or booklet page, with practical strategies: how to batch content before stepping away, how to communicate a break to your audience without losing subscribers, what a structured rest period looks like (with a suggested duration based on the data), and how other creators have managed sustained output without burning out. Frame these as gentle suggestions, not commands.
- A "How Much Is Too Much?" section with a simple visual scale showing where Maya currently falls between "Sustainable Rhythm" and "Burnout Risk"

### 3. Sandbox — "Test Any Move"

This is where the AI provocateur lives. Design it as a two-panel layout:

**Left panel:** A large text area with a warm paper background where the creator types a proposed move. Placeholder text: "I'm thinking about pivoting from cooking to travel content..." Below the text area, a "Run Stress Test" button in soft red.

**Right panel:** Appears after submission. This is NOT a risk score or numerical rating. It's a series of thoughtful questions on paper-style cards, each one pushing back gently on the creator's assumptions. For the sample data, show questions like:

- "62% of your subscribers came for recipes. If you pivot to travel, what's your plan for the audience that stays?"
- "Your travel videos already outperform recipes in engagement rate. Have you considered a bridge series that combines both before a full pivot?"
- "What does this pivot look like if it fails? Can you return to recipes without losing credibility?"

Below the questions, show two data cards side by side:

- **Audience Retention Estimate** — a percentage with a horizontal bar (e.g. "Estimated 45-60% of current subscribers would stay through a gradual pivot")
- **New Audience Potential** — an estimate of new audience reach (e.g. "Travel content in your style could reach an estimated 15-25K new subscribers based on category benchmarks")

At the bottom, a small note in muted text: "These are questions, not answers. You decide."

### 4. Vault — "Protect Your Ideas"

This is where the AI provocateur also lives, but differently. Design it as:

**Idea input:** A text area where the creator writes an idea. Placeholder: "Describe your idea..."

**Provocateur response:** When the creator submits, BEFORE the idea gets locked, show a provocateur response in a paper card with a slightly different cream tone — the AI examines the idea and asks a sharpening question: "This sounds like it overlaps with standard meal-prep content that's already saturated on YouTube. What's your specific angle that makes this distinct?" with two buttons: "Let me refine" (takes them back to the text area) and "This is distinct — protect it" (triggers the lock animation).

**Lock animation:** A beautiful, slow animation of a lock closing over the idea card. The lock should feel hand-drawn or sketched, consistent with the paper aesthetic. It closes deliberately — this is the UI signature moment of the entire app.

**Post-lock display:** Once locked, the idea card shows: the SHA-256 hash in monospace font, a soft green "Protected" badge, a 60-day countdown timer, and a "Download Certificate" button.

**Previously vaulted ideas:** Below the input area, show a list of previously vaulted ideas with their expiration countdowns. As protection expires, the visual treatment degrades: the badge shifts from green to amber to gray, the paper card becomes more faded, the lock icon gradually opens. Ideas near expiration should look like aging paper.

### 5. Cadence — "Your Rhythm"

Clean analytics, no provocateur. Show:

- A weekly heatmap or timeline showing when the creator historically posts, with color intensity mapped to engagement performance in those time slots
- A "Best Performing Windows" section showing the top 3 time slots ranked by average engagement
- A "Next Recommended Window" card showing a specific date and time suggestion
- If Mirror's health score is in the amber or red zone, show a gentle banner at the top: "Mirror suggests you might benefit from a break before your next post. Consider waiting until [date]." This creates a visible connection between Mirror and Cadence.
- A "Rhythm Health" indicator — a simple visual showing whether the creator's posting pattern is consistent, erratic, or declining

## Final Note

Keep the entire app visually cohesive. Same fonts, same color palette, same paper texture, same geometric decorative elements across all five views. Everything should feel like it belongs in the same sketchbook.
