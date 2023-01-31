export class Constants {
    static #canvasHeightMargin = 30;
    static get canvasHeightMargin() {
        return this.#canvasHeightMargin;
    }
}

// Custom (img-)asset loader, 'cause why not
export class Assets {
    #imgLoading = 0;
    #assets = {};
    #loadedAssets = {};
    #loadedHandler;
    #imgLoaded = () => (--this.#imgLoading === 0) && this.#loadedHandler && this.#loadedHandler();

    #initAssets() {
        for (const [key, value] of Object.entries(this.#assets)) {
            const img = new Image();
            img.src = value;
            this.#imgLoading++;
            img.onload = this.#imgLoaded;

        	this.#loadedAssets[key] = img;
        }
    }

    constructor(assets, loadedHandler) {
        this.assets = assets;
        this.loadedHandler = loadedHandler;
        this.#initAssets();
    }

    getAsset(key) {
        return this.#imgLoading === 0 ? this.#loadedAssets[key] : undefined;
    }
}