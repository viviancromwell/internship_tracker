"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Save, Plus, X } from "lucide-react";

interface ProfileData {
  school: string;
  graduationYear: string;
  major: string;
  bio: string;
  interests: string[];
  locations: string[];
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData>({
    school: "",
    graduationYear: "",
    major: "",
    bio: "",
    interests: [],
    locations: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newInterest, setNewInterest] = useState("");
  const [newLocation, setNewLocation] = useState("");

  const field = (session?.user as Record<string, unknown>)?.field as string;

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) {
          setProfile({
            school: d.profile.school || "",
            graduationYear: d.profile.graduationYear?.toString() || "",
            major: d.profile.major || "",
            bio: d.profile.bio || "",
            interests: d.profile.interests || [],
            locations: d.profile.locations || [],
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !profile.interests.includes(newInterest.trim())) {
      setProfile({
        ...profile,
        interests: [...profile.interests, newInterest.trim()],
      });
      setNewInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    setProfile({
      ...profile,
      interests: profile.interests.filter((i) => i !== interest),
    });
  };

  const addLocation = () => {
    if (newLocation.trim() && !profile.locations.includes(newLocation.trim())) {
      setProfile({
        ...profile,
        locations: [...profile.locations, newLocation.trim()],
      });
      setNewLocation("");
    }
  };

  const removeLocation = (location: string) => {
    setProfile({
      ...profile,
      locations: profile.locations.filter((l) => l !== location),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-neutral-400 text-lg">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="rounded-2xl p-6 text-white mb-6 bg-charcoal">
        <h1 className="text-2xl font-bold">Your Profile</h1>
        <p className="opacity-70 text-sm mt-1">
          Customize your interests and location to get better matches
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-neutral-50 rounded-xl border border-tan p-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">
            Basic Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-600 mb-1">
                Name
              </label>
              <input
                value={session?.user?.name || ""}
                disabled
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-neutral-100 text-neutral-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-600 mb-1">
                Email
              </label>
              <input
                value={session?.user?.email || ""}
                disabled
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-neutral-100 text-neutral-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-600 mb-1">
                School
              </label>
              <input
                value={profile.school}
                onChange={(e) =>
                  setProfile({ ...profile, school: e.target.value })
                }
                placeholder="e.g. UCLA, Stanford"
                className="w-full px-3 py-2 border border-tan rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-600 mb-1">
                Graduation Year
              </label>
              <input
                value={profile.graduationYear}
                onChange={(e) =>
                  setProfile({ ...profile, graduationYear: e.target.value })
                }
                placeholder="e.g. 2028"
                className="w-full px-3 py-2 border border-tan rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-600 mb-1">
                Major
              </label>
              <input
                value={profile.major}
                onChange={(e) =>
                  setProfile({ ...profile, major: e.target.value })
                }
                placeholder={
                  field === "design" ? "e.g. Design Media Arts" : "e.g. Political Science"
                }
                className="w-full px-3 py-2 border border-tan rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-600 mb-1">
                Track
              </label>
              <input
                value={field === "design" ? "Design & Creative Arts" : "Political Science"}
                disabled
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-neutral-100 text-neutral-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-neutral-600 mb-1">
                Bio
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
                placeholder="Tell us about yourself..."
                rows={3}
                className="w-full px-3 py-2 border border-tan rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Interests */}
        <div className="bg-neutral-50 rounded-xl border border-tan p-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">Interests</h2>
          <p className="text-sm text-muted mb-3">
            Add topics you&apos;re interested in — we&apos;ll use these to highlight
            matching internships.
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {profile.interests.map((interest) => (
              <span
                key={interest}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold bg-primary/10 text-primary"
              >
                {interest}
                <button
                  onClick={() => removeInterest(interest)}
                  className="bg-transparent border-none cursor-pointer p-0"
                >
                  <X className="w-3 h-3 text-primary" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addInterest()}
              placeholder={
                field === "design"
                  ? "e.g. UX Design, Animation, Game Art"
                  : "e.g. Immigration Policy, Criminal Justice"
              }
              className="flex-1 px-3 py-2 border border-tan rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={addInterest}
              className="px-3 py-2 text-white border-none rounded-lg cursor-pointer bg-primary"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preferred Locations */}
        <div className="bg-neutral-50 rounded-xl border border-tan p-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">
            Preferred Locations
          </h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {profile.locations.map((loc) => (
              <span
                key={loc}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold bg-primary/10 text-primary"
              >
                {loc}
                <button
                  onClick={() => removeLocation(loc)}
                  className="bg-transparent border-none cursor-pointer p-0"
                >
                  <X className="w-3 h-3 text-primary" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addLocation()}
              placeholder="e.g. Los Angeles, San Francisco, Remote"
              className="flex-1 px-3 py-2 border border-tan rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={addLocation}
              className="px-3 py-2 text-white border-none rounded-lg cursor-pointer bg-primary"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 text-white border-none rounded-xl cursor-pointer font-semibold text-sm flex items-center gap-2 disabled:opacity-50 bg-primary hover:bg-accent transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Profile"}
          </button>
          {saved && (
            <span className="text-sm font-semibold text-success">
              Profile saved successfully!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
