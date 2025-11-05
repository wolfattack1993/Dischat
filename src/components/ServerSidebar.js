import { Hash, MessageSquare, Plus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { ScrollArea } from "./ui/scroll-area";

interface Server {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

interface ServerSidebarProps {
  servers: Server[];
  activeServerId: string;
  onServerSelect: (serverId: string) => void;
  onShowDMs: () => void;
  onCreateServer: () => void;
}

export function ServerSidebar({ servers, activeServerId, onServerSelect, onShowDMs, onCreateServer }: ServerSidebarProps) {
  return (
    <div className="w-[72px] bg-[#1e1f22] flex flex-col items-center py-3 gap-2">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onShowDMs}
              className={`w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all duration-200 flex items-center justify-center relative group ${
                activeServerId === "dms" ? "rounded-[16px] bg-[#5865f2]" : "bg-[#313338]"
              }`}
            >
              <MessageSquare className="w-6 h-6 text-white" />
              {activeServerId === "dms" && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-1 h-10 bg-white rounded-r" />
              )}
              {activeServerId !== "dms" && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-1 h-0 group-hover:h-5 bg-white rounded-r transition-all duration-200" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Direct Messages</p>
          </TooltipContent>
        </Tooltip>

        <div className="w-8 h-0.5 bg-[#35373c] rounded-full my-1" />

        <ScrollArea className="flex-1 w-full">
          <div className="flex flex-col items-center gap-2 px-3">
            {servers.map((server) => (
              <Tooltip key={server.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onServerSelect(server.id)}
                    className={`w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all duration-200 flex items-center justify-center relative group ${
                      activeServerId === server.id
                        ? "rounded-[16px] bg-[#5865f2]"
                        : server.color
                        ? `bg-[${server.color}]`
                        : "bg-[#313338]"
                    }`}
                    style={server.color && activeServerId !== server.id ? { backgroundColor: server.color } : undefined}
                  >
                    {server.icon ? (
                      <span className="text-white">{server.icon}</span>
                    ) : (
                      <span className="text-white">{server.name.slice(0, 2).toUpperCase()}</span>
                    )}
                    {activeServerId === server.id && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-1 h-10 bg-white rounded-r" />
                    )}
                    {activeServerId !== server.id && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-1 h-0 group-hover:h-5 bg-white rounded-r transition-all duration-200" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{server.name}</p>
                </TooltipContent>
              </Tooltip>
            ))}
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onCreateServer}
                  className="w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all duration-200 flex items-center justify-center relative group bg-[#313338] hover:bg-[#23a559]"
                >
                  <Plus className="w-6 h-6 text-[#23a559] group-hover:text-white transition-colors" />
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-1 h-0 group-hover:h-5 bg-white rounded-r transition-all duration-200" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Add a Server</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </ScrollArea>
      </TooltipProvider>
    </div>
  );
}
