import { motion } from "framer-motion";
import { Send, Terminal } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function CommsView() {
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    toast({
      title: "TRANSMISSION SENT",
      description: "Message successfully uploaded to the server node.",
      className: "border-primary text-primary font-mono bg-black"
    });
    
    setMessage("");
  };

  return (
    <div className="h-full w-full p-6 flex flex-col font-terminal">
      <h2 className="text-xl md:text-2xl leading-tight font-pixel text-primary mb-6 break-words">
        ESTABLISH_UPLINK
      </h2>

      <div className="flex-1 border-2 border-primary/30 bg-black/50 p-4 mb-4 overflow-hidden relative">
        <div className="absolute top-2 right-2 flex gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse delay-75" />
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse delay-150" />
        </div>
        
        <div className="space-y-4 text-lg">
          <p className="text-muted-foreground">
            &gt; CONNECTING TO SECURE SERVER... <span className="text-green-500">OK</span>
          </p>
          <p className="text-muted-foreground">
            &gt; ENCRYPTING CHANNEL... <span className="text-green-500">OK</span>
          </p>
          <p className="text-primary">
            &gt; SYSTEM: WELCOME, GUEST. PLEASE TRANSMIT YOUR INQUIRY BELOW.
          </p>
        </div>
      </div>

      <form onSubmit={handleSend} className="flex gap-4">
        <div className="flex-1 relative">
          <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="w-full bg-black border-2 border-primary/50 text-primary p-3 pl-10 font-mono focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(0,255,0,0.3)] transition-all"
          />
        </div>
        <button
          type="submit"
          className="bg-primary text-black px-8 py-3 font-bold font-hud hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(0,255,0,0.5)] transition-all uppercase flex items-center gap-2"
        >
          SEND <Send className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-8 flex justify-between text-muted-foreground text-sm font-hud">
        <span>STATUS: ONLINE</span>
        <span>LATENCY: 12ms</span>
        <span>ENCRYPTION: AES-256</span>
      </div>
    </div>
  );
}
