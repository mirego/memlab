"use strict";
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
Object.defineProperty(exports, "__esModule", { value: true });
function generateExampleCommand(command, cliExample, options = {}) {
    if (typeof cliExample === 'string') {
        return exampleFromCliOptionString(command, cliExample);
    }
    let commandExample = '';
    if (cliExample.description != null &&
        // if it's not null, undefined, or true
        options.descriptionAsBashComment !== false) {
        const desc = cliExample.description.trim();
        if (desc.length > 0) {
            // inject the description as a bash command in the bash example
            const bashText = cliExample.description
                .trim()
                .split('\n')
                .map(line => `# ${line.trim()}`)
                .join('\n');
            commandExample += bashText + '\n';
        }
    }
    commandExample += exampleFromCliOptionString(command, cliExample.cliOptionExample);
    return commandExample;
}
function exampleFromCliOptionString(command, cliExample) {
    return `memlab ${command} ${cliExample.trim()}`;
}
function getCLIWidth() {
    return process.stdout.columns || 80; // Default to 80 if undefined
}
function indentText(description, indent) {
    const cliWidth = getCLIWidth();
    const availableWidth = cliWidth - indent.length;
    const lines = [];
    // Split the description by \n to handle existing line breaks
    const descriptionLines = description.split('\n');
    descriptionLines.forEach(descLine => {
        const words = descLine.split(/\s+/);
        let line = '';
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            if (line.length === 0) {
                // Start a new line with the word
                if (word.length > availableWidth) {
                    // The word itself is longer than the available width
                    // Split the word
                    let start = 0;
                    while (start < word.length) {
                        const part = word.substring(start, start + availableWidth);
                        lines.push(indent + part);
                        start += availableWidth;
                    }
                    line = '';
                }
                else {
                    line = word;
                }
            }
            else {
                const potentialLine = line + ' ' + word;
                if (potentialLine.length <= availableWidth) {
                    line = potentialLine;
                }
                else {
                    // Line is full, push it and start new line
                    lines.push(indent + line);
                    if (word.length > availableWidth) {
                        // The word itself is longer than the available width
                        // Split the word
                        let start = 0;
                        while (start < word.length) {
                            const part = word.substring(start, start + availableWidth);
                            lines.push(indent + part);
                            start += availableWidth;
                        }
                        line = '';
                    }
                    else {
                        line = word;
                    }
                }
            }
        }
        // Push the last line if any
        if (line.length > 0) {
            lines.push(indent + line);
        }
    });
    // Join all lines with \n
    return lines.join('\n');
}
exports.default = {
    indentText,
    generateExampleCommand,
};
