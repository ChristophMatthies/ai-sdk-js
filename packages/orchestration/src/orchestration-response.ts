import type { HttpResponse } from '@sap-cloud-sdk/http-client';
import type {
  CompletionPostResponse,
  TokenUsage
} from './client/api/schema/index.js';

/**
 * Representation of an orchestration response.
 */
export class OrchestrationResponse {
  /**
   * The completion post response.
   */
  public readonly data: CompletionPostResponse;
  constructor(public readonly rawResponse: HttpResponse) {
    this.data = rawResponse.data;
  }

  /**
   * Usage of tokens in the response.
   * @returns Token usage.
   */
  getTokenUsage(): TokenUsage {
    return this.data.orchestration_result.usage!;
  }
  /**
   * Reason for stopping the completion.
   * @param choiceIndex - The index of the choice to parse.
   * @returns The finish reason.
   */
  getFinishReason(choiceIndex = 0): string | undefined {
    return this.getChoices().find(c => c.index === choiceIndex)?.finish_reason;
  }

  /**
   * Parses the orchestration response and returns the content.
   * If the response was filtered, an error is thrown.
   * @param choiceIndex - The index of the choice to parse.
   * @returns The message content.
   */
  getContent(choiceIndex = 0): string | undefined {
    const choice = this.getChoices().find(c => c.index === choiceIndex);
    if (
      choice?.message?.content === '' &&
      choice?.finish_reason === 'content_filter'
    ) {
      throw new Error(
        'Content generated by the LLM was filtered by the output filter. Please try again with a different prompt or filter configuration.'
      );
    }
    return choice?.message?.content;
  }

  private getChoices() {
    return this.data.orchestration_result.choices;
  }
}
