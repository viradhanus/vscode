/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ITranslations } from 'vs/platform/extensionManagement/common/extensionNls';
import { IExtensionManifest } from 'vs/platform/extensions/common/extensions';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';

export const ILanguagePackTranslationsService = createDecorator<ILanguagePackTranslationsService>('languagePackTranslationsService');

export interface ILanguagePackTranslationsService {
	_serviceBrand: undefined;
	localizeManifest(manifest: IExtensionManifest, fallbackTranslations: ITranslations): Promise<IExtensionManifest>;
}
