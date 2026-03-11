/**
 * ToastService - OOP-style singleton service for global toast notifications
 * 
 * Usage anywhere in the application:
 * Toast.success("Message")
 * Toast.error("Message")
 * Toast.info("Message")
 * Toast.warning("Message")
 * 
 * With position:
 * Toast.success("Message", "center")  // Main app
 * Toast.success("Message", "auth")    // Login/Register pages
 */

class ToastService {
    /**
     * Show a success toast (green)
     * @param {string} message - The message to display
     * @param {string} position - Position type: "center" or "auth" (default: "center")
     */
    success(message, position = "center") {
        this.show(message, "success", position);
    }

    /**
     * Show an error toast (red)
     * @param {string} message - The message to display
     * @param {string} position - Position type: "center" or "auth" (default: "center")
     */
    error(message, position = "center") {
        this.show(message, "error", position);
    }

    /**
     * Show an info toast (blue)
     * @param {string} message - The message to display
     * @param {string} position - Position type: "center" or "auth" (default: "center")
     */
    info(message, position = "center") {
        this.show(message, "info", position);
    }

    /**
     * Show a warning toast (orange)
     * @param {string} message - The message to display
     * @param {string} position - Position type: "center" or "auth" (default: "center")
     */
    warning(message, position = "center") {
        this.show(message, "warning", position);
    }

    /**
     * Internal method to dispatch toast event
     * @param {string} message - The message to display
     * @param {string} type - Toast type: success, error, info, warning
     * @param {string} position - Position type: center or auth
     */
    show(message, type, position) {
        window.dispatchEvent(
            new CustomEvent("toast", {
                detail: { message, type, position }
            })
        );
    }
}

// Export as singleton instance
export default new ToastService();

