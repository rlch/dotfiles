# Print an optspec for argparse to handle cmd's options that are independent of any subcommand.
function __fish_tz_global_optspecs
	string join \n h/help
end

function __fish_tz_needs_command
	# Figure out if the current invocation already has a command.
	set -l cmd (commandline -opc)
	set -e cmd[1]
	argparse -s (__fish_tz_global_optspecs) -- $cmd 2>/dev/null
	or return
	if set -q argv[1]
		# Also print the command, so this can be used to figure out what it is.
		echo $argv[1]
		return 1
	end
	return 0
end

function __fish_tz_using_subcommand
	set -l cmd (__fish_tz_needs_command)
	test -z "$cmd"
	and return 1
	contains -- $cmd[1] $argv
end

complete -c tz -n "__fish_tz_needs_command" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_needs_command" -f -a "dev" -d 'Build + run + watch + restart (replaces dx serve)'
complete -c tz -n "__fish_tz_needs_command" -f -a "build" -d 'Build the project (replaces dx build)'
complete -c tz -n "__fish_tz_needs_command" -f -a "bundle" -d 'Bundle into platform-specific distributable (replaces dx bundle)'
complete -c tz -n "__fish_tz_needs_command" -f -a "run" -d 'Run without hot-reload (replaces dx run)'
complete -c tz -n "__fish_tz_needs_command" -f -a "fmt" -d 'Format RSX blocks (replaces dx fmt)'
complete -c tz -n "__fish_tz_needs_command" -f -a "check" -d 'Lint RSX syntax (replaces dx check)'
complete -c tz -n "__fish_tz_needs_command" -f -a "translate" -d 'Convert HTML to RSX (replaces dx translate)'
complete -c tz -n "__fish_tz_needs_command" -f -a "new" -d 'Create a new Tanzo project (replaces dx new)'
complete -c tz -n "__fish_tz_needs_command" -f -a "init" -d 'Initialize Tanzo in an existing directory (replaces dx init)'
complete -c tz -n "__fish_tz_needs_command" -f -a "config" -d 'CLI configuration'
complete -c tz -n "__fish_tz_needs_command" -f -a "doctor" -d 'Check toolchain setup (replaces dx doctor)'
complete -c tz -n "__fish_tz_needs_command" -f -a "test" -d 'Run the test suite'
complete -c tz -n "__fish_tz_needs_command" -f -a "gallery" -d 'Widget gallery management'
complete -c tz -n "__fish_tz_needs_command" -f -a "app" -d 'Interact with a running Tanzo app'
complete -c tz -n "__fish_tz_needs_command" -f -a "icons" -d 'Download Material Symbols fonts'
complete -c tz -n "__fish_tz_needs_command" -f -a "generate-icons" -d 'Regenerate the Icons enum from font files'
complete -c tz -n "__fish_tz_needs_command" -f -a "completions" -d 'Generate shell completions for tz'
complete -c tz -n "__fish_tz_needs_command" -f -a "self-update" -d 'Update tz CLI to the latest version'
complete -c tz -n "__fish_tz_needs_command" -f -a "mcp" -d 'Start the MCP server (STDIO transport for AI agents)'
complete -c tz -n "__fish_tz_needs_command" -f -a "devtools" -d 'Launch a separate devtools window connected to a running app'
complete -c tz -n "__fish_tz_needs_command" -f -a "tsx-bundle" -d 'Bundle a TSX project to dist/ (internal — used for testing)'
complete -c tz -n "__fish_tz_needs_command" -f -a "help" -d 'Print this message or the help of the given subcommand(s)'
complete -c tz -n "__fish_tz_using_subcommand dev" -l example -r
complete -c tz -n "__fish_tz_using_subcommand dev" -s p -l package -r
complete -c tz -n "__fish_tz_using_subcommand dev" -l release
complete -c tz -n "__fish_tz_using_subcommand dev" -l perf -d 'Enable performance overlay (TANZO_PERF=1)'
complete -c tz -n "__fish_tz_using_subcommand dev" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand build" -l target -r
complete -c tz -n "__fish_tz_using_subcommand build" -l example -r
complete -c tz -n "__fish_tz_using_subcommand build" -s p -l package -r
complete -c tz -n "__fish_tz_using_subcommand build" -l release
complete -c tz -n "__fish_tz_using_subcommand build" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand bundle" -l macos
complete -c tz -n "__fish_tz_using_subcommand bundle" -l dmg
complete -c tz -n "__fish_tz_using_subcommand bundle" -l msi
complete -c tz -n "__fish_tz_using_subcommand bundle" -l deb
complete -c tz -n "__fish_tz_using_subcommand bundle" -l appimage
complete -c tz -n "__fish_tz_using_subcommand bundle" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand run" -l example -r
complete -c tz -n "__fish_tz_using_subcommand run" -s p -l package -r
complete -c tz -n "__fish_tz_using_subcommand run" -l release
complete -c tz -n "__fish_tz_using_subcommand run" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand fmt" -l check
complete -c tz -n "__fish_tz_using_subcommand fmt" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand check" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand translate" -s f -l file -r -F
complete -c tz -n "__fish_tz_using_subcommand translate" -s r -l raw -r
complete -c tz -n "__fish_tz_using_subcommand translate" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand new" -l template -d 'Project template: `rust` (default) or `tsx`' -r
complete -c tz -n "__fish_tz_using_subcommand new" -l shell -d 'Target shell: `desktop` (default), `web`, or `dom`' -r
complete -c tz -n "__fish_tz_using_subcommand new" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand init" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand config; and not __fish_seen_subcommand_from set show help" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand config; and not __fish_seen_subcommand_from set show help" -f -a "set" -d 'Set a configuration value'
complete -c tz -n "__fish_tz_using_subcommand config; and not __fish_seen_subcommand_from set show help" -f -a "show" -d 'Print current configuration'
complete -c tz -n "__fish_tz_using_subcommand config; and not __fish_seen_subcommand_from set show help" -f -a "help" -d 'Print this message or the help of the given subcommand(s)'
complete -c tz -n "__fish_tz_using_subcommand config; and __fish_seen_subcommand_from set" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand config; and __fish_seen_subcommand_from show" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand config; and __fish_seen_subcommand_from help" -f -a "set" -d 'Set a configuration value'
complete -c tz -n "__fish_tz_using_subcommand config; and __fish_seen_subcommand_from help" -f -a "show" -d 'Print current configuration'
complete -c tz -n "__fish_tz_using_subcommand config; and __fish_seen_subcommand_from help" -f -a "help" -d 'Print this message or the help of the given subcommand(s)'
complete -c tz -n "__fish_tz_using_subcommand doctor" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand test" -s p -l package -r
complete -c tz -n "__fish_tz_using_subcommand test" -l gallery -d 'Run widget gallery + diff report'
complete -c tz -n "__fish_tz_using_subcommand test" -l bless -d 'Accept new/changed golden screenshots'
complete -c tz -n "__fish_tz_using_subcommand test" -l skip-render -d 'Skip GPU render tests'
complete -c tz -n "__fish_tz_using_subcommand test" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand gallery" -l flutter -d 'Regenerate Flutter reference screenshots'
complete -c tz -n "__fish_tz_using_subcommand gallery" -l report -d 'Just open the diff report'
complete -c tz -n "__fish_tz_using_subcommand gallery" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand app; and not __fish_seen_subcommand_from tree find find-all props style layout click pointer-down pointer-up hover type key scroll pump settle screenshot eval exec snapshot assert ping help" -l socket -d 'WebSocket address (host:port). Auto-discovers if omitted' -r -F
complete -c tz -n "__fish_tz_using_subcommand app; and not __fish_seen_subcommand_from tree find find-all props style layout click pointer-down pointer-up hover type key scroll pump settle screenshot eval exec snapshot assert ping help" -l pid -d 'Target app by PID' -r
complete -c tz -n "__fish_tz_using_subcommand app; and not __fish_seen_subcommand_from tree find find-all props style layout click pointer-down pointer-up hover type key scroll pump settle screenshot eval exec snapshot assert ping help" -l json -d 'Output as JSON (machine-readable)'
complete -c tz -n "__fish_tz_using_subcommand app; and not __fish_seen_subcommand_from tree find find-all props style layout click pointer-down pointer-up hover type key scroll pump settle screenshot eval exec snapshot assert ping help" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand app; and not __fish_seen_subcommand_from tree find find-all props style layout click pointer-down pointer-up hover type key scroll pump settle screenshot eval exec snapshot assert ping help" -f -a "tree" -d 'Pretty-print the component tree (default) or element tree (--elements)'
complete -c tz -n "__fish_tz_using_subcommand app; and not __fish_seen_subcommand_from tree find find-all props style layout click pointer-down pointer-up hover type key scroll pump settle screenshot eval exec snapshot assert ping help" -f -a "find" -d 'Find the first component by name'
complete -c tz -n "__fish_tz_using_subcommand app; and not __fish_seen_subcommand_from tree find find-all props style layout click pointer-down pointer-up hover type key scroll pump settle screenshot eval exec snapshot assert ping help" -f -a "find-all" -d 'Find all components by name'
complete -c tz -n "__fish_tz_using_subcommand app; and not __fish_seen_subcommand_from tree find find-all props style layout click pointer-down pointer-up hover type key scroll pump settle screenshot eval exec snapshot assert ping help" -f -a "props" -d 'Show props for a component node'
complete -c tz -n "__fish_tz_using_subcommand app; and not __fish_seen_subcommand_from tree find find-all props style layout click pointer-down pointer-up hover type key scroll pump settle screenshot eval exec snapshot assert ping help" -f -a "style" -d 'Show resolved CSS style for a component node'
complete -c tz -n "__fish_tz_using_subcommand app; and not __fish_seen_subcommand_from tree find find-all props style layout click pointer-down pointer-up hover type key scroll pump settle screenshot eval exec snapshot assert ping help" -f -a "layout" -d 'Show computed layout for a component node'
complete -c tz -n "__fish_tz_using_subcommand app; and not __fish_seen_subcommand_from tree find find-all props style layout click pointer-down pointer-up hover type key scroll pump settle screenshot eval exec snapshot assert ping help" -f -a "click" -d 'Click a component at its center'
complete -c tz -n "__fish_tz_using_subcommand app; and not __fish_seen_subcommand_from tree find find-all props style layout click pointer-down pointer-up hover type key scroll pump settle screenshot eval exec snapshot assert ping help" -f -a "pointer-down" -d 'Raw pointer down at absolute coordinates'
complete -c tz -n "__fish_tz_using_subcommand app; and not __fish_seen_subcommand_from tree find find-all props style layout click pointer-down pointer-up hover type key scroll pump settle screenshot eval exec snapshot assert ping help" -f -a "pointer-up" -d 'Raw pointer up at absolute coordinates'
complete -c tz -n "__fish_tz_using_subcommand app; and not __fish_seen_subcommand_from tree find find-all props style layout click pointer-down pointer-up hover type key scroll pump settle screenshot eval exec snapshot assert ping help" -f -a "hover" -d 'Hover a component'
complete -c tz -n "__fish_tz_using_subcommand app; and not __fish_seen_subcommand_from tree find find-all props style layout click pointer-down pointer-up hover type key scroll pump settle screenshot eval exec snapshot assert ping help" -f -a "type" -d 'Enter text into a component'
complete -c tz -n "__fish_tz_using_subcommand app; and not __fish_seen_subcommand_from tree find find-all props style layout click pointer-down pointer-up hover type key scroll pump settle screenshot eval exec snapshot assert ping help" -f -a "key" -d 'Press a key'
complete -c tz -n "__fish_tz_using_subcommand app; and not __fish_seen_subcommand_from tree find find-all props style layout click pointer-down pointer-up hover type key scroll pump settle screenshot eval exec snapshot assert ping help" -f -a "scroll" -d 'Scroll a component'
complete -c tz -n "__fish_tz_using_subcommand app; and not __fish_seen_subcommand_from tree find find-all props style layout click pointer-down pointer-up hover type key scroll pump settle screenshot eval exec snapshot assert ping help" -f -a "pump" -d 'Advance one frame (default 16ms)'
complete -c tz -n "__fish_tz_using_subcommand app; and not __fish_seen_subcommand_from tree find find-all props style layout click pointer-down pointer-up hover type key scroll pump settle screenshot eval exec snapshot assert ping help" -f -a "settle" -d 'Pump until all animations settle'
complete -c tz -n "__fish_tz_using_subcommand app; and not __fish_seen_subcommand_from tree find find-all props style layout click pointer-down pointer-up hover type key scroll pump settle screenshot eval exec snapshot assert ping help" -f -a "screenshot" -d 'Capture a screenshot'
complete -c tz -n "__fish_tz_using_subcommand app; and not __fish_seen_subcommand_from tree find find-all props style layout click pointer-down pointer-up hover type key scroll pump settle screenshot eval exec snapshot assert ping help" -f -a "eval" -d 'Evaluate JavaScript in the Jolt runtime'
complete -c tz -n "__fish_tz_using_subcommand app; and not __fish_seen_subcommand_from tree find find-all props style layout click pointer-down pointer-up hover type key scroll pump settle screenshot eval exec snapshot assert ping help" -f -a "exec" -d 'Transpile + eval a TSX file'
complete -c tz -n "__fish_tz_using_subcommand app; and not __fish_seen_subcommand_from tree find find-all props style layout click pointer-down pointer-up hover type key scroll pump settle screenshot eval exec snapshot assert ping help" -f -a "snapshot" -d 'Dump full component tree state (all nodes, hierarchy, layouts)'
complete -c tz -n "__fish_tz_using_subcommand app; and not __fish_seen_subcommand_from tree find find-all props style layout click pointer-down pointer-up hover type key scroll pump settle screenshot eval exec snapshot assert ping help" -f -a "assert" -d 'Assert conditions on live app state. Exit 0 on pass, 1 on fail'
complete -c tz -n "__fish_tz_using_subcommand app; and not __fish_seen_subcommand_from tree find find-all props style layout click pointer-down pointer-up hover type key scroll pump settle screenshot eval exec snapshot assert ping help" -f -a "ping" -d 'Health check'
complete -c tz -n "__fish_tz_using_subcommand app; and not __fish_seen_subcommand_from tree find find-all props style layout click pointer-down pointer-up hover type key scroll pump settle screenshot eval exec snapshot assert ping help" -f -a "help" -d 'Print this message or the help of the given subcommand(s)'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from tree" -l elements
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from tree" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from find" -l class -r
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from find" -l pseudo -r
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from find" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from find-all" -l class -r
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from find-all" -l pseudo -r
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from find-all" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from props" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from style" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from layout" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from click" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from pointer-down" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from pointer-up" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from hover" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from type" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from key" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from scroll" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from pump" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from settle" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from screenshot" -l save -r -F
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from screenshot" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from eval" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from exec" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from snapshot" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from assert" -l class -d 'Filter by CSS class' -r
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from assert" -l pseudo -d 'Filter by pseudo-class (e.g. "hover", "focus")' -r
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from assert" -l count -d 'Assert exact match count' -r
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from assert" -l layout -d 'Assert layout predicate, e.g. "height >= 48"' -r
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from assert" -l exists -d 'Assert at least one match exists (default if no other assertion)'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from assert" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from ping" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from help" -f -a "tree" -d 'Pretty-print the component tree (default) or element tree (--elements)'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from help" -f -a "find" -d 'Find the first component by name'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from help" -f -a "find-all" -d 'Find all components by name'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from help" -f -a "props" -d 'Show props for a component node'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from help" -f -a "style" -d 'Show resolved CSS style for a component node'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from help" -f -a "layout" -d 'Show computed layout for a component node'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from help" -f -a "click" -d 'Click a component at its center'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from help" -f -a "pointer-down" -d 'Raw pointer down at absolute coordinates'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from help" -f -a "pointer-up" -d 'Raw pointer up at absolute coordinates'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from help" -f -a "hover" -d 'Hover a component'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from help" -f -a "type" -d 'Enter text into a component'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from help" -f -a "key" -d 'Press a key'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from help" -f -a "scroll" -d 'Scroll a component'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from help" -f -a "pump" -d 'Advance one frame (default 16ms)'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from help" -f -a "settle" -d 'Pump until all animations settle'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from help" -f -a "screenshot" -d 'Capture a screenshot'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from help" -f -a "eval" -d 'Evaluate JavaScript in the Jolt runtime'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from help" -f -a "exec" -d 'Transpile + eval a TSX file'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from help" -f -a "snapshot" -d 'Dump full component tree state (all nodes, hierarchy, layouts)'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from help" -f -a "assert" -d 'Assert conditions on live app state. Exit 0 on pass, 1 on fail'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from help" -f -a "ping" -d 'Health check'
complete -c tz -n "__fish_tz_using_subcommand app; and __fish_seen_subcommand_from help" -f -a "help" -d 'Print this message or the help of the given subcommand(s)'
complete -c tz -n "__fish_tz_using_subcommand icons" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand generate-icons" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand completions" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand self-update" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand mcp" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand devtools" -l connect -d 'WebSocket URL to connect to (e.g. ws://127.0.0.1:9456). Auto-discovers if omitted' -r
complete -c tz -n "__fish_tz_using_subcommand devtools" -l pid -d 'Target app by PID' -r
complete -c tz -n "__fish_tz_using_subcommand devtools" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand tsx-bundle" -s o -l out -d 'Output directory for dist files' -r -F
complete -c tz -n "__fish_tz_using_subcommand tsx-bundle" -s h -l help -d 'Print help'
complete -c tz -n "__fish_tz_using_subcommand help; and not __fish_seen_subcommand_from dev build bundle run fmt check translate new init config doctor test gallery app icons generate-icons completions self-update mcp devtools tsx-bundle help" -f -a "dev" -d 'Build + run + watch + restart (replaces dx serve)'
complete -c tz -n "__fish_tz_using_subcommand help; and not __fish_seen_subcommand_from dev build bundle run fmt check translate new init config doctor test gallery app icons generate-icons completions self-update mcp devtools tsx-bundle help" -f -a "build" -d 'Build the project (replaces dx build)'
complete -c tz -n "__fish_tz_using_subcommand help; and not __fish_seen_subcommand_from dev build bundle run fmt check translate new init config doctor test gallery app icons generate-icons completions self-update mcp devtools tsx-bundle help" -f -a "bundle" -d 'Bundle into platform-specific distributable (replaces dx bundle)'
complete -c tz -n "__fish_tz_using_subcommand help; and not __fish_seen_subcommand_from dev build bundle run fmt check translate new init config doctor test gallery app icons generate-icons completions self-update mcp devtools tsx-bundle help" -f -a "run" -d 'Run without hot-reload (replaces dx run)'
complete -c tz -n "__fish_tz_using_subcommand help; and not __fish_seen_subcommand_from dev build bundle run fmt check translate new init config doctor test gallery app icons generate-icons completions self-update mcp devtools tsx-bundle help" -f -a "fmt" -d 'Format RSX blocks (replaces dx fmt)'
complete -c tz -n "__fish_tz_using_subcommand help; and not __fish_seen_subcommand_from dev build bundle run fmt check translate new init config doctor test gallery app icons generate-icons completions self-update mcp devtools tsx-bundle help" -f -a "check" -d 'Lint RSX syntax (replaces dx check)'
complete -c tz -n "__fish_tz_using_subcommand help; and not __fish_seen_subcommand_from dev build bundle run fmt check translate new init config doctor test gallery app icons generate-icons completions self-update mcp devtools tsx-bundle help" -f -a "translate" -d 'Convert HTML to RSX (replaces dx translate)'
complete -c tz -n "__fish_tz_using_subcommand help; and not __fish_seen_subcommand_from dev build bundle run fmt check translate new init config doctor test gallery app icons generate-icons completions self-update mcp devtools tsx-bundle help" -f -a "new" -d 'Create a new Tanzo project (replaces dx new)'
complete -c tz -n "__fish_tz_using_subcommand help; and not __fish_seen_subcommand_from dev build bundle run fmt check translate new init config doctor test gallery app icons generate-icons completions self-update mcp devtools tsx-bundle help" -f -a "init" -d 'Initialize Tanzo in an existing directory (replaces dx init)'
complete -c tz -n "__fish_tz_using_subcommand help; and not __fish_seen_subcommand_from dev build bundle run fmt check translate new init config doctor test gallery app icons generate-icons completions self-update mcp devtools tsx-bundle help" -f -a "config" -d 'CLI configuration'
complete -c tz -n "__fish_tz_using_subcommand help; and not __fish_seen_subcommand_from dev build bundle run fmt check translate new init config doctor test gallery app icons generate-icons completions self-update mcp devtools tsx-bundle help" -f -a "doctor" -d 'Check toolchain setup (replaces dx doctor)'
complete -c tz -n "__fish_tz_using_subcommand help; and not __fish_seen_subcommand_from dev build bundle run fmt check translate new init config doctor test gallery app icons generate-icons completions self-update mcp devtools tsx-bundle help" -f -a "test" -d 'Run the test suite'
complete -c tz -n "__fish_tz_using_subcommand help; and not __fish_seen_subcommand_from dev build bundle run fmt check translate new init config doctor test gallery app icons generate-icons completions self-update mcp devtools tsx-bundle help" -f -a "gallery" -d 'Widget gallery management'
complete -c tz -n "__fish_tz_using_subcommand help; and not __fish_seen_subcommand_from dev build bundle run fmt check translate new init config doctor test gallery app icons generate-icons completions self-update mcp devtools tsx-bundle help" -f -a "app" -d 'Interact with a running Tanzo app'
complete -c tz -n "__fish_tz_using_subcommand help; and not __fish_seen_subcommand_from dev build bundle run fmt check translate new init config doctor test gallery app icons generate-icons completions self-update mcp devtools tsx-bundle help" -f -a "icons" -d 'Download Material Symbols fonts'
complete -c tz -n "__fish_tz_using_subcommand help; and not __fish_seen_subcommand_from dev build bundle run fmt check translate new init config doctor test gallery app icons generate-icons completions self-update mcp devtools tsx-bundle help" -f -a "generate-icons" -d 'Regenerate the Icons enum from font files'
complete -c tz -n "__fish_tz_using_subcommand help; and not __fish_seen_subcommand_from dev build bundle run fmt check translate new init config doctor test gallery app icons generate-icons completions self-update mcp devtools tsx-bundle help" -f -a "completions" -d 'Generate shell completions for tz'
complete -c tz -n "__fish_tz_using_subcommand help; and not __fish_seen_subcommand_from dev build bundle run fmt check translate new init config doctor test gallery app icons generate-icons completions self-update mcp devtools tsx-bundle help" -f -a "self-update" -d 'Update tz CLI to the latest version'
complete -c tz -n "__fish_tz_using_subcommand help; and not __fish_seen_subcommand_from dev build bundle run fmt check translate new init config doctor test gallery app icons generate-icons completions self-update mcp devtools tsx-bundle help" -f -a "mcp" -d 'Start the MCP server (STDIO transport for AI agents)'
complete -c tz -n "__fish_tz_using_subcommand help; and not __fish_seen_subcommand_from dev build bundle run fmt check translate new init config doctor test gallery app icons generate-icons completions self-update mcp devtools tsx-bundle help" -f -a "devtools" -d 'Launch a separate devtools window connected to a running app'
complete -c tz -n "__fish_tz_using_subcommand help; and not __fish_seen_subcommand_from dev build bundle run fmt check translate new init config doctor test gallery app icons generate-icons completions self-update mcp devtools tsx-bundle help" -f -a "tsx-bundle" -d 'Bundle a TSX project to dist/ (internal — used for testing)'
complete -c tz -n "__fish_tz_using_subcommand help; and not __fish_seen_subcommand_from dev build bundle run fmt check translate new init config doctor test gallery app icons generate-icons completions self-update mcp devtools tsx-bundle help" -f -a "help" -d 'Print this message or the help of the given subcommand(s)'
complete -c tz -n "__fish_tz_using_subcommand help; and __fish_seen_subcommand_from config" -f -a "set" -d 'Set a configuration value'
complete -c tz -n "__fish_tz_using_subcommand help; and __fish_seen_subcommand_from config" -f -a "show" -d 'Print current configuration'
complete -c tz -n "__fish_tz_using_subcommand help; and __fish_seen_subcommand_from app" -f -a "tree" -d 'Pretty-print the component tree (default) or element tree (--elements)'
complete -c tz -n "__fish_tz_using_subcommand help; and __fish_seen_subcommand_from app" -f -a "find" -d 'Find the first component by name'
complete -c tz -n "__fish_tz_using_subcommand help; and __fish_seen_subcommand_from app" -f -a "find-all" -d 'Find all components by name'
complete -c tz -n "__fish_tz_using_subcommand help; and __fish_seen_subcommand_from app" -f -a "props" -d 'Show props for a component node'
complete -c tz -n "__fish_tz_using_subcommand help; and __fish_seen_subcommand_from app" -f -a "style" -d 'Show resolved CSS style for a component node'
complete -c tz -n "__fish_tz_using_subcommand help; and __fish_seen_subcommand_from app" -f -a "layout" -d 'Show computed layout for a component node'
complete -c tz -n "__fish_tz_using_subcommand help; and __fish_seen_subcommand_from app" -f -a "click" -d 'Click a component at its center'
complete -c tz -n "__fish_tz_using_subcommand help; and __fish_seen_subcommand_from app" -f -a "pointer-down" -d 'Raw pointer down at absolute coordinates'
complete -c tz -n "__fish_tz_using_subcommand help; and __fish_seen_subcommand_from app" -f -a "pointer-up" -d 'Raw pointer up at absolute coordinates'
complete -c tz -n "__fish_tz_using_subcommand help; and __fish_seen_subcommand_from app" -f -a "hover" -d 'Hover a component'
complete -c tz -n "__fish_tz_using_subcommand help; and __fish_seen_subcommand_from app" -f -a "type" -d 'Enter text into a component'
complete -c tz -n "__fish_tz_using_subcommand help; and __fish_seen_subcommand_from app" -f -a "key" -d 'Press a key'
complete -c tz -n "__fish_tz_using_subcommand help; and __fish_seen_subcommand_from app" -f -a "scroll" -d 'Scroll a component'
complete -c tz -n "__fish_tz_using_subcommand help; and __fish_seen_subcommand_from app" -f -a "pump" -d 'Advance one frame (default 16ms)'
complete -c tz -n "__fish_tz_using_subcommand help; and __fish_seen_subcommand_from app" -f -a "settle" -d 'Pump until all animations settle'
complete -c tz -n "__fish_tz_using_subcommand help; and __fish_seen_subcommand_from app" -f -a "screenshot" -d 'Capture a screenshot'
complete -c tz -n "__fish_tz_using_subcommand help; and __fish_seen_subcommand_from app" -f -a "eval" -d 'Evaluate JavaScript in the Jolt runtime'
complete -c tz -n "__fish_tz_using_subcommand help; and __fish_seen_subcommand_from app" -f -a "exec" -d 'Transpile + eval a TSX file'
complete -c tz -n "__fish_tz_using_subcommand help; and __fish_seen_subcommand_from app" -f -a "snapshot" -d 'Dump full component tree state (all nodes, hierarchy, layouts)'
complete -c tz -n "__fish_tz_using_subcommand help; and __fish_seen_subcommand_from app" -f -a "assert" -d 'Assert conditions on live app state. Exit 0 on pass, 1 on fail'
complete -c tz -n "__fish_tz_using_subcommand help; and __fish_seen_subcommand_from app" -f -a "ping" -d 'Health check'
