import firebase_admin
from firebase_admin import credentials, firestore, auth

cred = credentials.Certificate('/home/joshuaraja/Desktop/SAKINAh/sakinah/backend/firebase-credentials.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

print("--- USERS COLLECTION ---")
users = db.collection('users').get()
found_safa = False
for u in users:
    data = u.to_dict()
    name = data.get('name', '')
    if name and 'safa' in name.lower():
        print(f"FOUND USER: ID={u.id}, Data={data}")
        found_safa = True

print("\n--- PROFILES COLLECTION ---")
profiles = db.collection('profiles').get()
for p in profiles:
    data = p.to_dict()
    first_name = data.get('first_name', '')
    full_name = data.get('fullName', '')
    if (first_name and 'safa' in first_name.lower()) or (full_name and 'safa' in full_name.lower()):
        print(f"FOUND PROFILE: ID={p.id}, Data={data}")
        found_safa = True

if not found_safa:
    print("\nNo user named Safa was found in the database.")
    
# Let's print all names just in case
print("\n--- ALL PROFILE NAMES ---")
for p in profiles:
    data = p.to_dict()
    print(data.get('first_name', ''), data.get('fullName', ''), data.get('age', ''))

print("\n--- FIREBASE AUTH USERS ---")
page = auth.list_users()
while page:
    for user in page.users:
        print(f"Auth User: {user.uid}, Email: {user.email}, Name: {user.display_name}")
    page = page.get_next_page()
