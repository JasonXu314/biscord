/**
 * Class for handling custom events
 */
export class EventSrc<T extends Record<string, any | undefined>> {
	/**
	 * The listeners registered on this source
	 */
	private _listeners: ListenerMap<T>;

	/**
	 * Creates a new event source
	 * @param evts The events you want this to handle
	 */
	constructor() {
		this._listeners = {} as ListenerMap<T>;
	}

	/**
	 * Adds a listener to the event
	 * @param event the event to listen to
	 * @param listener the listener to add
	 * @returns the listener
	 */
	public on<E extends keyof T>(event: E, listener: EvtListener<T[E]>): Unsubscriber {
		if (!this._listeners[event]) {
			this._listeners[event] = [];
		}

		this._listeners[event].push(listener);
		return () => {
			this._listeners[event] = this._listeners[event].filter((l) => l !== listener);
		};
	}

	/**
	 * Triggers the listeners for the event
	 * @param event the event to trigger
	 */
	public dispatch<E extends keyof T>(event: E, ...data: [T[E]]): void {
		this._listeners[event].forEach((listener: T[E]) => (data ? listener(...data) : listener()));
	}
}
