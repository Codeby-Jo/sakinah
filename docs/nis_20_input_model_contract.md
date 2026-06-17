# NIS 20-Input Model Contract

NIS external required input is now planned as **20 crisp answers**.

## 1. Simplified Frontend Input
The system has moved away from the monolithic 85+ field UserProfile. The frontend/backend should no longer send raw internal NIS fields (such as `control_tendency`, `gaslighting_risk`, `difficult_conflict_styles`, etc.).

Instead, clients supply exactly 20 simplified answers (e.g., `conflict_repair="CALM"`, `lifestyle_finances="THRIFTY"`) covering core demographics, preferences, and lifestyle indicators.

## 2. Internal Derivation (Phase 3 Prep)
The 85+ internal fields will be derived later by NIS. The `TwentyQuestionInput` model exposes `derived_signal_targets` (e.g. mapping `conflict_repair` directly to the `user_profile.anger_level` and `user_profile.repair_style` signals) which the internal engine will use to generate the full psychological and preference profiles securely.

## 3. Strict Backend KYC Separation
KYC/system safety fields still come from the backend, not user answers. Fields such as:
*   `is_verified`
*   `verified_gender`
*   `verified_age`
*   `safety_status`
*   `is_banned`
*   `known_dealbreaker_traits`

...are explicitly decoupled into the `SystemKycData` structure. The frontend is physically incapable of injecting or overriding these variables.
