import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";

interface Member {
  id: string;
  name: string;
  avatar?: string;
  status: "online" | "idle" | "dnd" | "offline";
  role?: string;
}

interface MemberListProps {
  members: Member[];
}

export function MemberList({ members }: MemberListProps) {
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

  const groupedMembers = members.reduce((acc, member) => {
    const role = member.role || "Members";
    if (!acc[role]) acc[role] = [];
    acc[role].push(member);
    return acc;
  }, {} as Record<string, Member[]>);

  return (
    <div className="w-60 bg-[#2b2d31] flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-4">
          {Object.entries(groupedMembers).map(([role, roleMembers]) => (
            <div key={role} className="mb-4">
              <h3 className="text-[#949ba4] text-xs uppercase tracking-wide mb-2 px-2">
                {role} — {roleMembers.length}
              </h3>
              <div className="space-y-1">
                {roleMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#35373c] cursor-pointer group"
                  >
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="bg-[#5865f2] text-white text-xs">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#2b2d31] ${getStatusColor(
                          member.status
                        )}`}
                      />
                    </div>
                    <span className="text-[#949ba4] group-hover:text-[#dbdee1] truncate">
                      {member.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
