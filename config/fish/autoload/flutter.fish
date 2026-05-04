function flutter-dtd-run
    set -l dtd_file /tmp/dtd.json
    set -l project_path (pwd)

    # Initialize JSON file if it doesn't exist
    if not test -f $dtd_file
        echo '{}' > $dtd_file
    end

    # Run flutter with DTD flag, capture output while preserving it
    flutter run --print-dtd $argv 2>&1 | while read -l line
        echo $line

        # Look for DTD URI pattern
        if string match -rq '(ws://[^\s\'"]+)' -- $line
            set -l dtd_uri (string match -r 'ws://[^\s\'"]+' -- $line)
            # Update JSON file
            jq --arg path "$project_path" --arg uri "$dtd_uri" '.[$path] = $uri' $dtd_file > $dtd_file.tmp
            and mv $dtd_file.tmp $dtd_file
        end
    end

    # Cleanup on exit
    if test -f $dtd_file
        jq --arg path "$project_path" 'del(.[$path])' $dtd_file > $dtd_file.tmp
        and mv $dtd_file.tmp $dtd_file
    end
end
