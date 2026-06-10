from nis.adapters.psychology_signal_mapper import map_scenario_answers_to_signals

def test_fair_answer_maps_correctly():
    signals = map_scenario_answers_to_signals({
        "disagreement_response": "FAIR_SOLUTION"
    })
    assert signals["control_tendency"] == "LOW"
    assert signals["decision_fairness"] == "HIGH"

def test_controlling_answer_maps_correctly():
    signals = map_scenario_answers_to_signals({
        "disagreement_response": "EXPECT_SPOUSE_TO_ADJUST"
    })
    assert signals["control_tendency"] == "HIGH"
    assert signals["decision_fairness"] == "LOW"

def test_boundary_respecting_maps_correctly():
    signals = map_scenario_answers_to_signals({
        "boundary_response": "TAKE_BOUNDARY_SERIOUSLY"
    })
    assert signals["boundary_respect"] == "HIGH"

def test_boundary_dismissive_maps_correctly():
    signals = map_scenario_answers_to_signals({
        "boundary_response": "DISMISS_AS_SENSITIVE"
    })
    assert signals["boundary_respect"] == "LOW"
    assert signals["empathy_level"] == "LOW"

def test_soft_hearted_maps_to_high_softness():
    signals = map_scenario_answers_to_signals({
        "emotional_self_description": "SOFT_HEARTED"
    })
    assert signals["softness_level"] == "HIGH"
    assert signals["empathy_level"] == "HIGH"

def test_unknown_answers_default_safely():
    signals = map_scenario_answers_to_signals({
        "disagreement_response": "MADE_UP_CODE",
        "something_else": "BLAH"
    })
    assert signals["control_tendency"] == "UNKNOWN"
    assert signals["softness_level"] == "UNKNOWN"

def test_mapper_does_not_expose_judgmental_labels():
    signals = map_scenario_answers_to_signals({
        "disagreement_response": "EXPECT_SPOUSE_TO_ADJUST"
    })
    # Ensure raw output values only map to HIGH/LOW/UNKNOWN, never judgmental words
    for key, value in signals.items():
        assert value in ["HIGH", "LOW", "UNKNOWN"]
