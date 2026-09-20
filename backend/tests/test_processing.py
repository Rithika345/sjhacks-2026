from routers.processing import linear_regression_slope, process_videos


# ---- linear_regression_slope ----

def test_slope_of_rising_values_is_positive():
    assert linear_regression_slope([1, 2, 3, 4, 5]) > 0


def test_slope_of_falling_values_is_negative():
    assert linear_regression_slope([5, 4, 3, 2, 1]) < 0


def test_slope_of_flat_values_is_zero():
    assert linear_regression_slope([3, 3, 3, 3]) == 0


def test_slope_with_fewer_than_two_points_is_zero():
    assert linear_regression_slope([]) == 0
    assert linear_regression_slope([7]) == 0


# ---- process_videos ----

def _video(title, published, views, likes, comments, tags=None):
    return {
        "snippet": {"title": title, "publishedAt": published, "tags": tags or []},
        "statistics": {"viewCount": str(views), "likeCount": str(likes), "commentCount": str(comments)},
    }


def test_process_videos_empty_list_does_not_crash():
    result = process_videos([])
    assert result["footprint"]["total_videos"] == 0
    assert result["footprint"]["total_views"] == 0
    assert result["mirror"]["weekly_data"] == []
    assert result["mirror"]["burnout_score"] == 0
    assert result["viral"]["best_day"] == "Not enough data"


def test_process_videos_computes_total_views_and_video_count():
    videos = [
        _video("Cooking pasta at home", "2026-01-01T12:00:00Z", 1000, 100, 10, ["cooking", "pasta"]),
        _video("Homemade pizza night", "2026-01-08T12:00:00Z", 2000, 200, 20, ["cooking", "pizza"]),
    ]
    result = process_videos(videos)
    assert result["footprint"]["total_videos"] == 2
    assert result["footprint"]["total_views"] == 3000


def test_process_videos_dominant_category_matches_content():
    videos = [
        _video("Cooking pasta at home", "2026-01-01T12:00:00Z", 1000, 100, 10, ["cooking", "recipe"]),
        _video("Homemade pizza night", "2026-01-08T12:00:00Z", 2000, 200, 20, ["cooking", "recipe"]),
        _video("My gaming PC build", "2026-01-15T12:00:00Z", 100, 5, 1, ["tech", "PC", "build"]),
    ]
    result = process_videos(videos)
    # Cooking videos dominate views (3000 vs 100), so food_cooking should win.
    assert result["footprint"]["dominant_category"] == "food_cooking"


def test_process_videos_view_weighted_topics_favor_high_view_videos():
    videos = [
        _video("Viral obscureterm video", "2026-01-01T12:00:00Z", 100000, 9000, 900, ["obscureterm"]),
        _video("Flop uniquetag video", "2026-01-08T12:00:00Z", 10, 1, 0, ["uniquetag"]),
    ]
    result = process_videos(videos)
    top_topics = result["footprint"]["top_topics"]
    # The high-view video's tag should outrank the near-zero-view video's tag,
    # since scoring is view-weighted, not a flat word count.
    assert top_topics.index("obscureterm") < top_topics.index("uniquetag")


def test_process_videos_best_day_reflects_highest_engagement():
    # Two videos on the same day with strong engagement, one on another day
    # with weak engagement — Wednesday should win.
    videos = [
        _video("Wednesday hit one", "2026-02-04T12:00:00Z", 1000, 500, 100, ["a"]),  # Wed, high engagement
        _video("Wednesday hit two", "2026-02-11T12:00:00Z", 1000, 500, 100, ["a"]),  # Wed, high engagement
        _video("Monday flop", "2026-02-02T12:00:00Z", 1000, 5, 1, ["a"]),  # Mon, low engagement
    ]
    result = process_videos(videos)
    assert result["viral"]["best_day"] == "Wednesday"
