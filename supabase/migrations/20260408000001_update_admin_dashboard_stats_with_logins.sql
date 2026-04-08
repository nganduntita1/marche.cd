-- Update admin dashboard stats function to include login metrics.

CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text := lower(
    coalesce(
      auth.jwt() -> 'app_metadata' ->> 'role',
      auth.jwt() -> 'app_metadata' ->> 'user_role',
      auth.jwt() -> 'user_metadata' ->> 'role',
      auth.jwt() -> 'user_metadata' ->> 'user_role',
      ''
    )
  );
  v_start_today     timestamptz := date_trunc('day', now());
  v_start_week      timestamptz := date_trunc('week', now());
  v_start_month     timestamptz := date_trunc('month', now());
  v_result          jsonb;
BEGIN
  IF v_role NOT IN ('admin', 'super_admin', 'owner') THEN
    RAISE EXCEPTION 'admin_only'
      USING ERRCODE = '42501',
            MESSAGE = 'Only admin users can access dashboard metrics';
  END IF;

  WITH user_stats AS (
    SELECT
      COUNT(*)::int                                                        AS total,
      COUNT(*) FILTER (WHERE created_at >= v_start_today)::int            AS joined_today,
      COUNT(*) FILTER (WHERE created_at >= v_start_week)::int             AS joined_this_week
    FROM public.users
  ),
  login_stats AS (
    SELECT
      COUNT(*)::int                                                        AS total_logins,
      COUNT(*) FILTER (WHERE logged_in_at >= v_start_today)::int          AS logins_today,
      COUNT(*) FILTER (WHERE logged_in_at >= v_start_week)::int           AS logins_this_week,
      COUNT(*) FILTER (WHERE logged_in_at >= v_start_month)::int          AS logins_this_month,
      COUNT(DISTINCT user_id) FILTER (WHERE logged_in_at >= v_start_today)::int   AS unique_users_today,
      COUNT(DISTINCT user_id) FILTER (WHERE logged_in_at >= v_start_week)::int    AS unique_users_this_week
    FROM public.user_logins
  ),
  listing_stats AS (
    SELECT
      COUNT(*)::int                                                        AS total,
      COUNT(*) FILTER (WHERE status = 'active')::int                      AS active,
      COUNT(*) FILTER (WHERE status = 'sold')::int                        AS sold,
      COUNT(*) FILTER (WHERE created_at >= v_start_today)::int            AS posted_today,
      COUNT(*) FILTER (WHERE created_at >= v_start_week)::int             AS posted_this_week
    FROM public.listings
  ),
  credit_stats AS (
    SELECT
      COUNT(*)::int                                                        AS total_requests,
      COUNT(*) FILTER (WHERE status = 'pending')::int                     AS pending_requests,
      COUNT(*) FILTER (WHERE status = 'completed')::int                   AS completed_requests,
      COUNT(*) FILTER (WHERE status = 'cancelled')::int                   AS cancelled_requests,
      COALESCE(SUM(amount)   FILTER (WHERE status = 'completed'), 0)::numeric AS total_revenue_completed,
      COALESCE(SUM(credits)  FILTER (WHERE status = 'completed'), 0)::int     AS total_credits_completed,
      COUNT(*) FILTER (WHERE created_at >= v_start_today)::int            AS purchases_today
    FROM public.credit_purchases
  ),
  top_categories AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'category_name', category_name,
        'listing_count', listing_count
      )
      ORDER BY listing_count DESC
    ) AS data
    FROM (
      SELECT
        COALESCE(c.name, 'Sans categorie') AS category_name,
        COUNT(*)::int                       AS listing_count
      FROM public.listings l
      LEFT JOIN public.categories c ON c.id = l.category_id
      GROUP BY COALESCE(c.name, 'Sans categorie')
      ORDER BY COUNT(*) DESC
      LIMIT 8
    ) ranked
  )
  SELECT jsonb_build_object(
    'users', jsonb_build_object(
      'total',             u.total,
      'joined_today',      u.joined_today,
      'joined_this_week',  u.joined_this_week
    ),
    'logins', jsonb_build_object(
      'total_logins',          l.total_logins,
      'logins_today',          l.logins_today,
      'logins_this_week',      l.logins_this_week,
      'logins_this_month',     l.logins_this_month,
      'unique_users_today',    l.unique_users_today,
      'unique_users_this_week', l.unique_users_this_week
    ),
    'listings', jsonb_build_object(
      'total',             ls.total,
      'active',            ls.active,
      'sold',              ls.sold,
      'posted_today',      ls.posted_today,
      'posted_this_week',  ls.posted_this_week
    ),
    'credits', jsonb_build_object(
      'total_requests',          c.total_requests,
      'pending_requests',        c.pending_requests,
      'completed_requests',      c.completed_requests,
      'cancelled_requests',      c.cancelled_requests,
      'total_revenue_completed', c.total_revenue_completed,
      'total_credits_completed', c.total_credits_completed,
      'purchases_today',         c.purchases_today
    ),
    'top_categories', COALESCE(t.data, '[]'::jsonb)
  )
  INTO v_result
  FROM user_stats u
  CROSS JOIN login_stats l
  CROSS JOIN listing_stats ls
  CROSS JOIN credit_stats c
  CROSS JOIN top_categories t;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_dashboard_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_stats() TO authenticated;
