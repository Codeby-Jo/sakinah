from nis.models.user_profile import UserProfile
from nis.models.match_preference import MatchPreference
from nis.models.candidate_profile import CandidateProfile

current_user = UserProfile(
    user_id="u1",
    name="Serious Ready User",
    age=24,
    gender="MALE",
    location="Chennai",
    tradition="Sunni-Hanafi",
    height_cm=180,
    marital_status="NEVER_MARRIED",
    education_level="BACHELORS",
    occupation="Engineer",
    work_outlook="WORKING",
    religious_practice_level="HIGH",
    islamic_environment_preference="STRICT",
    is_verified=True,
    is_banned=False,
    has_required_data=True,
    marriage_readiness="READY",
    emotional_steadiness="STEADY",
    anger_level="LOW",
    repair_style="REPAIR_ORIENTED",
    communication_style="CALM",
    attachment_style="SECURE",
    family_involvement="AFTER_MUTUAL_INTEREST",
    family_pressure_level="LOW",
    boundary_strength="STRONG",
    financial_responsibility="CAREFUL",
    lifestyle_pattern="STRUCTURED",
    safety_status="CLEAR"
)

match_preference = MatchPreference(
    preferred_min_age=21,
    preferred_max_age=27,
    age_is_strict=True,
    preferred_min_height_cm=150,
    preferred_max_height_cm=175,
    height_is_strict=False,
    preferred_marital_statuses=["NEVER_MARRIED"],
    marital_status_is_strict=True,
    preferred_locations=["Chennai", "Bangalore"],
    location_is_strict=False,
    relocation_open=True,
    preferred_tradition="Sunni-Hanafi",
    tradition_importance="PREFERRED",
    religious_practice_importance="HIGH",
    preferred_islamic_environment="STRICT",
    preferred_education_levels=["BACHELORS", "MASTERS"],
    education_is_strict=True,
    preferred_occupations=[],
    occupation_is_strict=False,
    preferred_work_outlook=["WORKING", "HOMEMAKER"],
    work_outlook_is_strict=True,
    financial_responsibility_expectation="CAREFUL",
    wali_involvement_timing="EARLY",
    family_involvement_preference="AFTER_MUTUAL_INTEREST",
    family_expectations=[],
    family_boundaries_importance="STRONG",
    wali_visibility_preference="VISIBLE",
    preferred_lifestyle_pattern="STRUCTURED",
    preferred_daily_routine="MORNING_PERSON",
    preferred_living_arrangement="INDEPENDENT",
    household_responsibility_preference="SHARED",
    financial_lifestyle_preference="BALANCED",
    communication_preference="CALM",
    conflict_style_preference="LOW",
    difficult_conflict_styles=["HIGH"],
    important_character_traits=["HONESTY"],
    preferred_repair_style="REPAIR_ORIENTED",
    dealbreakers=["SMOKING", "SUBSTANCE_USE", "HIGH_ANGER", "NOT_READY_FOR_MARRIAGE"],
    non_negotiables=["ABUSIVE_BEHAVIOR", "DISHONESTY", "REFUSES_IN_APP_SAFETY"],
    flexible_preferences=["location", "lifestyle", "height"],
    custom_dealbreakers=[],
    photo_visibility_comfort="VISIBLE",
    in_app_communication_comfort="HIGH",
    reportable_behaviors=[],
    confirmed_honest_preferences=True,
    confirmed_no_match_over_wrong_match=True,
    confirmed_private_preferences_not_public=True,
    confirmed_raya_does_not_decide=True
)

def create_base_profile(cid, name, age, safety_status="CLEAR", is_banned=False, has_data=True, gender="FEMALE"):
    return UserProfile(
        user_id=cid,
        name=name,
        age=age,
        gender=gender,
        location="Chennai",
        tradition="Sunni-Hanafi",
        height_cm=160,
        marital_status="NEVER_MARRIED",
        education_level="BACHELORS",
        occupation="Teacher",
        work_outlook="WORKING",
        religious_practice_level="HIGH",
        islamic_environment_preference="STRICT",
        is_verified=True,
        is_banned=is_banned,
        has_required_data=has_data,
        marriage_readiness="READY",
        emotional_steadiness="STEADY",
        anger_level="LOW",
        repair_style="REPAIR_ORIENTED",
        communication_style="CALM",
        attachment_style="SECURE",
        family_involvement="AFTER_MUTUAL_INTEREST",
        family_pressure_level="LOW",
        boundary_strength="STRONG",
        financial_responsibility="CAREFUL",
        lifestyle_pattern="STRUCTURED",
        safety_status=safety_status
    )

p1 = create_base_profile("c1", "Strong Candidate", 23)
strong_candidate = CandidateProfile(candidate_id="c1", profile=p1, known_dealbreaker_traits=[])

p2 = create_base_profile("c2", "Age Mismatch", 30)
age_mismatch_candidate = CandidateProfile(candidate_id="c2", profile=p2, known_dealbreaker_traits=[])

