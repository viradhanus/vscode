/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Language } from 'vs/base/common/platform';
import { URI } from 'vs/base/common/uri';
import { getGalleryExtensionId } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
import { ITranslations, localizeManifest } from 'vs/platform/extensionManagement/common/extensionNls';
import { IExtensionManifest } from 'vs/platform/extensions/common/extensions';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IProductService } from 'vs/platform/product/common/productService';
import { IExtensionResourceLoaderService } from 'vs/workbench/services/extensionResourceLoader/common/extensionResourceLoader';
import { ILanguagePackTranslationsService } from 'vs/workbench/services/localization/common/languagePackTranslations';

export class LanguagePackTranslationsService implements ILanguagePackTranslationsService {
	declare readonly _serviceBrand: undefined;
	private nlsUrl: URI | undefined;
	constructor(
		@IExtensionResourceLoaderService private readonly extensionResourceLoaderService: IExtensionResourceLoaderService,
		@IProductService productService: IProductService
	) {
		const nlsBaseUrl = productService.extensionsGallery?.nlsBaseUrl;
		if (nlsBaseUrl && productService.commit) {
			this.nlsUrl = URI.joinPath(URI.parse(nlsBaseUrl), productService.commit, productService.version, Language.value());
		}
	}
	public async localizeManifest(manifest: IExtensionManifest, translations: ITranslations): Promise<IExtensionManifest> {
		if (!this.nlsUrl) {
			return localizeManifest(manifest, translations);
		}
		const uri = URI.joinPath(this.nlsUrl, getGalleryExtensionId(manifest.publisher, manifest.name), 'package');
		try {
			const res = await this.extensionResourceLoaderService.readExtensionResource(uri);
			const json = JSON.parse(res.toString());
			return localizeManifest(manifest, json);
		} catch (e) {
			return localizeManifest(manifest, translations);
		}
	}
}

registerSingleton(ILanguagePackTranslationsService, LanguagePackTranslationsService, true);
