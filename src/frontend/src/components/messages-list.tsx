import React from 'react';

import { AssistantMessage, ChatMessage, MessageType } from "@/types";
import { AssistantMessageContent } from "./assistant-message";
import { Separator } from "./ui/separator";
import { UserMessageContent } from "./user-message";
import { AskInput } from "./ask-input";
import { useMessageStore } from "@/stores";

interface MessagesListProps {
  messages: ChatMessage[];
  streamingMessage: AssistantMessage | null;
  onRelatedQuestionSelect: (question: string) => void;
  handleSend: (message: string) => void;
  taskType?: string;
  searchEngine?: string;
}

const MessagesList = ({
  messages,
  streamingMessage,
  onRelatedQuestionSelect,
  handleSend,
  taskType,
  searchEngine,
}: MessagesListProps) => {
  const { resetMessages } = useMessageStore();

  const handleSendAndReset = (message: string) => {
    handleSend(message);
    if (taskType === "traditional" || taskType === "hybrid") {
      resetMessages();
    }
  };

  return (
    <div className="flex flex-col pb-28">
      {messages.map((message, index) => (
        <React.Fragment key={index}>
          {message.role === MessageType.USER ? (
            <>
              {(taskType === "traditional" || taskType === "hybrid") && <AskInput sendMessage={handleSendAndReset} />}
              <UserMessageContent message={message} />
            </>
          ) : (
            <>
              {searchEngine === "ChatNoir" && (
                <>
                  {(taskType === "traditional" || taskType === "hybrid") && <AskInput sendMessage={handleSendAndReset} />}
                  <div className="my-4">
                    <span className="text-3xl">{message.content}</span>
                  </div>
                </>
              )}
              <AssistantMessageContent
                message={message}
                onRelatedQuestionSelect={onRelatedQuestionSelect}
                taskType={taskType}
                searchEngine={searchEngine}
              />
              {index !== messages.length - 1 && <Separator />}
            </>
          )}
        </React.Fragment>
      ))}
      {streamingMessage && (
        <AssistantMessageContent
          message={streamingMessage}
          isStreaming={true}
          onRelatedQuestionSelect={onRelatedQuestionSelect}
          taskType={taskType}
          searchEngine={searchEngine}
        />
      )}
    </div>
  );
};

export default MessagesList;