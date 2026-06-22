// Lightweight profile store for onboarding + employee display names.
// Backed by localStorage so the app has no external backend dependency and
// works fully offline / inside MiniPay's in-app browser.

export type Role = "employer" | "employee";

export interface EmployerProfile {
  role: "employer";
  orgName: string;
  personName: string;
  companySize: string;
  industry: string;
}

export interface EmployeeProfile {
  role: "employee";
  personName: string;
  jobTitle: string;
}

export type UserProfile = EmployerProfile | EmployeeProfile;

const KEY = (address: string) => `streamwage:profile:${address.toLowerCase()}`;

export async function fetchProfile(
  address: string,
): Promise<UserProfile | null> {
  try {
    const raw = localStorage.getItem(KEY(address));
    if (!raw) return null;
    const data = JSON.parse(raw) as UserProfile;
    if (!("personName" in data) || !data.personName) return null;
    return data;
  } catch {
    return null;
  }
}

export async function saveProfileRemote(
  address: string,
  profile: UserProfile,
): Promise<void> {
  try {
    localStorage.setItem(KEY(address), JSON.stringify(profile));
  } catch {
    /* storage unavailable — non-fatal */
  }
}

// Synchronous lookup of an employee display name for stream rows.
export function lookupName(
  address: string,
): { name: string; role?: string } | null {
  try {
    const raw = localStorage.getItem(KEY(address));
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<EmployeeProfile>;
    if (!data.personName) return null;
    return { name: data.personName, role: data.jobTitle };
  } catch {
    return null;
  }
}
