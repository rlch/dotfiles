function subflow --description "Headless subtitle fetch/merge/push + shift"
    if test (count $argv) -lt 1
        echo "Usage:"
        echo "  subflow fetch <movie|tv> <query> [--show <name>] [--season-episode S01E01] [--prefer-tag ...] [--avoid-tag ...] [--dry-run]"
        echo "  subflow shift <file.srt> --seconds <+/-float> [--in-place|--output <path>]"
        return 1
    end

    set mode $argv[1]
    set -e argv[1]

    switch $mode
        case fetch
            if test (count $argv) -lt 2
                echo "Usage: subflow fetch <movie|tv> <query> ..."
                return 1
            end
            set kind $argv[1]
            set -e argv[1]
            switch $kind
                case movie
                    python3 ~/.config/subtitleflow/subflow.py fetch --type movie "$argv"
                case tv
                    python3 ~/.config/subtitleflow/subflow.py fetch --type tv "$argv"
                case '*'
                    echo "For fetch, first arg must be movie or tv"
                    return 1
            end

        case shift
            python3 ~/.config/subtitleflow/subflow.py shift "$argv"

        case movie tv
            # Back-compat shortcut: subflow tv "Query" ...
            set kind $mode
            switch $kind
                case movie
                    python3 ~/.config/subtitleflow/subflow.py fetch --type movie "$argv"
                case tv
                    python3 ~/.config/subtitleflow/subflow.py fetch --type tv "$argv"
            end

        case '*'
            echo "Unknown mode: $mode"
            echo "Use: fetch or shift"
            return 1
    end
end
