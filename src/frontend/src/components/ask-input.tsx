import TextareaAutosize from "react-textarea-autosize";
import { useState } from "react";
import { Button } from "./ui/button";
import { ArrowUp } from "lucide-react";
import Cookies from 'js-cookie';
import { useToast } from "@/components/ui/use-toast";

export const AskInput = ({
  sendMessage,
  isFollowingUp = false,
}: {
  sendMessage: (message: string) => void;
  isFollowingUp?: boolean;
}) => {
  const [input, setInput] = useState("");
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (Cookies.get('ChatNoirIndex') === 'cw22' && value.length > 200) {
      toast({
        title: "Warning",
        description: "The indexed ClueWeb22 only supports search queries up to 200 characters.",
      });
      return;
    }
    setInput(value);
  };
  
  return (
    <>
      <form
        className="w-full overflow-hidden"
        onSubmit={(e) => {
          if (input.trim().length < 5) return;
          e.preventDefault();
          sendMessage(input);
          Cookies.set('taskInProgress', 'true');
          setInput("");
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (input.trim().length < 5) return;
            sendMessage(input);
            Cookies.set('taskInProgress', 'true');
            setInput("");
          }
        }}
      >
        <div className="w-full flex items-center rounded-full focus:outline-none max-h-[30vh] px-2 py-1 bg-card border border-[#2c2f38]">
          <TextareaAutosize
            className="w-full bg-transparent text-md resize-none h-[40px] focus:outline-none p-3"
            placeholder={
              isFollowingUp ? "Ask a follow-up..." : "Formulate a query..."
            }
            onChange={handleInputChange}
            value={input}
          />
          <Button
            type="submit"
            variant="default"
            size="icon"
            className="rounded-full bg-tint aspect-square h-8 disabled:opacity-20 hover:bg-tint/80"
            disabled={input.trim().length < 5}
          >
            <ArrowUp size={20} />
          </Button>
        </div>
      </form>
    </>
  );
};
