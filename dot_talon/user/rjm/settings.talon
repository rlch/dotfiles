# Feedback UI is the Talon HUD (~/dev/plugins/talon/hud, fed by hud.py): mode,
# last phrase, history and the herdr agents panel. Community's own mode
# indicator and subtitles stay off so the two do not double up.
-
settings():
    user.mode_indicator_show = false
    user.subtitles_show = false

    # Save every utterance to ~/.talon/recordings with what Talon made of it.
    # Temporary: the audio is the test set for our own recogniser
    # (~/dev/spikes/voice). Turn off once that is measured.
    speech.record_all = true
