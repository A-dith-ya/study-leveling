type LogLevel = "debug" | "info" | "warn" | "error";

const isDebugMode = process.env.NODE_ENV !== "production";

export const logger = {
  debug: (...args: any[]) => {
    if (isDebugMode) {
      console.log("🔍 DEBUG:", ...args);
    }
  },

  info: (...args: any[]) => {
    if (isDebugMode) {
      console.log("ℹ️ INFO:", ...args);
    }
  },

  warn: (...args: any[]) => {
    console.warn("⚠️ WARN:", ...args);
  },

  error: (...args: any[]) => {
    console.error("❌ ERROR:", ...args);
  },

  object: (label: string, obj: any, level: LogLevel = "debug") => {
    if (!isDebugMode && level === "debug") return;
    console.log(`${label}:`, JSON.stringify(obj, null, 2));
  },

  logDivider: () => {
    console.log(
      "--------------------------------------------------------------------------------------------------------------------------------"
    );
  },
};
