/*
 *  The MIT License (MIT)
 *
 * Copyright (c) 2016-2017 The Regents of the University of California
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the
 * following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
 * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

import {GoogleAuth} from '../node_modules/igv-utils/src/index.js';
import { AlertSingleton, createSessionWidgets, createTrackWidgetsWithTrackRegistry, dropboxButtonImageBase64, dropboxDropdownItem, EventBus, googleDriveButtonImageBase64, googleDriveDropdownItem } from '../node_modules/igv-widgets/dist/igv-widgets.js'
import Globals from "./globals.js"
import {creatGenomeWidgets, genomeWidgetConfigurator, initializeGenomeWidgets} from './genomeWidgets.js';
import {createShareWidgets, shareWidgetConfigurator} from './shareWidgets.js';
import {sessionURL} from './shareHelper.js';
import {createSVGWidget} from './svgWidget.js';
import GtexUtils from "./gtexUtils.js";
import version from "./version.js";

let browserHTML='<nav class="navbar py-0 navbar-expand-sm navbar-dark justify-content-between">    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#igv-app-navbar-navigation">        <span class="navbar-toggler-icon"></span>    </button>    <div id="igv-app-navbar-navigation" class="collapse navbar-collapse">        <ul class="navbar-nav">            <!-- Genome -->            <li class="nav-item px-3">                <div class="dropdown">                    <a id="igv-app-genome-dropdown-button" class="dropdown-toggle" href="#" data-toggle="dropdown">                        Genome                    </a>                    <div id="igv-app-genome-dropdown-menu" class="dropdown-menu">                        <!-- local file -->                        <label class="dropdown-item btn btn-default btn-file">                            <div class="igv-app-dropdown-item-cloud-storage">                                <div>                                    Local File ...                                </div>                                <div>                                    <input id="igv-app-dropdown-local-genome-file-input" type="file" name="file"                                           multiple style="display: none;">                                </div>                            </div>                        </label>                        <!-- Dropbox -->                        <div class="dropdown-item">                            <div id="igv-app-dropdown-dropbox-genome-file-button"                                 class="igv-app-dropdown-item-cloud-storage">                                <div>Dropbox</div>                                <div><img id="igv-app-genome-dropbox-button-image" width="18" height="18"></div>                                <div>...</div>                            </div>                        </div>                        <!-- Google Drive -->                        <div class="dropdown-item">                            <div id="igv-app-dropdown-google-drive-genome-file-button"                                 class="igv-app-dropdown-item-cloud-storage">                                <div>Google Drive</div>                                <div><img id="igv-app-genome-google-drive-button-image" width="18" height="18"></div>                                <div>...</div>                            </div>                        </div>                        <!-- URL -->                        <button class="dropdown-item" type="button" data-toggle="modal"                                data-target="#igv-app-genome-from-url-modal">URL ...                        </button>                        <div id="igv-app-genome-dropdown-divider" class="dropdown-divider"></div>                    </div>                </div>            </li>            <!-- Tracks -->            <li class="nav-item px-3">                <div id="igv-app-track-dropdown" class="dropdown">                    <a id="igv-track-dropdown-button" class="dropdown-toggle" href="#" data-toggle="dropdown">                        Tracks                    </a>                    <div id="igv-app-track-dropdown-menu" class="dropdown-menu">                        <!-- local file -->                        <label class="dropdown-item btn btn-default btn-file">                            <div class="igv-app-dropdown-item-cloud-storage">                                <div>                                    Local File ...                                </div>                                <div>                                    <input id="igv-app-dropdown-local-track-file-input" type="file" name="file" multiple                                           style="display: none;">                                </div>                            </div>                        </label>                        <!-- Dropbox -->                        <div class="dropdown-item">                            <div id="igv-app-dropdown-dropbox-track-file-button"                                 class="igv-app-dropdown-item-cloud-storage">                                <div>Dropbox</div>                                <div><img id="igv-app-track-dropbox-button-image" width="18" height="18"></div>                                <div>...</div>                            </div>                        </div>                        <!-- Google Drive -->                        <div class="dropdown-item">                            <div id="igv-app-dropdown-google-drive-track-file-button"                                 class="igv-app-dropdown-item-cloud-storage">                                <div>Google Drive</div>                                <div><img id="igv-app-track-google-drive-button-image" width="18" height="18"></div>                                <div>...</div>                            </div>                        </div>                        <!-- URL -->                        <button class="dropdown-item" type="button" data-toggle="modal"                                data-target="#igv-app-track-from-url-modal">                            URL ...                        </button>                        <div id="igv-app-annotations-section" class="dropdown-divider">                        </div>                    </div>                </div>            </li>            <!-- Session -->            <li class="nav-item px-3">                <div class="dropdown">                    <a id="igv-app-session-dropdown-button" class="dropdown-toggle" href="#" data-toggle="dropdown">                        Session                    </a>                    <div id="igv-session-dropdown-menu" class="dropdown-menu">                        <!-- Load local session file -->                        <label class="dropdown-item btn btn-default btn-file">                            <div class="igv-app-dropdown-item-cloud-storage">                                <div>                                    Local File ...                                </div>                                <div>                                    <input id="igv-app-dropdown-local-session-file-input" type="file" name="file"                                           style="display: none;">                                </div>                            </div>                        </label>                        <!-- Dropbox -->                        <!-- Google Drive -->                        <!-- Session URL -->                        <button class="dropdown-item" type="button" data-toggle="modal"                                data-target="#igv-app-session-url-modal">                            Load URL ...                        </button>                        <div class="dropdown-divider"></div>                        <!-- Save local session file -->                        <button id="igv-app-session-save-button" class="dropdown-item" type="button">                            Save ...                        </button>                    </div>                </div>            </li>            <!-- Share (generate URL) -->            <li class="nav-item px-3">                <div>                    <a id="igv-app-share-button" href="#" data-toggle="modal" data-target="#igv-app-share-modal">                        Share                    </a>                </div>            </li>            <!-- Bookmark -->            <li class="nav-item px-3">                <div>                    <a id="igv-app-bookmark-button" href="#">                        Bookmark                    </a>                </div>            </li>            <!-- Save SVG -->            <li class="nav-item px-3">                <div>                    <a id="igv-app-save-svg-button" href="#" data-toggle="modal" data-target="#igv-app-svg-save-modal">                        Save SVG                    </a>                </div>            </li>            <!-- Help Menu -->            <li class="nav-item px-3">                <div id="igv-app-help-dropdown" class="dropdown">                    <a id="igv-app-help-button" class="dropdown-toggle" href="#" data-toggle="dropdown">                        Help                    </a>                    <div class="dropdown-menu">                        <a class="dropdown-item" href="https://igvteam.github.io/igv-webapp/" target="_blank">Documentation</a>                        <a class="dropdown-item" href="https://github.com/igvteam/igv-webapp" target="_blank">GitHub                            Repository</a>                        <a class="dropdown-item" href="https://groups.google.com/group/igv-help" target="_blank">User                            Forum</a>                        <a class="dropdown-item" href="#" data-toggle="modal" data-target="#igv-app-help-about-modal">About                            IGV-Web</a>                    </div>                </div>            </li>        </ul>    </div></nav><main id="igv-main" role="main" class="container-fluid">    <!-- App container -->    <div class="row">        <div class="col-sm">            <div id="igv-app-container">            </div>        </div>    </div>    <!-- Share URL Modal -->    <div id="igv-app-share-modal" class="modal fade">        <div class="modal-dialog">            <div class="modal-content">                <div class="modal-header">                    <div id="igv-app-share-input-modal-close-button" class="modal-title">Share</div>                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">                        <span aria-hidden="true">&times;</span>                    </button>                </div>                <div class="modal-body">                    <div class="container-fluid">                        <!-- copy url -->                        <div class="row">                            <div class="col-sm-8">                                <div class="form-group">                                    <input id="igv-app-share-input" type="text" class="form-control" placeholder="">                                </div>                            </div>                            <div class="col-sm-2">                                <button id="igv-app-copy-link-button" type="button" class="btn btn-sm btn-default">                                    COPY                                </button>                            </div>                        </div>                        <!-- social buttons -->                        <div class="igv-app-social-button-container">                            <div id="igv-app-tweet-button-container">                                <a href="https://twitter.com/share?ref_src=twsrc%5Etfw" class="twitter-share-button"                                   data-show-count="false">TWEET</a>                            </div>                            <div>                                <a id="igv-app-email-button" href="mailto:?body=https://aidenlab.org/juicebox">EMAIL</a>                            </div>                            <div id="igv-app-embed-button">EMBED</div>                            <div id="igv-app-qrcode-button">QR CODE</div>                        </div>                        <!-- qr code image -->                        <div class="row justify-content-center">                            <div id="igv-app-qrcode-image" class="col-4"></div>                        </div>                        <!-- embed widget -->                        <div id="igv-app-embed-container" class="row">                            <div class="col-sm-9 form-group">                                <textarea class="form-control" rows="4"></textarea>                            </div>                            <div class="col-sm-3">                                <button type="button" class="btn btn-default">COPY</button>                            </div>                        </div>                    </div>                </div>            </div>        </div>    </div>    <!-- SVG save -->    <div id="igv-app-svg-save-modal" class="modal fade igv-app-file-save-modal">        <div class="modal-dialog modal-lg">            <div class="modal-content">                <div class="modal-header">                    <div id="igv-app-svg-save-modal-label" class="modal-title">                        <div>                            Save SVG File                        </div>                    </div>                    <button type="button" class="close" data-dismiss="modal">                        <span aria-hidden="true">&times;</span>                    </button>                </div>                <div class="modal-body">                    <input class="form-control" type="text" placeholder="igv-app.svg">                    <div>                        Enter filename with .svg suffix                    </div>                </div>                <div class="modal-footer">                    <button type="button" class="btn btn-sm btn-outline-secondary" data-dismiss="modal">Cancel</button>                    <button type="button" class="btn btn-sm btn-secondary">OK</button>                </div>            </div>        </div>    </div>    <!-- Help - About - Modal -->    <div id="igv-app-help-about-modal" class="modal fade" tabindex="-1">        <div class="modal-dialog">            <div class="modal-content">                <div class="modal-header">                    <h5 class="modal-title">About IGV-Web</h5>                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">                        <span aria-hidden="true">&times;</span>                    </button>                </div>                <div class="modal-body">                    <div id="igv-app-version"></div>                    <div id="igv-igvjs-version"></div>                </div>                <div class="modal-footer">                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>                </div>            </div>        </div>    </div></main>'

function getBrowser(){
	return Globals.browser
}

function createWebApp(parentDiv){
	let $igvWebApp = $($.parseHTML(browserHTML));
	$(parentDiv).append($igvWebApp)

	main($('#igv-app-container'), igvwebConfig);
}

let googleEnabled = false;

async function main($container, config) {

    AlertSingleton.init($container.get(0))

    $('#igv-app-version').text(`IGV-Web app version ${version()}`)
    $('#igv-igvjs-version').text(`igv.js version ${igv.version()}`)

    const enableGoogle = (config.clientId  || config.apiKey) &&
        (window.location.protocol === "https:" || window.location.host === "localhost");

    if (enableGoogle) {
        try {
            await GoogleAuth.init({
                client_id: config.clientId,
                apiKey: config.apiKey,
                scope: 'https://www.googleapis.com/auth/userinfo.profile',
            })
            await GoogleAuth.signOut();   // The await is important !!!
            googleEnabled = true;
        } catch (e) {
            console.error(e);
            AlertSingleton.present(e.message)
        }
    }

    // Load genomes for use by igv.js and webapp
    if (config.genomes) {
        let tmp = await getGenomesArray(config.genomes);
        config.genomes = tmp;
        config.igvConfig.genomes = tmp;
    }

    const igvConfig = config.igvConfig;

    if(config.restoreLastGenome) {
        const lastGenomeId = localStorage.getItem("genomeID");
        if (lastGenomeId && lastGenomeId !== igvConfig.genome) {
            igvConfig.genome = lastGenomeId;
            igvConfig.tracks = [];
        }
    }

    const browser = await igv.createBrowser($container.get(0), igvConfig);

    if (browser) {
        Globals.browser = browser;
        await initializationHelper(browser, $container, config);
    }
}

async function setGenome(genomeID){
	EventBus.globalBus.post({type: "DidChangeGenome", data: {genomeID: genomeID}});
}

async function initializationHelper(browser, $container, options) {

    ['track', 'genome'].forEach(str => {
        let imgElement;

        imgElement = document.querySelector(`img#igv-app-${str}-dropbox-button-image`);
        imgElement.src = `data:image/svg+xml;base64,${dropboxButtonImageBase64()}`;

        imgElement = document.querySelector(`img#igv-app-${str}-google-drive-button-image`);
        imgElement.src = `data:image/svg+xml;base64,${googleDriveButtonImageBase64()}`;
    })

    // Session - Dropbox and Google Drive buttons
    $('div#igv-session-dropdown-menu > :nth-child(1)').after(dropboxDropdownItem('igv-app-dropdown-dropbox-session-file-button'));
    $('div#igv-session-dropdown-menu > :nth-child(2)').after(googleDriveDropdownItem('igv-app-dropdown-google-drive-session-file-button'));

    creatGenomeWidgets(genomeWidgetConfigurator(googleEnabled))
    await initializeGenomeWidgets(browser, options.genomes, $('#igv-app-genome-dropdown-menu'))

    const $main = $('#igv-main')

    createTrackWidgetsWithTrackRegistry($main,
        $('#igv-app-track-dropdown-menu'),
        $('#igv-app-dropdown-local-track-file-input'),
        $('#igv-app-dropdown-dropbox-track-file-button'),
        googleEnabled,
        $('#igv-app-dropdown-google-drive-track-file-button'),
        ['igv-app-encode-signal-modal', 'igv-app-encode-others-modal'],
        'igv-app-track-from-url-modal',
        'igv-app-track-select-modal',
        GtexUtils,
        options.trackRegistryFile,
        async configurations => await browser.loadTrackList(configurations));

    $('#igv-app-session-save-button').on('click', () => {

        let json = undefined
        try {
            json = browser.toJSON()
        } catch (e) {
            AlertSingleton.present(e.message)
        }

        if (json) {
            $('#igv-app-session-save-modal').modal('show')
        }

    })

    createSessionWidgets($main,
        igv.xhr,
        'igv-webapp',
        'igv-app-dropdown-local-session-file-input',
        'igv-app-dropdown-dropbox-session-file-button',
        'igv-app-dropdown-google-drive-session-file-button',
        'igv-app-session-url-modal',
        'igv-app-session-save-modal',
        googleEnabled,
        async config => {await browser.loadSession(config)}, () => browser.toJSON());

    createSVGWidget({browser, $saveModal: $('#igv-app-svg-save-modal')})

    createShareWidgets(shareWidgetConfigurator(browser, $container, options));

    createAppBookmarkHandler($('#igv-app-bookmark-button'));

    EventBus.globalBus.post({type: "DidChangeGenome", data: {genomeID: browser.genome.id}});
}

function createAppBookmarkHandler($bookmark_button) {

    $bookmark_button.on('click', (e) => {

        let url = undefined
        try {
            url = sessionURL()
        } catch (e) {
            AlertSingleton.present(e.message)
        }

        if (url) {
            window.history.pushState({}, "IGV", url);

            const str = (/Mac/i.test(navigator.userAgent) ? 'Cmd' : 'Ctrl');
            const blurb = 'A bookmark URL has been created. Press ' + str + '+D to save.';
            alert(blurb);
        }
    })
}

async function getGenomesArray(genomes) {

    if (undefined === genomes) {
        return undefined;
    }
    if (Array.isArray(genomes)) {
        return genomes;
    } else {

        let response = undefined;
        try {
            response = await fetch(genomes);
            return response.json();
        } catch (e) {
            AlertSingleton.present(e.message);
        }
    }
}

export default {createWebApp, getBrowser, setGenome}
