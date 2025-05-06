export function getTitleFromPath(path: string) {
  if (path === "/") return "Home";
  if (path.includes("devices")) return "Devices";
  if (path.includes("profile")) return "Profile";
  if (path.includes("activity")) return "Activity";
  if (path.includes("settings")) return "Settings";
  return "LookOut";
}
