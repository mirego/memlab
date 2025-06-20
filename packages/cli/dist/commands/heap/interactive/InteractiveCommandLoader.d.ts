/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall memory_lab
 */
import BaseCommand from '../../../BaseCommand';
import CommandLoader from '../../../CommandLoader';
export default class InteractiveCommandLoader extends CommandLoader {
    protected shouldRegisterCommand(command: BaseCommand): boolean;
    protected postRegistration(): void;
}
//# sourceMappingURL=InteractiveCommandLoader.d.ts.map