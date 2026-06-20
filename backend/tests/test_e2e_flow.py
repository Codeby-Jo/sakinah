"""
Sakinah E2E Test Suite
Tests the full flow: Register → Login → KYC → Profile → Preferences → Matches → Mutual Interest → Chat
Uses httpx TestClient against the real FastAPI app with a mock Firebase.
"""
import pytest
import uuid
from unittest.mock import patch
from httpx import AsyncClient, ASGITransport

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))


# ─── Firestore in-memory mock ────────────────────────────────────────────────
class MockDoc:
    def __init__(self, data=None, doc_id=None):
        self._data = data or {}
        self.exists = data is not None
        self.id = doc_id or self._data.get("id") or str(uuid.uuid4())
    def to_dict(self): return self._data


class MockCollection:
    def __init__(self, store, name):
        self._store = store
        self._name = name

    def document(self, doc_id=None):
        doc_id = doc_id or str(uuid.uuid4())
        return MockDocRef(self._store, self._name, doc_id)

    def where(self, field, op, value):
        return MockQuery(self._store, self._name, [(field, op, value)])

    def order_by(self, field, direction=None): return self

    def limit(self, n): return self

    def get(self):
        col = self._store.get(self._name, {})
        return [MockDoc(d) for d in col.values()]


class MockDocRef:
    def __init__(self, store, col, doc_id):
        self._store = store
        self._col = col
        self._id = doc_id
        self.id = doc_id

    def get(self):
        data = self._store.get(self._col, {}).get(self._id)
        return MockDoc(data)

    def set(self, data, merge=False):
        if merge:
            existing = self._store.setdefault(self._col, {}).get(self._id, {})
            existing.update(data)
            self._store[self._col][self._id] = existing
        else:
            self._store.setdefault(self._col, {})[self._id] = data

    def update(self, data):
        self._store.setdefault(self._col, {}).setdefault(self._id, {}).update(data)

    def collection(self, sub):
        return MockCollection(self._store, f"{self._col}/{self._id}/{sub}")


class MockQuery:
    def __init__(self, store, col, filters=None):
        self._store = store
        self._col = col
        self._filters = filters or []

    def where(self, field, op, value):
        new_filters = self._filters + [(field, op, value)]
        return MockQuery(self._store, self._col, new_filters)

    def limit(self, n): return self

    def order_by(self, field, direction=None): return self

    def get(self):
        col = self._store.get(self._col, {})
        results = []
        for d in col.values():
            match = all(d.get(f) == v for f, op, v in self._filters)
            if match:
                results.append(MockDoc(d))
        return results


class MockDB:
    def __init__(self):
        self._store = {}

    def collection(self, name):
        return MockCollection(self._store, name)


mock_db = MockDB()

def get_mock_db(): return mock_db
def mock_init_firebase(): pass
def mock_verify_token(token): return None  # force local JWT


with patch("app.core.firebase.init_firebase", mock_init_firebase), \
     patch("app.core.firebase.get_db", get_mock_db), \
     patch("app.core.firebase.verify_token", mock_verify_token):
    from main import app


BASE = "http://test"

