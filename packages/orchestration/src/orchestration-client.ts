import { executeRequest } from '@sap-ai-sdk/core';
import { resolveDeploymentId } from '@sap-ai-sdk/ai-api/internal.js';
import { OrchestrationResponse } from './orchestration-response.js';
import { OrchestrationChatCompletionStream } from './orchestration-chat-completion-stream.js';
import type { CustomRequestConfig } from '@sap-ai-sdk/core';
import type { ResourceGroupConfig } from '@sap-ai-sdk/ai-api/internal.js';
import type { CompletionPostRequest } from './client/api/schema/index.js';
import type {
  OrchestrationModuleConfig,
  Prompt
} from './orchestration-types.js';

/**
 * Get the orchestration client.
 */
export class OrchestrationClient {
  /**
   * Creates an instance of the orchestration client.
   * @param config - Orchestration module configuration.
   * @param deploymentConfig - Deployment configuration.
   */
  constructor(
    private config: OrchestrationModuleConfig,
    private deploymentConfig?: ResourceGroupConfig
  ) {}

  /**
   * Creates a completion for the chat messages.
   * @param prompt - Prompt configuration.
   * @param requestConfig - Request configuration.
   * @returns The completion result.
   */
  async chatCompletion(
    prompt?: Prompt,
    requestConfig?: CustomRequestConfig
  ): Promise<OrchestrationResponse> {
    const body = constructCompletionPostRequest(this.config, prompt);
    const deploymentId = await resolveDeploymentId({
      scenarioId: 'orchestration',
      resourceGroup: this.deploymentConfig?.resourceGroup
    });

    const response = await executeRequest(
      {
        url: `/inference/deployments/${deploymentId}/completion`,
        resourceGroup: this.deploymentConfig?.resourceGroup
      },
      body,
      requestConfig
    );

    return new OrchestrationResponse(response);
  }

  private async createStream(
    controller: AbortController,
    prompt?: Prompt,
    requestConfig?: CustomRequestConfig
  ): Promise<OrchestrationChatCompletionStream<any>> {
    const body = constructCompletionPostRequest(this.config, prompt, true);
    const deploymentId = await resolveDeploymentId({
      scenarioId: 'orchestration',
      resourceGroup: this.deploymentConfig?.resourceGroup
    });

    const response = await executeRequest(
      {
        url: `/inference/deployments/${deploymentId}/completion`,
        resourceGroup: this.deploymentConfig?.resourceGroup
      },
      body,
      {
        ...requestConfig,
        signal: controller.signal
      }
    );
    return OrchestrationChatCompletionStream._create(response, controller);
  };
}

/**
 * @internal
 */
export function constructCompletionPostRequest(
  config: OrchestrationModuleConfig,
  prompt?: Prompt,
  stream = false
): CompletionPostRequest {
  return {
    orchestration_config: {
      stream,
      module_configurations: {
        templating_module_config: {
          template: config.templating.template
        },
        llm_module_config: config.llm,
        ...(Object.keys(config?.filtering || {}).length && {
          filtering_module_config: config.filtering
        }),
        ...(Object.keys(config?.masking || {}).length && {
          masking_module_config: config.masking
        }),
        ...(Object.keys(config?.grounding || {}).length && {
          grounding_module_config: config.grounding
        })
      }
    },
    ...(prompt?.inputParams && {
      input_params: prompt.inputParams
    }),
    ...(prompt?.messagesHistory && {
      messages_history: prompt.messagesHistory
    })
  };
}
