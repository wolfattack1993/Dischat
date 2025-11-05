import { useState } from "react";
import { X, User, Bell, Shield, Palette } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface UserSettingsProps {
  user: any;
  onClose: () => void;
  onUpdateUser: (user: any) => void;
}

export function UserSettings({ user, onClose, onUpdateUser }: UserSettingsProps) {
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio || "");
  const [status, setStatus] = useState(user.status || "online");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("account");

  const handleSave = async () => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-941c2de5/users/settings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ username, bio, status }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        onUpdateUser(data.user);
      }
    } catch (error) {
      console.error("Error updating settings:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-full max-w-4xl h-[90vh] bg-[#313338] rounded-lg flex overflow-hidden">
        <div className="w-60 bg-[#2b2d31] p-4">
          <h2 className="text-xs uppercase text-[#949ba4] mb-2">User Settings</h2>
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab("account")}
              className={`w-full flex items-center justify-start rounded px-3 py-2 transition-colors ${
                activeTab === "account" 
                  ? "bg-[#404249] text-white" 
                  : "text-[#b5bac1] hover:bg-[#35373c]"
              }`}
            >
              <User className="w-4 h-4 mr-2" />
              My Account
            </button>
            <button
              onClick={() => setActiveTab("privacy")}
              className={`w-full flex items-center justify-start rounded px-3 py-2 transition-colors ${
                activeTab === "privacy" 
                  ? "bg-[#404249] text-white" 
                  : "text-[#b5bac1] hover:bg-[#35373c]"
              }`}
            >
              <Shield className="w-4 h-4 mr-2" />
              Privacy & Safety
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`w-full flex items-center justify-start rounded px-3 py-2 transition-colors ${
                activeTab === "notifications" 
                  ? "bg-[#404249] text-white" 
                  : "text-[#b5bac1] hover:bg-[#35373c]"
              }`}
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab("appearance")}
              className={`w-full flex items-center justify-start rounded px-3 py-2 transition-colors ${
                activeTab === "appearance" 
                  ? "bg-[#404249] text-white" 
                  : "text-[#b5bac1] hover:bg-[#35373c]"
              }`}
            >
              <Palette className="w-4 h-4 mr-2" />
              Appearance
            </button>
          </div>

          <Button
            onClick={onClose}
            variant="destructive"
            className="w-full mt-4"
          >
            Close
          </Button>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-[#26272b]">
            <h1 className="text-white text-xl">Settings</h1>
            <button onClick={onClose} className="text-[#b5bac1] hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6">
              {activeTab === "account" && (
                <div className="max-w-xl space-y-6">
                  <div>
                    <h2 className="text-white text-lg mb-4">My Account</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="username" className="text-[#b5bac1] text-xs uppercase">
                          Username
                        </Label>
                        <Input
                          id="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="bg-[#1e1f22] border-[#1e1f22] text-white mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-[#b5bac1] text-xs uppercase">
                          Email
                        </Label>
                        <Input
                          id="email"
                          value={user.email}
                          disabled
                          className="bg-[#1e1f22] border-[#1e1f22] text-[#6d6f78] mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="bio" className="text-[#b5bac1] text-xs uppercase">
                          About Me
                        </Label>
                        <Textarea
                          id="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell us about yourself..."
                          className="bg-[#1e1f22] border-[#1e1f22] text-white mt-2"
                          rows={4}
                        />
                      </div>

                      <div>
                        <Label htmlFor="status" className="text-[#b5bac1] text-xs uppercase">
                          Status
                        </Label>
                        <select
                          id="status"
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className="w-full bg-[#1e1f22] border-[#1e1f22] text-white mt-2 rounded-md px-3 py-2"
                        >
                          <option value="online">Online</option>
                          <option value="idle">Idle</option>
                          <option value="dnd">Do Not Disturb</option>
                          <option value="offline">Invisible</option>
                        </select>
                      </div>

                      <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-[#5865f2] hover:bg-[#4752c4] text-white"
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "privacy" && (
                <div className="max-w-xl">
                  <h2 className="text-white text-lg mb-4">Privacy & Safety</h2>
                  <p className="text-[#b5bac1]">Privacy settings coming soon...</p>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="max-w-xl">
                  <h2 className="text-white text-lg mb-4">Notifications</h2>
                  <p className="text-[#b5bac1]">Notification settings coming soon...</p>
                </div>
              )}

              {activeTab === "appearance" && (
                <div className="max-w-xl">
                  <h2 className="text-white text-lg mb-4">Appearance</h2>
                  <p className="text-[#b5bac1]">Appearance settings coming soon...</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
