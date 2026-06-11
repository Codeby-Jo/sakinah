import os

folders = [
    "src/modules/auth", "src/modules/dashboard", "src/modules/profile", "src/modules/kyc",
    "src/modules/preferences", "src/modules/matches", "src/modules/chat", "src/modules/notifications", "src/modules/settings",
    "src/pages/Landing", "src/pages/About", "src/pages/HowItWorks", "src/pages/Login", "src/pages/Register",
    "src/pages/Dashboard", "src/pages/ProfileSetup", "src/pages/ProfileReview", "src/pages/KYC", "src/pages/Preferences",
    "src/pages/MatchGeneration", "src/pages/MatchResults", "src/pages/NoMatches", "src/pages/InterestSent",
    "src/pages/MutualInterest", "src/pages/Chat", "src/pages/Notifications", "src/pages/Settings",
    "src/pages/PrivacyPolicy", "src/pages/Terms", "src/pages/Contact",
    "src/components/common/Button", "src/components/common/Input", "src/components/common/Select",
    "src/components/common/Modal", "src/components/common/Card", "src/components/common/Loader",
    "src/components/common/EmptyState", "src/components/common/StatusBadge",
    "src/components/profile", "src/components/kyc", "src/components/preferences", "src/components/matches",
    "src/components/dashboard", "src/components/chat",
    "src/layouts/PublicLayout", "src/layouts/AuthLayout", "src/layouts/DashboardLayout",
    "src/services", "src/types"
]

for folder in folders:
    os.makedirs(folder, exist_ok=True)
    if folder.startswith("src/pages/") or folder.startswith("src/layouts/"):
        component_name = folder.split("/")[-1]
        with open(f"{folder}/index.tsx", "w") as f:
            f.write(f"export default function {component_name}() {{\n  return <div>{component_name}</div>;\n}}\n")

types = ["User", "Profile", "KYC", "Preference", "Match", "Chat", "Notification", "ApiResponse"]
for t in types:
    with open(f"src/types/{t}.ts", "w") as f:
        f.write(f"export interface {t} {{\n  id: string;\n}}\n")

services = ["authApi", "profileApi", "kycApi", "preferenceApi", "nisApi", "matchApi", "chatApi"]
for s in services:
    with open(f"src/services/{s}.ts", "w") as f:
        f.write(f"export const {s} = {{}};\n")

print("Created structure")
