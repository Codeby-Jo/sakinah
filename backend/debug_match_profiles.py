import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate('/home/joshuaraja/Desktop/SAKINAh/sakinah/backend/firebase-credentials.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

print("Fetching all users...")
users = list(db.collection("users").get())
ahamed = None
hajeera = None

for u in users:
    name = u.to_dict().get("name", "").lower()
    if "ahamed" in name:
        ahamed = u.id
        print(f"Found Ahamed: ID={u.id}")
    if "hajeera" in name:
        hajeera = u.id
        print(f"Found Hajeera: ID={u.id}")

if not ahamed: print("Ahamed not found")
if not hajeera: print("Hajeera not found")

if ahamed:
    print("\n--- AHAMED PROFILE ---")
    p = db.collection("profiles").document(ahamed).get()
    if p.exists:
        print(p.to_dict())
    else:
        print("No profile document.")

    print("\n--- AHAMED PREF ---")
    pref = db.collection("match_preferences").document(ahamed).get()
    if pref.exists:
        print(pref.to_dict())
    else:
        print("No match preferences.")

if hajeera:
    print("\n--- HAJEERA PROFILE ---")
    p = db.collection("profiles").document(hajeera).get()
    if p.exists:
        print(p.to_dict())
    else:
        print("No profile document.")

    print("\n--- HAJEERA PREF ---")
    pref = db.collection("match_preferences").document(hajeera).get()
    if pref.exists:
        print(pref.to_dict())
    else:
        print("No match preferences.")

