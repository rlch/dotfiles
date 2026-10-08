// How an answer to an inbox file reaches the agent that wrote it: through herdfile.
import { plugin } from "@abyme/server";

export default plugin("inbox", {
  options: { deliver: ["herdfile", "tell", "{from}", "{answer}\n(item: {path})"] },
});
