import type { Plugin } from "@opencode-ai/plugin";

export const NotificationPlugin: Plugin = async ({ app, client, $ }) => {
  return {
    event: async ({ event }) => {
      // Send notification on session completion
      if (event.type === "session.idle") {
        try {
          console.log("Session idle triggered");

          // Try to get app and session info
          const appInfo = await client.app.get();
          const sessionInfo = await client.session.get({
            path: { id: event.properties.sessionID },
          });

          // Get folder name from current working directory path
          const folderPath = appInfo.data?.path?.cwd || "unknown";
          const folderName = folderPath.split("/").pop() || "unknown";
          const sessionTitle = sessionInfo.data?.title || "Session completed";

          const message = `[${folderName}] ${sessionTitle}`;
          console.log(`Sending zellij notification: ${message}`);

          await $`zellij pipe "zjstatus::notify::${message}"`;
        } catch (error) {
          console.error("Plugin error:", error);
          await $`zellij pipe "zjstatus::notify::[opencode] Session completed"`;
        }
      }
    },
  };
};
