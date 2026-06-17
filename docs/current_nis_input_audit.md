# Current NIS Input Audit

This audit documents the current input fields required by the NIS matchmaking engine prior to the 20-Input restructuring.

## 1. Current fields expected by UserProfile

The `UserProfile` model (`nis/models/user_profile.py`) is extremely heavy, expecting:
*   **Basic Demographics**: `user_id`, `name`, `age`, `gender`, `location`, `tradition`, `height_cm`, `marital_status`, `education_level`, `occupation`, `work_outlook`, `religious_practice_level`, `islamic_environment_preference`
*   **Readiness & Lifestyle**: `marriage_readiness`, `emotional_steadiness`, `anger_level`, `repair_style`, `communication_style`, `attachment_style`, `family_involvement`, `family_pressure_level`, `boundary_strength`, `financial_responsibility`, `lifestyle_pattern`
*   **Safety/Status**: `is_verified`, `is_banned`, `has_required_data`, `safety_status`, `private_notes`
*   **Psychology v2 Fields**: `control_tendency`, `empathy_level`, `accountability_level`, `humility_level`, `boundary_respect`, `manipulation_risk`, `silent_treatment_pattern`, `gaslighting_risk`, `financial_control_tendency`, `family_pressure_misuse_risk`, `religious_control_risk`, `possessiveness_level`, `isolation_tendency`, `decision_fairness`, `softness_level`, `assertiveness_level`, `conflict_aggression_level`, `emotional_maturity`

## 2. Current fields expected by MatchPreference

The `MatchPreference` model expects a staggering number of granular inputs:
*   **Eligibility Filters**: `preferred_min_age`, `preferred_max_age`, `age_is_strict`, `preferred_min_height_cm`, `preferred_max_height_cm`, `height_is_strict`, `preferred_marital_statuses`, `marital_status_is_strict`, `preferred_locations`, `location_is_strict`, `relocation_open`
*   **Faith/Tradition**: `preferred_tradition`, `tradition_importance`, `religious_practice_importance`, `preferred_islamic_environment`
*   **Education/Career**: `preferred_education_levels`, `education_is_strict`, `preferred_occupations`, `occupation_is_strict`, `preferred_work_outlook`, `work_outlook_is_strict`, `financial_responsibility_expectation`
*   **Family/Wali**: `wali_involvement_timing`, `family_involvement_preference`, `family_expectations`, `family_boundaries_importance`, `wali_visibility_preference`
*   **Lifestyle**: `preferred_lifestyle_pattern`, `preferred_daily_routine`, `preferred_living_arrangement`, `household_responsibility_preference`, `financial_lifestyle_preference`
*   **Communication/Character**: `communication_preference`, `conflict_style_preference`, `difficult_conflict_styles`, `important_character_traits`, `preferred_repair_style`
*   **Blocks/Dealbreakers**: `dealbreakers`, `non_negotiables`, `flexible_preferences`, `custom_dealbreakers`
*   **Safety/Privacy**: `photo_visibility_comfort`, `in_app_communication_comfort`, `reportable_behaviors`
*   **Review Confirmations**: `confirmed_honest_preferences`, `confirmed_no_match_over_wrong_match`, `confirmed_private_preferences_not_public`, `confirmed_raya_does_not_decide`

## 3. Current fields expected by CandidateProfile

The `CandidateProfile` is a wrapper containing:
*   `candidate_id`
*   `profile` (A full `UserProfile` object)
*   `known_dealbreaker_traits` (List of strings)

## 4. Which fields are truly required

To prevent engine crashes and allow core functionality to proceed:
*   **Basic Identity**: `user_id`, `age`, `gender`, `location`, `tradition`
*   **System Integrity**: `is_verified`, `is_banned`, `has_required_data`
*   **Basic Preferences**: The `MatchPreference` fields governing hard filters (like age ranges, height ranges, location arrays).

## 5. Which fields are optional

Many fields are natively typed as `Optional` (`Type | None`), including:
*   `height_cm`, `education_level`, `occupation`, `work_outlook`
*   `private_notes`
*   Granular preference inputs like `preferred_repair_style`, `financial_lifestyle_preference`, `preferred_daily_routine`.

## 6. Which fields are psychology fields

The "Psychology v2" fields mapped via `psychology_parser.py`:
`control_tendency`, `empathy_level`, `accountability_level`, `humility_level`, `boundary_respect`, `manipulation_risk`, `silent_treatment_pattern`, `gaslighting_risk`, `financial_control_tendency`, `family_pressure_misuse_risk`, `religious_control_risk`, `possessiveness_level`, `isolation_tendency`, `decision_fairness`, `softness_level`, `assertiveness_level`, `conflict_aggression_level`, `emotional_maturity`.
*(Also older readiness fields like `anger_level`, `communication_style`, `repair_style`).*

## 7. Which fields are safety/KYC fields

*   `is_verified`
*   `is_banned`
*   `has_required_data`
*   `safety_status`
*   `known_dealbreaker_traits` (Candidate side)

## 8. Which fields are preference fields

Every attribute inside the `MatchPreference` model (e.g., `preferred_min_age`, `dealbreakers`, `family_expectations`, `location_is_strict`).

## 9. Which fields can be derived from 20 answers

All the **Psychology v2 Fields** and **granular lifestyle preferences** can be derived from the 20 answers. For instance:
*   `control_tendency` and `boundary_respect` can be derived from Question #17 (Conflict style) and Question #18 (Boundary safety).
*   `financial_lifestyle_preference` and `household_responsibility_preference` can be derived from Question #20 (Lifestyle/financial).
*   `difficult_conflict_styles` can be derived from Question #16/17 (Communication/Conflict style differences).

## 10. Which fields must come from backend/KYC, not user answers

These fields must **never** be user-provided answers, they must be injected directly by the backend platform:
*   `user_id` & `candidate_id`
*   `is_verified` (from ID/Selfie KYC provider)
*   `is_banned` (from admin dashboard)
*   `safety_status` (from report history)
*   `has_required_data` (from backend completion checks)
*   `known_dealbreaker_traits` (aggregated server-side)
*   `private_notes` (admin annotations)
