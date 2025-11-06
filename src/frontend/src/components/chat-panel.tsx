"use client";
import { useChat } from "@/hooks/chat";
import { useMessageStore } from "@/stores";
import { MessageType } from "@/types";
import { useEffect, useRef, useState } from "react";
import { AskInput } from "./ask-input";
import Cookies from 'js-cookie';
import Alert from '@mui/material/Alert';


import MessagesList from "./messages-list";
import { ModelSelection } from "./model-selection";
import { StarterQuestionsList } from "./starter-questions";
import { LocalToggle } from "./local-toggle";

import { Section } from "./section";
import { MessageComponentSkeleton } from "./message";
import { useChatNoirSearch } from "@/hooks/chatnoir";

interface ChatPanelProps {
  taskType?: string;
  searchEngineType?: string;
}

const useAutoScroll = (ref: React.RefObject<HTMLDivElement>) => {
  const { messages } = useMessageStore();

  useEffect(() => {
    if (messages.at(-1)?.role === MessageType.USER) {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages, ref]);
};

const useAutoResizeInput = (
  ref: React.RefObject<HTMLDivElement>,
  setWidth: (width: number) => void
) => {
  const { messages } = useMessageStore();

  useEffect(() => {
    const updatePosition = () => {
      if (ref.current) {
        setWidth(ref.current.scrollWidth);
      }
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("resize", updatePosition);
    };
  }, [messages, ref, setWidth]);
};

const useAutoFocus = (ref: React.RefObject<HTMLTextAreaElement>) => {
  useEffect(() => {
    ref.current?.focus();
  }, [ref]);
};

export const ChatPanel = ({ taskType, searchEngineType }: ChatPanelProps) => {
  const { handleSend: handleChatSend, streamingMessage: chatStreamingMessage } = useChat();
  const { handleChatNoirSend, searchResults, streamingMessage: chatNoirStreamingMessage, isWaitingForResponse, isIndexError } = useChatNoirSearch();
  const { messages } = useMessageStore();
  const searchEngine = JSON.parse(Cookies.get('searchEngine') || '{}');
  const searchEngineIndex = searchEngine.index || 'cw12';

  const handleSend = async (query: string) => {
    if (searchEngineType === "ChatNoir") {
      await handleChatNoirSend(query, searchEngineIndex);
    } else {
      await handleChatSend(query);
    }
  };

  const [width, setWidth] = useState(0);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const messageBottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useAutoScroll(messageBottomRef);
  useAutoResizeInput(messagesRef, setWidth);
  useAutoFocus(inputRef);

  const currentStreamingMessage = searchEngineType === "ChatNoir" ? chatNoirStreamingMessage : chatStreamingMessage;


  if (isWaitingForResponse) {
    return (
      <div ref={messagesRef} className="pt-10 w-full relative">
        <AskInput sendMessage={handleSend} />
        <div className="my-4">
          {currentStreamingMessage && <span className="text-3xl">{currentStreamingMessage.content}</span>}
        </div>
        <Section title="Results" animate={true}>
          <MessageComponentSkeleton />
        </Section>
      </div>
    );
  }

  if (isIndexError && !isWaitingForResponse) {
    return (
      <div ref={messagesRef} className="pt-10 w-full relative">
        <AskInput sendMessage={handleSend} />
        <div className="my-4">
          <Alert severity="warning">
            The Clueweb22 index is currently experiencing difficulties in retrieving results for your query. Please try rephrasing your search or using different keywords.
          </Alert>
        </div>
        <Section title="Results" animate={true}>
          <MessageComponentSkeleton />
        </Section>
      </div>
    );
  }

  if (messages.length > 0) {
    return (
      <div ref={messagesRef} className="pt-10 w-full relative">
        <MessagesList
          messages={messages}
          streamingMessage={currentStreamingMessage}
          onRelatedQuestionSelect={handleSend}
          taskType={taskType}
          searchEngine={searchEngineType}
          handleSend={handleSend}
        />
        <div ref={messageBottomRef} className="h-0" />
        {taskType === "conversational" && (
          <div
            className="bottom-12 fixed px-2 max-w-screen-md justify-center items-center md:px-2"
            style={{ width: `${width}px` }}
          >
            <AskInput isFollowingUp sendMessage={handleSend} />
          </div>
        )}
      </div>
    );
  } else {
    return (
      <div className="w-full flex flex-col justify-center items-center">
        <div className="flex items-center justify-center mb-8 mt-10">
          <span className="text-3xl">Start your Search Task</span>
        </div>
        <AskInput sendMessage={handleSend} />
        <div className="w-full flex flex-row px-3 justify-between space-y-2 pt-1">
          {/* <StarterQuestionsList handleSend={handleSend} />
          <div className="flex flex-col gap-2 items-end ">
            <ModelSelection />
            <LocalToggle />
          </div> */}
        </div>
      </div>
    );
  }
};
