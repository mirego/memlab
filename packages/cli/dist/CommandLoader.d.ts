/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import BaseCommand from './BaseCommand';
export default class CommandLoader {
    protected isLoaded: boolean;
    protected OSSModules: Map<string, BaseCommand>;
    protected modules: Map<string, BaseCommand>;
    protected modulePaths: Map<string, string>;
    getModules(): Map<string, BaseCommand>;
    getModulePaths(): Map<string, string>;
    registerCommands(): void;
    protected shouldRegisterCommand(command: BaseCommand): boolean;
    protected registerCommandsFromDir(modulesDir: string): void;
    protected postRegistration(): void;
}
//# sourceMappingURL=CommandLoader.d.ts.map