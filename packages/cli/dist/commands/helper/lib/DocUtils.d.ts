/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import type { CommandOptionExample } from '@memlab/core';
type GenerateExampleCommandOption = {
    descriptionAsBashComment?: boolean;
};
declare function generateExampleCommand(command: string, cliExample: CommandOptionExample, options?: GenerateExampleCommandOption): string;
declare function indentText(description: string, indent: string): string;
declare const _default: {
    indentText: typeof indentText;
    generateExampleCommand: typeof generateExampleCommand;
};
export default _default;
//# sourceMappingURL=DocUtils.d.ts.map