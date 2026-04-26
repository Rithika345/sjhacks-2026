from datetime import datetime, timezone

def linear_regression_slope(values):
    """Real linear regression — not just comparing averages"""
    n = len(values)
    if n < 2:
        return 0
    x_mean = (n - 1) / 2
    y_mean = sum(values) / n
    numerator = sum((i - x_mean) * (values[i] - y_mean) for i in range(n))
    denominator = sum((i - x_mean) ** 2 for i in range(n))
    if denominator == 0:
        return 0
    return numerator / denominator

def process_videos(videos):
    """
    Takes raw YouTube video data and computes derived metrics.
    This is YOUR analysis pipeline — Claude never sees the raw data.
    """
    
    sorted_vids = sorted(videos, key=lambda v: v["snippet"]["publishedAt"])
    
    timeline = []
    for v in sorted_vids:
        stats = v["statistics"]
        views = int(stats.get("viewCount", 0))
        likes = int(stats.get("likeCount", 0))
        comments = int(stats.get("commentCount", 0))
        published = v["snippet"]["publishedAt"]
        
        engagement_rate = (likes + comments) / views * 100 if views > 0 else 0
        
        timeline.append({
            "title": v["snippet"]["title"],
            "published": published,
            "views": views,
            "likes": likes,
            "comments": comments,
            "engagement_rate": round(engagement_rate, 2),
            "tags": v["snippet"].get("tags", []),
        })
    
    stopwords = {"the", "and", "for", "that", "this", "with", "from", "your", "you",
                 "are", "was", "were", "been", "have", "has", "had", "not", "but",
                 "what", "when", "how", "why", "who", "all", "can", "will", "just",
                 "more", "about", "into", "over", "after", "before", "between",
                 "each", "every", "both", "few", "most", "other", "some", "such",
                 "only", "than", "too", "very", "don't", "i'm", "it's", "that's",
                 "didn't", "won't", "isn't", "i've", "my", "me", "i", "a", "an",
                 "of", "in", "to", "on", "at", "is", "it", "so", "do", "if",
                 "or", "no", "up", "out", "by", "one", "its", "new", "get", "now"}

    # --- FOOTPRINT METRICS ---
    # View-weighted topic scoring — viral videos define your brand more
    total_views = sum(v["views"] for v in timeline)
    tag_score = {}
    for v in timeline:
        weight = v["views"] / max(total_views, 1)
        all_terms = v["tags"] + v["title"].lower().split()
        for tag in all_terms:
            tag = tag.lower().strip()
            if len(tag) > 2 and tag not in stopwords:
                tag_score[tag] = tag_score.get(tag, 0) + weight
    
    top_topics = sorted(tag_score.items(), key=lambda x: x[1], reverse=True)[:10]
    
    # Content category clustering
    categories = {"food_cooking": 0, "lifestyle_personal": 0, "challenge_entertainment": 0, "tech_review": 0, "other": 0}
    food_words = {"cooking", "recipe", "meal", "food", "kitchen", "baking", "dinner", "lunch", "breakfast", "cook", "homemade", "pasta", "soup", "pizza", "sauce"}
    lifestyle_words = {"lifestyle", "vlog", "personal", "life", "routine", "self care", "real talk", "honest", "mental health", "burnout"}
    challenge_words = {"challenge", "tried", "ranked", "rating", "tier list", "versus", "competition", "test", "experiment"}
    tech_words = {"tech", "setup", "review", "gadget", "PC", "build", "coding", "programming", "software", "tutorial"}
    
    for v in timeline:
        all_text = " ".join(v["tags"] + [v["title"].lower()])
        views = v["views"]
        if any(w in all_text for w in food_words):
            categories["food_cooking"] += views
        elif any(w in all_text for w in lifestyle_words):
            categories["lifestyle_personal"] += views
        elif any(w in all_text for w in challenge_words):
            categories["challenge_entertainment"] += views
        elif any(w in all_text for w in tech_words):
            categories["tech_review"] += views
        else:
            categories["other"] += views
    
    dominant_category = max(categories.items(), key=lambda x: x[1])
    concentration_risk = round(dominant_category[1] / max(total_views, 1) * 100, 1)
    
    # --- MIRROR METRICS ---
    weeks = {}
    for v in timeline:
        dt = datetime.fromisoformat(v["published"].replace("Z", "+00:00"))
        week_key = dt.strftime("%Y-W%U")
        if week_key not in weeks:
            weeks[week_key] = {"uploads": 0, "total_engagement": 0, "count": 0}
        weeks[week_key]["uploads"] += 1
        weeks[week_key]["total_engagement"] += v["engagement_rate"]
        weeks[week_key]["count"] += 1
    
    weekly_data = []
    for week, data in sorted(weeks.items()):
        avg_engagement = round(data["total_engagement"] / data["count"], 2) if data["count"] > 0 else 0
        weekly_data.append({
            "week": week,
            "uploads": data["uploads"],
            "avg_engagement": avg_engagement,
        })
    
    # Real burnout detection with linear regression
    engagement_values = [w["avg_engagement"] for w in weekly_data]
    upload_values = [w["uploads"] for w in weekly_data]
    
    engagement_slope = linear_regression_slope(engagement_values)
    upload_slope = linear_regression_slope(upload_values)
    
    # Burnout = uploads trending up AND engagement trending down
    burnout_score = 0
    if len(weekly_data) >= 4:
        # Normalize slopes to 0-100 scale
        eng_signal = max(0, -engagement_slope * 500)  # negative slope = bad
        upload_signal = max(0, upload_slope * 300)     # positive slope = producing more  # positive slope = producing more
        burnout_score = min(100, int(eng_signal + upload_signal))
    
    # Engagement decay rate (the actual regression slope)
    engagement_trend = round(engagement_slope, 4)
    
    # --- VIRAL METER ---
    day_engagement = {}
    hour_engagement = {}
    for v in timeline:
        dt = datetime.fromisoformat(v["published"].replace("Z", "+00:00"))
        day_name = dt.strftime("%A")
        hour = dt.hour
        if day_name not in day_engagement:
            day_engagement[day_name] = {"total_eng": 0, "total_views": 0, "count": 0}
        day_engagement[day_name]["total_eng"] += v["engagement_rate"]
        day_engagement[day_name]["total_views"] += v["views"]
        day_engagement[day_name]["count"] += 1
        
        hour_bucket = f"{hour:02d}:00"
        if hour_bucket not in hour_engagement:
            hour_engagement[hour_bucket] = {"total_eng": 0, "count": 0}
        hour_engagement[hour_bucket]["total_eng"] += v["engagement_rate"]
        hour_engagement[hour_bucket]["count"] += 1
    
    best_day = max(day_engagement.items(), key=lambda x: x[1]["total_eng"] / x[1]["count"]) if day_engagement else None
    best_hour = max(hour_engagement.items(), key=lambda x: x[1]["total_eng"] / x[1]["count"]) if hour_engagement else None
    
    # --- HIGH PERFORMERS ---
    sorted_by_engagement = sorted(timeline, key=lambda v: v["engagement_rate"], reverse=True)
    top_performers = sorted_by_engagement[:5]
    bottom_performers = sorted_by_engagement[-5:]
    
    return {
        "footprint": {
            "top_topics": [t[0] for t in top_topics],
            "topic_scores": {t[0]: round(t[1] * 100, 2) for t in top_topics},
            "concentration_risk": concentration_risk,
            "dominant_category": dominant_category[0],
            "category_breakdown": {k: round(v / max(total_views, 1) * 100, 1) for k, v in categories.items()},
            "total_videos": len(timeline),
            "total_views": total_views,
            "avg_views": round(total_views / max(len(timeline), 1)),
        },
        "mirror": {
            "weekly_data": weekly_data,
            "burnout_score": burnout_score,
            "engagement_slope": engagement_trend,
            "upload_slope": round(upload_slope, 4),
            "total_videos": len(timeline),
        },
        "viral": {
            "best_day": best_day[0] if best_day else "Not enough data",
            "best_hour": best_hour[0] if best_hour else "Not enough data",
            "day_breakdown": {k: round(v["total_eng"]/v["count"], 2) for k, v in day_engagement.items()},
            "hour_breakdown": {k: round(v["total_eng"]/v["count"], 2) for k, v in hour_engagement.items()},
        },
        "highlights": {
            "top_performers": [{"title": v["title"], "views": v["views"], "engagement": v["engagement_rate"]} for v in top_performers],
            "bottom_performers": [{"title": v["title"], "views": v["views"], "engagement": v["engagement_rate"]} for v in bottom_performers],
        },
        "timeline": timeline,
    }