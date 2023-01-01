import { MessageConfig } from "../config/MessageConfig"
import { ThreadContext } from "./ThreadContext"

export class MessageContext extends ThreadContext {
  constructor(
    public threadContext: ThreadContext,
    public messageConfig: MessageConfig,
    public message: GoogleAppsScript.Gmail.GmailMessage,
    public messageConfigIndex = 0,
    public messageIndex = 0,
  ) {
    super(
      threadContext.processingContext,
      threadContext.threadConfig,
      threadContext.thread,
    )
  }
}
