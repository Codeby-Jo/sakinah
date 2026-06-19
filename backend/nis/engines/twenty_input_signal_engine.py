from typing import Dict, Any
from nis.models.twenty_question_input import TwentyQuestionInput

class TwentyInputSignalEngine:
    """
    Derives the complete set of internal NIS matchmaking signals from the 20 crisp frontend inputs.
    Strictly backend execution, entirely deterministic, no external API/DB calls.
    """

    @staticmethod
    def derive_signals(input_data: TwentyQuestionInput) -> Dict[str, Any]:
        signals = {}

        def get_val(field) -> Any:
            val = field.resolved_value
            return val if val is not None else "UNKNOWN"

        # 1-5: Basic Demographics
        signals["age"] = input_data.age.resolved_value
        signals["gender"] = input_data.gender.resolved_value
        signals["location"] = input_data.location.resolved_value
        signals["marital_status"] = get_val(input_data.marital_status)
        
        ed_occ = get_val(input_data.education_occupation)
        signals["education_level"] = ed_occ
        signals["occupation_category"] = ed_occ

        # 6-8: Religious Practice & Readiness
        rel_prac = get_val(input_data.religious_practice_and_islamic_home)
        signals["religious_practice_level"] = rel_prac
        signals["islamic_environment_preference"] = rel_prac

        signals["marriage_readiness"] = get_val(input_data.marriage_readiness)

        # 9-14: Preferences
        pref_age = input_data.pref_age_range.resolved_value or {"min": 18, "max": 100}
        signals["preferred_age_min"] = pref_age.get("min", 18)
        signals["preferred_age_max"] = pref_age.get("max", 100)

        pref_locs = input_data.pref_location.resolved_value or []
        signals["preferred_locations"] = pref_locs
        signals["location_flexibility"] = "FLEXIBLE" if not pref_locs else "STRICT"

        # Marital Status Preference
        pref_marital = get_val(input_data.pref_marital_status)
        if pref_marital == "NO_STRICT_PREFERENCE" or pref_marital == "UNKNOWN":
            signals["preferred_marital_statuses"] = []
            signals["marital_status_is_strict"] = False
        elif pref_marital == "OPEN_TO_ALL":
            signals["preferred_marital_statuses"] = ["NEVER_MARRIED", "DIVORCED", "WIDOWED", "ANNULLED"]
            signals["marital_status_is_strict"] = False
        else:
            signals["preferred_marital_statuses"] = [pref_marital]
            signals["marital_status_is_strict"] = True

        # Height / Physical Preference
        pref_phys = input_data.pref_height_or_physical_preference.resolved_value
        signals["preferred_min_height_cm"] = None
        signals["preferred_max_height_cm"] = None
        signals["height_preference_strictness"] = "FLEXIBLE"
        signals["physical_preference_mode"] = "NO_STRICT_HEIGHT_PREFERENCE"
        
        if isinstance(pref_phys, dict):
            signals["preferred_min_height_cm"] = pref_phys.get("min")
            signals["preferred_max_height_cm"] = pref_phys.get("max")
            signals["height_preference_strictness"] = "STRICT" if pref_phys.get("strict") else "FLEXIBLE"
        elif isinstance(pref_phys, str) and pref_phys != "UNKNOWN":
            signals["physical_preference_mode"] = pref_phys


        pref_rel = get_val(input_data.pref_religious_alignment)
        signals["preferred_religious_practice_level"] = pref_rel
        signals["preferred_islamic_environment"] = pref_rel

        pref_ed = input_data.pref_education_work.resolved_value or []
        signals["preferred_education_levels"] = pref_ed
        signals["preferred_work_outlook"] = pref_ed

        fam_wali = get_val(input_data.family_wali_involvement)
        signals["family_involvement"] = fam_wali
        signals["wali_involvement_preference"] = fam_wali

        signals["preferred_marriage_timeline"] = get_val(input_data.marriage_timeline)

        # 15: Dealbreakers
        db = input_data.strict_dealbreakers.resolved_value or []
        signals["dealbreakers"] = db
        signals["strict_preference_flags"] = len(db) > 0

        # 16: Communication
        comm = get_val(input_data.communication_style)
        signals["communication_style"] = comm
        signals["repair_style"] = comm
        signals["emotional_steadiness"] = "STEADY" if comm in ["CALM", "OPEN"] else "UNKNOWN"

        # 17: Conflict & Repair
        conf = get_val(input_data.conflict_repair)
        signals["anger_level"] = conf
        if conf != "UNKNOWN":
            signals["repair_style"] = conf
        signals["accountability_level"] = "HIGH" if conf in ["ACCOUNTABLE", "HEALTHY"] else "UNKNOWN"
        signals["control_tendency"] = "HIGH" if conf in ["CONTROLLING", "AGGRESSIVE"] else "UNKNOWN"

        # 18-19: Boundary, Emotional Safety, and Family Pressure
        bound = get_val(input_data.boundary_emotional_safety)
        signals["boundary_strength"] = bound
        signals["boundary_respect"] = "HIGH" if bound in ["RESPECTFUL", "SAFE"] else "UNKNOWN"
        signals["empathy_level"] = "HIGH" if bound in ["EMPATHETIC", "SAFE"] else "UNKNOWN"
        signals["manipulation_risk"] = "HIGH" if bound in ["POOR", "UNSAFE"] else "LOW"
        signals["religious_control_risk"] = "HIGH" if bound in ["CONTROLLING"] else "UNKNOWN"
        signals["family_pressure_level"] = bound
        signals["decision_fairness"] = "HIGH" if bound in ["FAIR", "INDEPENDENT", "SAFE"] else "UNKNOWN"
        if bound != "UNKNOWN":
            signals["family_involvement"] = bound

        # 20: Lifestyle & Finances
        life_fin = get_val(input_data.lifestyle_finances)
        signals["lifestyle_pattern"] = life_fin
        signals["financial_responsibility"] = life_fin
        signals["financial_control_tendency"] = "HIGH" if life_fin in ["CONTROLLING"] else "UNKNOWN"

        # General / Unmapped Safe Defaults
        signals["softness_level"] = "UNKNOWN"
        signals["assertiveness_level"] = "UNKNOWN"

        return signals
