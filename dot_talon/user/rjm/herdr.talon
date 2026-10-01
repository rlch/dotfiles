# herdr agents — global, so they work from the browser too (Ghostty is brought
# forward first). The panel itself is drawn by the Talon HUD.
mode: user.lean
mode: command
-
agents: user.herdr_agents_toggle()
agents waiting: user.herdr_agents_status("waiting")
agents working: user.herdr_agents_status("working")
# By letter, in the Talon alphabet: "agent bat". The letter is the one herdr's
# sidebar and the HUD show (the agent-tags herdr plugin).
agent {user.herdr_letter}: user.herdr_agent_letter(herdr_letter)
agent {user.herdr_word}: user.herdr_agent_word(herdr_word)
agent ready: user.herdr_agent_ready()
# The top of herdr's priority queue, as its agent panel sorts it.
(agent | agents) latest: user.herdr_agent_latest()
agent back: user.herdr_agent_back()
agent status: user.herdr_agent_status()
peek {user.herdr_letter}: user.herdr_agent_peek(herdr_letter)
peek close: user.hud_widget("peek", "hide")
# Dictate to another agent and come straight back.
tell {user.herdr_letter}: user.herdr_tell_letter(herdr_letter)
tell {user.herdr_word}: user.herdr_tell_word(herdr_word)
