from dotenv import load_dotenv
load_dotenv()

import os
from anthropic import Anthropic

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def clean_json(text):
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()

def interpret_footprint(footprint_data, channel_name, consumption=None):
    """Claude reads YOUR computed metrics and writes the identity summary"""
    
    consumption_block = ""
    if consumption:
        consumption_block = f"""
PRIVATE CONSUMPTION DATA (what this creator watches/likes — not visible to their audience):
Liked Videos Count: {consumption.get('liked_video_count', 0)}
Topics They Consume: {consumption.get('liked_topics', [])}
Channels They Subscribe To: {consumption.get('subscriptions', [])}

IMPORTANT: Compare their PUBLIC content identity with their PRIVATE consumption. Flag any gaps that could create cancel risk if exposed. For example, if they publicly post wholesome cooking but privately consume controversial political content, that's a risk surface."""

    prompt = f"""You are analyzing a content creator's digital footprint. You received pre-computed metrics from our analysis pipeline. Return ONLY valid JSON with these exact keys.

Creator: {channel_name}
Top Topics (view-weighted): {footprint_data['top_topics']}
Topic Scores: {footprint_data.get('topic_scores', {})}
Concentration Risk: {footprint_data['concentration_risk']}%
Dominant Category: {footprint_data.get('dominant_category', 'unknown')}
Category Breakdown: {footprint_data.get('category_breakdown', {})}
Total Videos: {footprint_data['total_videos']}
Total Views: {footprint_data['total_views']}
Average Views Per Video: {footprint_data.get('avg_views', 0)}
{consumption_block}

Return JSON:
{{
  "topics_summary": "one sentence describing what this creator is publicly known for",
  "concentration_risk_note": "one sentence about how concentrated their content is, referencing the dominant category and percentage",
  "overton_window": "2-3 sentences describing what this creator can and cannot do without alienating their audience",
  "audience_expects": ["expectation 1", "expectation 2", "expectation 3"],
  "cancel_risk_flags": ["specific risk 1 based on data", "specific risk 2"],
  "consumption_gap": "one sentence about the gap between their public brand and private consumption, or 'No significant gap detected' if aligned"
}}"""

    response = client.messages.create(
        model="claude-sonnet-5",
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}]
    )
    return clean_json(response.content[0].text)


def interpret_mirror(mirror_data, viral_data):
    """Claude reads YOUR computed burnout score and explains it"""
    prompt = f"""You are interpreting a content creator's health metrics. These numbers were computed by our analysis pipeline using linear regression, not estimated. Return ONLY valid JSON.

Weekly Data (recent 10 weeks): {mirror_data['weekly_data'][-10:]}
Burnout Score: {mirror_data['burnout_score']}/100
Engagement Slope (linear regression): {mirror_data.get('engagement_slope', 0)} (negative = declining)
Upload Slope (linear regression): {mirror_data.get('upload_slope', 0)} (positive = producing more)
Best Posting Day: {viral_data['best_day']}
Best Posting Hour: {viral_data.get('best_hour', 'unknown')}
Day Breakdown: {viral_data['day_breakdown']}

Return JSON:
{{
  "health_label": "Healthy or Warning or Critical",
  "pattern": "2-3 sentences describing what the numbers show. Reference the regression slopes specifically.",
  "interpretation": "2 sentences in plain language about what this means for the creator",
  "recommendation": "one specific actionable recommendation, not generic advice",
  "viral_insight": "one sentence about optimal posting schedule based on day AND hour data"
}}"""

    response = client.messages.create(
        model="claude-sonnet-5",
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}]
    )
    return clean_json(response.content[0].text)


def interpret_sandbox(footprint_data, mirror_data, proposed_move):
    """Claude stress-tests a proposed move against the creator's actual profile"""
    prompt = f"""You are stress-testing a content creator's proposed move against their actual audience data. Return ONLY valid JSON.

Creator's Identity Profile: {footprint_data}
Creator's Health: burnout score {mirror_data['burnout_score']}/100, engagement slope {mirror_data.get('engagement_slope', 0)}
Proposed Move: {proposed_move}

Analyze this move against their actual audience. Return JSON:
{{
  "cancel_risk_score": 0-100,
  "audience_retention_estimate": "percentage of current audience likely to stay",
  "worst_case": ["worst interpretation 1", "worst interpretation 2", "worst interpretation 3"],
  "best_case": ["best outcome 1", "best outcome 2", "best outcome 3"],
  "execution_note": "one sentence on what makes or breaks this move"
}}"""

    response = client.messages.create(
        model="claude-sonnet-5",
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}]
    )
    return clean_json(response.content[0].text)


def sandbox_conversation(footprint_data, mirror_data, proposed_move, conversation_history, initial_report=None):
    """Multi-turn stress test — challenges the creator's assumptions"""
    
    report_context = ""
    if initial_report:
        report_context = f"""
The initial risk assessment for this move found:
- Cancel Risk Score: {initial_report.get('cancel_risk_score', 'N/A')}/100
- Audience Retention Estimate: {initial_report.get('audience_retention_estimate', 'N/A')}
- Worst Case Scenarios: {initial_report.get('worst_case', [])}
- Best Case Scenarios: {initial_report.get('best_case', [])}
- Key Execution Note: {initial_report.get('execution_note', 'N/A')}

Use these findings to ground your challenges. Reference specific numbers."""

    system_prompt = f"""You are a brutally honest strategic stress-tester for content creators. You have access to this creator's actual data:

Identity Profile: {footprint_data}
Burnout Score: {mirror_data['burnout_score']}/100
Engagement Trend: {mirror_data.get('engagement_slope', 0)} (negative = declining)
Proposed Move: {proposed_move}
{report_context}

Your job is NOT to advise, validate, or conclude. You are a provocation engine. You:
- Surface assumptions the creator hasn't examined
- Ask pointed questions that expose blind spots
- Challenge the gap between what they THINK will happen and what their DATA suggests
- Never say "that's a great idea" or "you should do X"
- Never give more than 2-3 sentences per response, then ask ONE sharp question
- Reference specific numbers from their data when challenging them

If they give a vague answer, push harder. If they give a strong answer, find the next weak point. You are not mean — you are rigorous."""

    messages = []
    for msg in conversation_history:
        messages.append({"role": msg["role"], "content": msg["content"]})
    
    response = client.messages.create(
        model="claude-sonnet-5",
        max_tokens=500,
        system=system_prompt,
        messages=messages,
    )
    return response.content[0].text