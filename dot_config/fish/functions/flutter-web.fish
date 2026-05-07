function flutter-web --description 'flutter run -d web-server, opening the URL in your chrome-debug Chrome'
    set -l port (test -n "$FLUTTER_WEB_PORT"; and echo $FLUTTER_WEB_PORT; or echo 5000)

    chrome-debug

    fish -c "sleep 4 && open 'http://localhost:$port'" &
    disown

    flutter run -d web-server --web-port=$port $argv
end
