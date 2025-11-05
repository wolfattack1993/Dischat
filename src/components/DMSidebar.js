import { Hash, Users, Plus, MessageCircle } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";

interface DMConversation {
  userId: string;
  username: string;
  status: string;
}

interface DMSidebarProps {
  conversations: DMConversation[];
  activeConversationId: string | null;
  onSelectConversation: (userId: string) => void;
  onShowFriends: () => void;
}

export function DMSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onShowFriends,
}: DMSidebarProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-[#23a559]";
      case "idle":
        return "bg-[#f0b232]";
      case "dnd":
        return "bg-[#f23f43]";
      default:
        return "bg-[#80848e]";
    }
  };

  return (
    <div className="w-60 bg-[#2b2d31] flex flex-col">
      <div className="h-12 px-4 flex items-center justify-between shadow-md">
        <span className="text-white">Direct Messages</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          <button
            onClick={onShowFriends}
            className="w-full flex items-center gap-2 px-2 py-2 rounded text-[#949ba4] hover:bg-[#35373c] hover:text-white"
          >
            <Users className="w-5 h-5" />
            <span>Friends</span>
          </button>

          <div className="mt-4">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-[#949ba4] text-xs uppercase tracking-wide">
                Direct Messages
              </span>
              <Plus className="w-4 h-4 text-[#949ba4] hover:text-[#dbdee1] cursor-pointer" />
            </div>

            {conversations.length === 0 && (
              <div className="px-2 py-8 text-center">
                <MessageCircle className="w-12 h-12 text-[#6d6f78] mx-auto mb-2" />
                <p className="text-[#949ba4] text-sm">No direct messages yet</p>
                <p className="text-[#6d6f78] text-xs mt-1">
                  Start chatting with your friends!
                </p>
              </div>
            )}

            {conversations.map((conv) => (
              <button
                key={conv.userId}
                onClick={() => onSelectConversation(conv.userId)}
                className={`w-full flex items-center gap-3 px-2 py-2 rounded ${
                  activeConversationId === conv.userId
                    ? "bg-[#404249] text-white"
                    : "text-[#949ba4] hover:bg-[#35373c] hover:text-white"
                }`}
              >
                <div className="relative">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-[#5865f2] text-white text-xs">
                      {getInitials(conv.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#2b2d31] ${getStatusColor(
                      conv.status
                    )}`}
                  />
                </div>
                <span className="truncate">{conv.username}</span>
              </button>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