p3 = create_base_profile("c3", "Banned Candidate", 24, is_banned=True)
banned_candidate = CandidateProfile(candidate_id="c3", profile=p3, known_dealbreaker_traits=[])

p4 = create_base_profile("c4", "Unsafe Candidate", 24, safety_status="UNDER_REVIEW")
unsafe_candidate = CandidateProfile(candidate_id="c4", profile=p4, known_dealbreaker_traits=[])

p5 = create_base_profile("c5", "Angry Weak Repair", 24)
p5.anger_level = "HIGH"
p5.repair_style = "DEFENSIVE"
angry_weak_repair_candidate = CandidateProfile(candidate_id="c5", profile=p5, known_dealbreaker_traits=[])

p6 = create_base_profile("c6", "Dealbreaker Candidate", 24)
dealbreaker_candidate = CandidateProfile(candidate_id="c6", profile=p6, known_dealbreaker_traits=["SMOKING"])

p7 = create_base_profile("c7", "Insufficient Data", 24, has_data=False)
insufficient_data_candidate = CandidateProfile(candidate_id="c7", profile=p7, known_dealbreaker_traits=[])

p8 = create_base_profile("c8", "Weak Preference Candidate", 24)
weak_preference_candidate = CandidateProfile(candidate_id="c8", profile=p8, known_dealbreaker_traits=["ABUSIVE_BEHAVIOR", "DISHONESTY"])

p9 = create_base_profile("c9", "Male Candidate", 23, gender="MALE")
male_candidate = CandidateProfile(candidate_id="c9", profile=p9, known_dealbreaker_traits=[])
female_candidate = strong_candidate

p10 = create_base_profile("c10", "Missing Gender Candidate", 23, gender=None)
missing_gender_candidate = CandidateProfile(candidate_id="c10", profile=p10, known_dealbreaker_traits=[])

p11 = create_base_profile("c11", "Same Gender Candidate", 23, gender="MALE")
same_gender_candidate = CandidateProfile(candidate_id="c11", profile=p11, known_dealbreaker_traits=[])

p12 = create_base_profile("c12", "Height Mismatch Candidate", 23)
p12.height_cm = 180
height_mismatch_candidate = CandidateProfile(candidate_id="c12", profile=p12, known_dealbreaker_traits=[])

p13 = create_base_profile("c13", "Flexible Height Mismatch", 23)
p13.height_cm = 180
flexible_height_mismatch_candidate = CandidateProfile(candidate_id="c13", profile=p13, known_dealbreaker_traits=[])

p14 = create_base_profile("c14", "Marital Status Mismatch", 23)
p14.marital_status = "DIVORCED"
marital_status_mismatch_candidate = CandidateProfile(candidate_id="c14", profile=p14, known_dealbreaker_traits=[])

p15 = create_base_profile("c15", "Education Mismatch", 23)
p15.education_level = "SCHOOL"
education_mismatch_candidate = CandidateProfile(candidate_id="c15", profile=p15, known_dealbreaker_traits=[])

p16 = create_base_profile("c16", "Occupation Mismatch", 23)
p16.occupation = "Actor"
occupation_mismatch_candidate = CandidateProfile(candidate_id="c16", profile=p16, known_dealbreaker_traits=[])

p17 = create_base_profile("c17", "Work Outlook Mismatch", 23)
p17.work_outlook = "BUSINESS"
work_outlook_mismatch_candidate = CandidateProfile(candidate_id="c17", profile=p17, known_dealbreaker_traits=[])

p18 = create_base_profile("c18", "Religious Practice Mismatch", 23)
p18.religious_practice_level = "LOW"
religious_practice_mismatch_candidate = CandidateProfile(candidate_id="c18", profile=p18, known_dealbreaker_traits=[])

p19 = create_base_profile("c19", "Family Boundary Mismatch", 23)
p19.boundary_strength = "WEAK"
p19.family_pressure_level = "HIGH"
family_boundary_mismatch_candidate = CandidateProfile(candidate_id="c19", profile=p19, known_dealbreaker_traits=[])

candidates = [
    strong_candidate,
    age_mismatch_candidate,
    banned_candidate,
    unsafe_candidate,
    angry_weak_repair_candidate,
    dealbreaker_candidate,
    insufficient_data_candidate,
    weak_preference_candidate,
    male_candidate,
    missing_gender_candidate,
    same_gender_candidate,
    height_mismatch_candidate,
    flexible_height_mismatch_candidate,
    marital_status_mismatch_candidate,
    education_mismatch_candidate,
    occupation_mismatch_candidate,
    work_outlook_mismatch_candidate,
    religious_practice_mismatch_candidate,
    family_boundary_mismatch_candidate
]

import copy
female_current_user = copy.deepcopy(current_user)
female_current_user.gender = "FEMALE"
female_current_user.user_id = "u2"

missing_gender_current_user = copy.deepcopy(current_user)
missing_gender_current_user.gender = None
missing_gender_current_user.user_id = "u3"
