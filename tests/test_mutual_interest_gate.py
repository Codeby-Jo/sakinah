import pytest
from nis.models.mutual_interest_state import MutualInterestState
from nis.engines.mutual_interest_gate_engine import evaluate_mutual_interest_gate

def test_no_interest_returns_waiting():
    state = MutualInterestState(seeker_id="s1", candidate_id="c1")
    res = evaluate_mutual_interest_gate(state)
    assert res["status"] == "WAITING_FOR_MUTUAL_INTEREST"

def test_one_sided_seeker_interest():
    state = MutualInterestState(seeker_id="s1", candidate_id="c1", seeker_interested=True)
    res = evaluate_mutual_interest_gate(state)
    assert res["status"] == "WAITING_FOR_MUTUAL_INTEREST"

def test_one_sided_candidate_interest():
    state = MutualInterestState(seeker_id="s1", candidate_id="c1", candidate_interested=True)
    res = evaluate_mutual_interest_gate(state)
    assert res["status"] == "WAITING_FOR_MUTUAL_INTEREST"

def test_mutual_interest_confirmed():
    state = MutualInterestState(
        seeker_id="s1", 
        candidate_id="c1", 
        seeker_interested=True, 
        candidate_interested=True
    )
    res = evaluate_mutual_interest_gate(state)
    assert res["status"] == "MUTUAL_INTEREST_CONFIRMED"

def test_seeker_pass_closes_silently():
    state = MutualInterestState(seeker_id="s1", candidate_id="c1", seeker_passed=True)
    res = evaluate_mutual_interest_gate(state)
    assert res["status"] == "CLOSED_SILENTLY"

def test_candidate_pass_closes_silently():
    state = MutualInterestState(seeker_id="s1", candidate_id="c1", candidate_passed=True)
    res = evaluate_mutual_interest_gate(state)
    assert res["status"] == "CLOSED_SILENTLY"

def test_pass_overrides_interest():
    # Mutual interest but one side passed (edge case or user action later)
    state = MutualInterestState(
        seeker_id="s1", 
        candidate_id="c1", 
        seeker_interested=True, 
        candidate_interested=True,
        seeker_passed=True
    )
    res = evaluate_mutual_interest_gate(state)
    assert res["status"] == "CLOSED_SILENTLY"

def test_no_rejection_wording():
    states = [
        MutualInterestState(seeker_id="s1", candidate_id="c1", seeker_passed=True),
        MutualInterestState(seeker_id="s1", candidate_id="c1", candidate_passed=True),
        MutualInterestState(seeker_id="s1", candidate_id="c1")
    ]
    
    for state in states:
        res = evaluate_mutual_interest_gate(state)
        msg = res["message"].lower()
        assert "reject" not in msg
        assert "decline" not in msg

def test_no_chat_or_message_objects_created():
    # Ensure the engine ONLY returns a status dict, and does not return chat or message structures
    state = MutualInterestState(
        seeker_id="s1", 
        candidate_id="c1", 
        seeker_interested=True, 
        candidate_interested=True
    )
    res = evaluate_mutual_interest_gate(state)
    assert "chat_id" not in res
    assert "messages" not in res
    assert "chat" not in res