def auth_headers(token: str):
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_full_e2e_flow():
    """
    Full seeker-A and seeker-B flow:
    Register → Login → KYC → Profile → Preferences → Mutual Interest → Chat
    """
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url=BASE) as client:

        # ── 1. REGISTER User A ────────────────────────────────────────────
        email_a = f"usera_{uuid.uuid4().hex[:6]}@test.com"
        reg_a = await client.post("/api/v1/nis/auth/register", json={
            "email": email_a,
            "password": "Password123!",
            "name": "User Alpha"
        })
        assert reg_a.status_code == 201, f"Register A failed: {reg_a.text}"
        token_a = reg_a.json()["access_token"]
        uid_a = reg_a.json()["id"]
        print(f"\n✅ [1] User A registered: {uid_a}")

        # ── 2. REGISTER User B ────────────────────────────────────────────
        email_b = f"userb_{uuid.uuid4().hex[:6]}@test.com"
        reg_b = await client.post("/api/v1/nis/auth/register", json={
            "email": email_b,
            "password": "Password123!",
            "name": "User Beta"
        })
        assert reg_b.status_code == 201, f"Register B failed: {reg_b.text}"
        token_b = reg_b.json()["access_token"]
        uid_b = reg_b.json()["id"]
        print(f"✅ [2] User B registered: {uid_b}")

        # ── 3. LOGIN User A ───────────────────────────────────────────────
        login_a = await client.post("/api/v1/nis/auth/login", json={
            "email": email_a,
            "password": "Password123!"
        })
        assert login_a.status_code == 200, f"Login A failed: {login_a.text}"
        assert "access_token" in login_a.json()
        token_a = login_a.json()["access_token"]  # use fresh login token
        print(f"✅ [3] User A login successful, token refreshed")

        # ── 4. CREATE Profile A ───────────────────────────────────────────
        profile_a = await client.post("/api/v1/nis/profile/me", json={
            "firstName": "User",
            "lastName": "Alpha",
            "age": "26",                    # schema requires string
            "gender": "male",
            "location": "Mumbai",
            "religious_practice_and_islamic_home": "Practicing",
            "marital_status": "Never Married",
            "education_occupation": "Engineer / Graduate",
            "marriage_readiness": "READY"
        }, headers=auth_headers(token_a))
        assert profile_a.status_code in (200, 201), f"Profile A failed: {profile_a.text}"
        print(f"✅ [4] User A profile created")

        # ── 5. CREATE Profile B ───────────────────────────────────────────
        profile_b = await client.post("/api/v1/nis/profile/me", json={
            "firstName": "User",
            "lastName": "Beta",
            "age": "24",
            "gender": "female",
            "location": "Mumbai",
            "religious_practice_and_islamic_home": "Practicing",
            "marital_status": "Never Married",
            "education_occupation": "Teacher / Graduate",
            "marriage_readiness": "READY"
        }, headers=auth_headers(token_b))
        assert profile_b.status_code in (200, 201), f"Profile B failed: {profile_b.text}"
        print(f"✅ [5] User B profile created")

        # ── 6. SET Preferences A ─────────────────────────────────────────
        pref_a = await client.put("/api/v1/nis/preferences/me", json={
            "prefAgeMin": 20,
            "prefAgeMax": 30,
            "prefLocations": ["Mumbai"],
            "prefMaritalStatus": ["Never Married"],
            "prefReligiousAlignment": "Required",
            "prefCommunicationStyle": "Calm",
            "prefFamilyInvolvement": "Early",
            "prefEducationWork": ["Graduate"],
            "strictDealbreakers": [],
            "marriageTimeline": "Within 1 year",
            "prefHeightOrPhysical": "No preference",
            "locationFlexibility": "Open to relocation"
        }, headers=auth_headers(token_a))
        assert pref_a.status_code in (200, 201), f"Prefs A failed: {pref_a.text}"
        print(f"✅ [6] User A preferences saved")

        # ── 7. SET Preferences B ─────────────────────────────────────────
        pref_b = await client.put("/api/v1/nis/preferences/me", json={
            "prefAgeMin": 22,
            "prefAgeMax": 35,
            "prefLocations": ["Mumbai"],
            "prefMaritalStatus": ["Never Married"],
            "prefReligiousAlignment": "Required",
            "prefCommunicationStyle": "Calm",
            "prefFamilyInvolvement": "Early",
            "prefEducationWork": ["Graduate"],
            "strictDealbreakers": [],
            "marriageTimeline": "Within 1 year",
            "prefHeightOrPhysical": "No preference",
            "locationFlexibility": "Open to relocation"
        }, headers=auth_headers(token_b))
        assert pref_b.status_code in (200, 201), f"Prefs B failed: {pref_b.text}"
        print(f"✅ [7] User B preferences saved")

        # ── 8. KYC Sandbox Pass for both ─────────────────────────────────
        kyc_a = await client.post("/api/v1/nis/kyc/sandbox/complete",
                                   json={"outcome": "sandbox_pass"},
                                   headers=auth_headers(token_a))
        assert kyc_a.status_code in (200, 201), f"KYC A failed: {kyc_a.text}"
        print(f"✅ [8a] User A KYC passed")

        kyc_b = await client.post("/api/v1/nis/kyc/sandbox/complete",
                                   json={"outcome": "sandbox_pass"},
                                   headers=auth_headers(token_b))
        assert kyc_b.status_code in (200, 201), f"KYC B failed: {kyc_b.text}"
        print(f"✅ [8b] User B KYC passed")

        # ── 9. User A expresses interest in User B ────────────────────────
        interest_a = await client.post(f"/api/v1/nis/candidates/{uid_b}/interest",
                                        headers=auth_headers(token_a))
        assert interest_a.status_code == 200, f"Interest A→B failed: {interest_a.text}"
        resp_a = interest_a.json()
        assert resp_a["status"] in ("success", "mutual_interest", "INTEREST")
        print(f"✅ [9] User A expressed interest in B → status: {resp_a['status']}")

        # ── 10. User B expresses interest in User A → triggers MUTUAL ─────
        interest_b = await client.post(f"/api/v1/nis/candidates/{uid_a}/interest",
                                        headers=auth_headers(token_b))
        assert interest_b.status_code == 200, f"Interest B→A failed: {interest_b.text}"
        resp_b = interest_b.json()
        assert resp_b["status"] == "mutual_interest", \
            f"Expected mutual_interest, got: {resp_b['status']} — {interest_b.text}"
        convo_id = resp_b["conversation_id"]
        print(f"✅ [10] MUTUAL INTEREST confirmed! conversation_id: {convo_id}")

        # ── 11. User A fetches their conversations ────────────────────────
        convos_a = await client.get("/api/v1/nis/conversations/",
                                     headers=auth_headers(token_a))
        assert convos_a.status_code == 200, f"Convos A failed: {convos_a.text}"
        convos_data = convos_a.json()
        print(f"✅ [11] User A conversations fetched: {len(convos_data)} found")

        # ── 12. User A sends a message ────────────────────────────────────
        send_msg = await client.post(
            f"/api/v1/nis/conversations/{convo_id}/messages",
            json={
                "text": "As-salamu alaykum! Looking forward to talking with you.",
                "msg_type": "text"
            },
            headers=auth_headers(token_a)
        )
        assert send_msg.status_code in (200, 201), f"Send message failed: {send_msg.text}"
        print(f"✅ [12] User A sent a message successfully")

        # ── 13. User B reads conversation messages ────────────────────────
        get_msgs = await client.get(
            f"/api/v1/nis/conversations/{convo_id}/messages",
            headers=auth_headers(token_b)
        )
        assert get_msgs.status_code == 200, f"Get messages failed: {get_msgs.text}"
        messages = get_msgs.json()
        assert len(messages) >= 1, f"Expected at least 1 message, got: {messages}"
        print(f"✅ [13] User B can read {len(messages)} message(s) in the conversation")

        print("\n🎉 ALL 13 E2E STEPS PASSED — Full Sakinah flow verified!")
