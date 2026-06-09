from database import engine

try:
    conn = engine.connect()
    print("✅ PostgreSQL Connected Successfully!")
    conn.close()

except Exception as e:
    print("❌ Connection Failed")
    print(e)