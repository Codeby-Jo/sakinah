import pytest
from app.nis.engines.safety_engine import run_safety_checks
from app.nis.models.user_profile import UserProfile
from app.nis.models.enums import EthicalScore, ControlTendency, HonestySignal

def test_safety_engine_blocks_dangerous_pairing():
    # Dangerous candidate: High control tendency, low ethical score, low honesty signal
    dangerous_candidate = UserProfile(
        uid="danger_123",
        gender="male",
        ethical_score=EthicalScore.POOR,
        control_tendency=ControlTendency.HIGH,
        honesty_signal=HonestySignal.LOW
    )
    
    # Normal seeker
    normal_seeker = UserProfile(
        uid="seeker_123",
        gender="female",
        ethical_score=EthicalScore.EXCELLENT,
        control_tendency=ControlTendency.LOW,
        honesty_signal=HonestySignal.HIGH
    )
    
    result = run_safety_checks(normal_seeker, dangerous_candidate)
    
    # Assert that the pairing is NOT approved and it is flagged
    assert result.get("is_approved") is False
    assert len(result.get("flags", [])) > 0
    assert any("controlling" in flag.lower() or "ethical" in flag.lower() for flag in result.get("flags", []))
