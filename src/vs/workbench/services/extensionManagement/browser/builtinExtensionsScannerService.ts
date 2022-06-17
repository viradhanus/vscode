/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IBuiltinExtensionsScannerService, ExtensionType, IExtensionManifest, IExtension, TargetPlatform } from 'vs/platform/extensions/common/extensions';
import { isWeb } from 'vs/base/common/platform';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { getGalleryExtensionId } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
import { FileAccess } from 'vs/base/common/network';
import { ILanguagePackTranslationsService } from 'vs/workbench/services/localization/common/languagePackTranslations';

interface IBundledExtension {
	extensionPath: string;
	packageJSON: IExtensionManifest;
	packageNLS?: any;
	readmePath?: string;
	changelogPath?: string;
}

export class BuiltinExtensionsScannerService implements IBuiltinExtensionsScannerService {

	declare readonly _serviceBrand: undefined;

	private readonly builtinExtensions: Promise<IExtension>[] = [];

	constructor(
		@IWorkbenchEnvironmentService environmentService: IWorkbenchEnvironmentService,
		@IUriIdentityService uriIdentityService: IUriIdentityService,
		@ILanguagePackTranslationsService languagePackTranslationsService: ILanguagePackTranslationsService
	) {
		if (isWeb) {
			const builtinExtensionsServiceUrl = FileAccess.asBrowserUri('../../../../../../extensions', require);
			if (builtinExtensionsServiceUrl) {
				let bundledExtensions: IBundledExtension[] = [];

				if (environmentService.isBuilt) {
					// Built time configuration (do NOT modify)
					bundledExtensions = [/*BUILD->INSERT_BUILTIN_EXTENSIONS*/];
				} else {
					// Find builtin extensions by checking for DOM
					const builtinExtensionsElement = document.getElementById('vscode-workbench-builtin-extensions');
					const builtinExtensionsElementAttribute = builtinExtensionsElement ? builtinExtensionsElement.getAttribute('data-settings') : undefined;
					if (builtinExtensionsElementAttribute) {
						try {
							bundledExtensions = JSON.parse(builtinExtensionsElementAttribute);
						} catch (error) { /* ignore error*/ }
					}
				}

				this.builtinExtensions = bundledExtensions.map(async e => {
					const id = getGalleryExtensionId(e.packageJSON.publisher, e.packageJSON.name);
					return {
						identifier: { id },
						location: uriIdentityService.extUri.joinPath(builtinExtensionsServiceUrl!, e.extensionPath),
						type: ExtensionType.System,
						isBuiltin: true,
						manifest: e.packageNLS ? await languagePackTranslationsService.localizeManifest(e.packageJSON, e.packageNLS) : e.packageJSON,
						readmeUrl: e.readmePath ? uriIdentityService.extUri.joinPath(builtinExtensionsServiceUrl!, e.readmePath) : undefined,
						changelogUrl: e.changelogPath ? uriIdentityService.extUri.joinPath(builtinExtensionsServiceUrl!, e.changelogPath) : undefined,
						targetPlatform: TargetPlatform.WEB,
						validations: [],
						isValid: true
					};
				});
			}
		}
	}

	async scanBuiltinExtensions(): Promise<IExtension[]> {
		return [...await Promise.all(this.builtinExtensions)];
	}
}

registerSingleton(IBuiltinExtensionsScannerService, BuiltinExtensionsScannerService);
