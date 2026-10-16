"use client";

interface UserInputProps {
  message: string;
  timestamp?: string;
}

export function UserChatBox({ message, timestamp }: UserInputProps) {
  return (
    <div className="flex items-start gap-2 mb-4 justify-end">
      <div className="flex flex-col gap-0.5 max-w-[65%]">
        <div className="relative bg-primary/15 border border-primary/30 rounded-lg rounded-br-none shadow-sm px-3 py-2">
          <div className="absolute bottom-0 right-0 w-0 h-0 border-t-10 border-t-primary/15 border-l-10 border-l-transparent"></div>
          <div className="absolute bottom-0 right-0 w-0 h-0 border-t-11 border-t-primary/30 border-l-11 border-l-transparent -z-10"></div>

          <p className="text-foreground text-xs leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
        </div>

        {timestamp && (
          <span className="text-[10px] text-muted-foreground mr-1.5 text-right">{timestamp}</span>
        )}
      </div>
    </div>
  );
}
