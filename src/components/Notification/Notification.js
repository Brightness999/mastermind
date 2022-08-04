/**
 * Notification interface, need subclass implementation
 */
export default class Notification {
  static success(config) {/* success */}

  static error(config) {/* failure */}

  static info(config) {/* information */}

  static warning(config) {/* caveat */}

  static warn(config) {/* caveat */}

  static close(key) {/* shut down */}

  static destroy() {/* destroy */}
}
