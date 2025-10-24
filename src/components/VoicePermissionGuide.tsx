import { Mic } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

export function VoicePermissionGuide() {
  const getBrowserName = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) return "Safari";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Edge")) return "Edge";
    return "your browser";
  };

  return (
    <div className="space-y-3 text-left">
      <Alert className="bg-[#5865f2] bg-opacity-10 border-[#5865f2]">
        <Mic className="h-4 w-4 text-[#5865f2]" />
        <AlertDescription className="text-[#b5bac1] text-sm">
          <p className="mb-2">To enable voice chat in {getBrowserName()}:</p>
          <ol className="space-y-1 ml-4 list-decimal">
            <li>Look for the microphone permission prompt</li>
            <li>Click "Allow" or "Accept"</li>
            <li>If you accidentally blocked it, click the address bar icon</li>
            <li>Change microphone permission to "Allow"</li>
            <li>Refresh the page</li>
          </ol>
        </AlertDescription>
      </Alert>
      
      <p className="text-[#949ba4] text-xs">
        Your browser requires microphone access for voice chat to work. Your privacy is protected - 
        audio only streams when you're in a voice channel.
      </p>
    </div>
  );
}
