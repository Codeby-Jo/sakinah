import subprocess
import time
import requests
import os
import signal

print("Starting server...")
proc = subprocess.Popen(["./venv/bin/python", "-m", "uvicorn", "main:app", "--port", "8000"], stderr=subprocess.PIPE, stdout=subprocess.PIPE)

time.sleep(2)

print("Sending request...")
try:
    resp = requests.post("http://127.0.0.1:8000/api/v1/nis/auth/login", json={"email":"ahamed24@gmail.com", "password":"test"})
    print(resp.status_code)
    print(resp.text)
except Exception as e:
    print(f"Request failed: {e}")

proc.send_signal(signal.SIGINT)
out, err = proc.communicate()
print("STDOUT:", out.decode())
print("STDERR:", err.decode())
