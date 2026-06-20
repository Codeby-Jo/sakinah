import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate('/home/joshuaraja/Desktop/SAKINAh/sakinah/backend/firebase-credentials.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

# Check users
users = list(db.collection("users").get())
ahamed = None
hajeera = None

print("Checking users...")
for u in users:
    data = u.to_dict()
    name = data.get("name", "").lower()
    if "ahamed" in name:
        ahamed = u.id
        print(f"Found ahamed: {u.id} - {data.get('email')}")
    if "hajeera" in name:
        hajeera = u.id
        print(f"Found hajeera: {u.id} - {data.get('email')}")

if not ahamed or not hajeera:
    print("Could not find both ahamed and hajeera in users collection.")
else:
    print("\nChecking interactions...")
    # Check interaction from ahamed to hajeera
    doc1 = db.collection("candidate_interactions").document(f"{ahamed}_{hajeera}").get()
    if doc1.exists:
        print(f"Ahamed -> Hajeera: {doc1.to_dict()}")
    else:
        print("No interaction from Ahamed to Hajeera")

    # Check interaction from hajeera to ahamed
    doc2 = db.collection("candidate_interactions").document(f"{hajeera}_{ahamed}").get()
    if doc2.exists:
        print(f"Hajeera -> Ahamed: {doc2.to_dict()}")
    else:
        print("No interaction from Hajeera to Ahamed")

    print("\nChecking conversations...")
    convo_id = f"convo_{ahamed[:4]}_{hajeera[:4]}"
    c_doc = db.collection("conversations").document(convo_id).get()
    if c_doc.exists:
        print("Conversation exists!")
    else:
        convo_id2 = f"convo_{hajeera[:4]}_{ahamed[:4]}"
        c_doc2 = db.collection("conversations").document(convo_id2).get()
        if c_doc2.exists:
            print("Conversation exists (reversed)!")
        else:
            print("No conversation found.")
