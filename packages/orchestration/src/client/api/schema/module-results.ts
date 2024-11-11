/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import type { ChatMessages } from './chat-messages.js';
import type { GenericModuleResult } from './generic-module-result.js';
/**
 * Results of each module.
 */
export type ModuleResults = {
  templating?: ChatMessages;
  input_masking?: GenericModuleResult;
  input_filtering?: GenericModuleResult;
  output_filtering?: GenericModuleResult;
};
