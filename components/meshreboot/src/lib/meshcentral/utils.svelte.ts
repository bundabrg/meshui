export class DeferredLoader<T> {
	private loadFn?: (obj: DeferredLoader<T>) => void;
	private promise: Promise<T>;
	private resolve?: (value: PromiseLike<T> | T) => void;
	private reject?: (reason?: any) => void;
	private loading: boolean;
	private _data: T;

	constructor(initArgs: {
		setupFn?: (obj: DeferredLoader<T>) => void;
		loadFn?: (obj: DeferredLoader<T>) => void;
		initialData: T;
	}) {
		this.loadFn = initArgs.loadFn;
		this.promise = new Promise((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		});
		this._data = $state(initArgs.initialData);
		this.loading = false;

		if (initArgs.setupFn) {
			initArgs.setupFn(this);
		}
	}

	async awaitGet() {
		this.load();
		return this.promise;
	}

	private load() {
		if (!this.loading) {
			this.loading = true;
			if (this.loadFn) {
				this.loadFn(this);
			}
		}
	}

	refresh() {
		this.loading = false;
		this.load();
	}

	set(data: T) {
		this._data = data;
		if (this.resolve) {
			this.resolve(data);
		}
	}

	get(): T {
		this.load();
		return this._data;
	}
}
