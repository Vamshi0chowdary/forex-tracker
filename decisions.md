# Problem Understanding

The real problem was not absolute real-time precision. It was user trust.

For a free forex viewer, users do not leave because a quote is a few seconds old. They leave when the app fails outright, looks broken, or cannot explain what it is showing. If APIs fail often, or the UI appears stale without context, the product feels unreliable even when the data is technically correct.

# Product Prioritization

I prioritized reliability, graceful degradation, and transparency because those are the behaviors that protect trust in a free-tier product.

I intentionally did not spend time on charts, authentication, realtime streaming, or advanced analytics. Those features add surface area, but they do not fix the core experience when the upstream APIs are unstable. The fastest path to a strong assignment was to make the app dependable first and clearly communicate when it was using fallback or cached data.

# API Selection

I chose exchangerate.host, open.er-api.com, and frankfurter.app because they are low-friction public sources with no authentication and minimal setup cost.

That matters for a small assignment because it keeps the implementation simple, deployable, and easy to reason about. The goal was not to optimize for the deepest data coverage. The goal was to use free APIs that were practical, accessible, and reliable enough to support a fallback chain.

# Fallback Strategy

I used a provider priority order so the system has a deterministic first choice and a predictable failover path.

If the first provider fails, the service automatically retries once and then falls through to the next provider. If all providers fail, the app returns cached data instead of a hard error. That design keeps the user experience useful under failure and ensures the system always prefers showing something meaningful over showing nothing.

# Cache Strategy

I used a 5 minute in-memory cache to improve reliability and perceived speed.

The cache reduces dependency on live provider availability, smooths out temporary outages, and makes repeat views feel fast. For this assignment, in-memory storage was the right tradeoff because it is lightweight, easy to understand, and enough to demonstrate the reliability pattern without adding infrastructure.

# Handling Stale Data

I chose to show stale data instead of an "Unable to fetch rates" error because continuity matters more than perfect freshness for free-tier users.

If the service can still show a cached quote with clear stale labeling, the user stays oriented and retains trust in the product. A stale response is not ideal, but it is better than a dead end. That is especially important in a utility app where users mainly want quick answers, not perfect market timing.

# Conflicting Provider Data

When providers returned conflicting data, I used the first successful provider.

That choice is simple, predictable, and reliable under time pressure. It avoids blending snapshots from different update windows and keeps the response deterministic. For this assignment, consistency mattered more than trying to reconcile minor provider differences.

# Premium API Budget Strategy

If premium APIs were available, I would reserve them for high-intent users, volatility spikes, onboarding flows, and outage scenarios.

That is the right place to spend budget because those moments have the highest product value. Premium routing should not be the default for every request. It should be used when reliability risk or user value is highest, so costs are aligned with business impact.

# What Was Intentionally Cut

I intentionally cut Redis, authentication, charts, historical analytics, websockets, and databases.

That was a deliberate MVP decision to maximize reliability-focused delivery within 60 minutes. Every cut reduced surface area and let me focus on the part of the product that mattered most for the assignment: a stable, transparent, easy-to-run forex viewer.

# Future Improvements

If this moved beyond the assignment, I would add Redis, provider health scoring, anomaly detection, smart premium routing, historical charts, and alerts.

Those additions would improve scale, observability, and user value, but they make sense only after the core reliability experience is already solid.