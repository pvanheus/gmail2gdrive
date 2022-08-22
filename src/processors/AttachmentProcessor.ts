import { AttachmentConfig } from "../config/AttachmentConfig"
import { AttachmentContext } from "../context/AttachmentContext"
import { Config } from "../config/Config"
import { MessageContext } from "../context/MessageContext"
import { ProcessingContext } from "../context/ProcessingContext"
import { ThreadContext } from "../context/ThreadContext"
import { PatternUtil } from "../utils/PatternUtil"

export class AttachmentProcessor {
  public logger: Console = console
  public config: Config
  public threadContext: ThreadContext
  public messageContext: MessageContext

  constructor(
    public gmailApp: GoogleAppsScript.Gmail.GmailApp,
    public processingContext: ProcessingContext,
  ) {
    this.config = processingContext.config
    if (processingContext.threadContext) {
      this.threadContext = processingContext.threadContext
    } else {
      throw Error("Parameter processingContext has no threadContext set!")
    }
    if (processingContext.messageContext) {
      this.messageContext = processingContext.messageContext
    } else {
      throw Error("Parameter processingContext has no messageContext set!")
    }
  }

  public processAttachmentRules(attachmentConfigs: AttachmentConfig[]) {
    for (let i = 0; i < attachmentConfigs.length; i++) {
      const attachmentRule = attachmentConfigs[i]
      attachmentRule.description =
        attachmentRule.description !== ""
          ? attachmentRule.description
          : `Attachment config #${i + 1}`
      this.processAttachmentRule(attachmentRule)
    }
  }

  public processAttachmentRule(attachmentConfig: AttachmentConfig) {
    this.logger.info(
      `          Processing of attachment config '${attachmentConfig.description}' started ...`,
    )
    for (const attachment of this.messageContext.message.getAttachments()) {
      const attachmentContext = new AttachmentContext(
        attachmentConfig,
        attachment,
        this.messageContext.message.getAttachments().indexOf(attachment),
        (this.messageContext.messageConfig.handler || []).indexOf(
          attachmentConfig,
        ),
      )
      this.processingContext.attachmentContext = attachmentContext
      this.processAttachment(attachmentContext)
    }
    this.logger.info(
      `          Processing of attachment config '${attachmentConfig.description}' finished.`,
    )
  }

  public processAttachment(attachmentContext: AttachmentContext) {
    const attachment = attachmentContext.attachment
    this.logger.info(
      `            Processing of attachment '${attachment.getName()}' started ...`,
    )
    // TODO: Check, if this.processingContext would be better here!
    // var match = true;
    // if (rule.filenameFromRegexp) {
    // var re = new RegExp(rule.filenameFromRegexp);
    //   match = (attachment.getName()).match(re);
    // }
    // if (!match) {
    //   Logger.log("INFO:           Rejecting file '" + attachment.getName() + " not matching" + rule.filenameFromRegexp);
    //   continue;
    // }

    PatternUtil.logger = this.logger
    const dataMap = PatternUtil.buildSubstitutionMap(
      this.threadContext.thread,
      this.messageContext.index,
      attachmentContext.index,
      this.messageContext.messageConfig,
      attachmentContext.ruleIndex,
    )
    // TODO: Implement attachment handling including dry-run
    this.logger.log("Dumping dataMap:")
    this.logger.log(dataMap)
    this.logger.info(
      `            Processing of attachment '${attachment.getName()}' finished.`,
    )
  }

  // public processAttachmentRule_old(
  //     attachmentContext: AttachmentContext,
  // ) {
  //     const thread: GoogleAppsScript.Gmail.GmailThread,
  //     const msgIdx: number: messageC.index
  //     const message = thread.getMessages()[msgIdx]
  //     this.logger.info("        Processing attachment rule: "
  //         + attachmentRule.getSubject() + " (" + message.getId() + ")")
  //     for (let attIdx = 0; attIdx < message.getAttachments().length; attIdx++) {
  //         // TODO: Add support for attachment rules
  //         const dataMap = PatternUtil.buildSubstitutionMap(thread, msgIdx, attIdx, attachmentRule)
  //         // buildSubstitutionMap(
  //         //     thread: GoogleAppsScript.Gmail.GmailThread, msgIdx: number, attIdx: number,
  //         //     rule: any, attRuleIdx: number)
  //         if (dataMap != null) {
  //             const location = PatternUtil.evaluatePattern(attachmentRule.location, dataMap, this.config.timezone)
  //             const conflictStrategy = attachmentRule.conflictStrategy ? attachmentRule.conflictStrategy : "create"
  //             const description = evaluatePattern(
  //                 "Mail title: ${message.subject}\n" +
  //                 "Mail date: ${message.date:dateformat:yyyy-mm-dd HH:MM:ss}\n" +
  //                 "Mail link: ${thread.permalink}", data, this.config.timezone)
  //             // TODO: Replace with GDriveActions.storeAttachment()
  //             storeAttachment(message.attachments[attIdx], description, location, conflictStrategy)
  //         }
  //     }
  // }
}
