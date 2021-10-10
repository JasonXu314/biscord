/**
 * Logging module for fancier log messages
 */
export class Logger {
	/**
	 * Creates a logger with the given name
	 * @param name the name of the module the logs are coming from
	 */
	constructor(private name: string) {}

	/**
	 * Logs a message to console
	 * @param message the main message to be logged
	 * @param args any other parts of the message
	 */
	public log(message: any, ...args: any[]): void {
		console.log(`[${this.name}]`, message, ...args);
	}

	/**
	 * Logs a message to console along with its stack trace
	 * @param message the main message to be logged
	 * @param args any other parts of the message
	 */
	public trace(message: any, ...args: any[]): void {
		console.trace(`[${this.name}]`, message, ...args);
	}

	/**
	 * Starts a timer with label ``label``
	 * @param label the label of the timer
	 */
	public time(label: string): void {
		console.time(`[${this.name}] ${label}`);
	}

	/**
	 * Ends the timer with label ``label`` and prints the output
	 * @param label the label of the timer
	 */
	public timeEnd(label: string): void {
		console.timeEnd(`[${this.name}] ${label}`);
	}
}
