package main

import (
	"bytes"
	"io"
	"os"
	"os/exec"
	"regexp"
	"syscall"
)

// ANSI escape sequences for terminal titles
// OSC 0 - Set window title and icon name: ESC ] 0 ; text BEL or ESC ] 0 ; text ESC \
// OSC 2 - Set window title: ESC ] 2 ; text BEL or ESC ] 2 ; text ESC \
var titleRegex = regexp.MustCompile(`\033\](?:0|2);([^\007\033]+)(?:\007|\033\\)`)

func main() {
	// Check if we're in a Zellij session
	inZellij := os.Getenv("ZELLIJ") != ""

	// Find claude executable
	claudePath, err := exec.LookPath("claude")
	if err != nil {
		os.Stderr.WriteString("Error finding claude: " + err.Error() + "\n")
		os.Exit(1)
	}

	if !inZellij {
		// If not in Zellij, just exec claude directly
		args := append([]string{"claude"}, os.Args[1:]...)
		syscall.Exec(claudePath, args, os.Environ())

		// If we get here, exec failed
		os.Stderr.WriteString("Error executing claude\n")
		os.Exit(1)
	}

	// In Zellij - run claude with script and monitor output
	args := []string{"-q", "/dev/null", claudePath}
	args = append(args, os.Args[1:]...)

	cmd := exec.Command("script", args...)
	cmd.Stdin = os.Stdin
	cmd.Stderr = os.Stderr

	// Create a pipe for stdout so we can monitor it
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		os.Stderr.WriteString("Error creating stdout pipe: " + err.Error() + "\n")
		os.Exit(1)
	}

	// Start the command
	if err := cmd.Start(); err != nil {
		os.Stderr.WriteString("Error starting script: " + err.Error() + "\n")
		os.Exit(1)
	}

	// Copy output while monitoring for title sequences
	go copyAndMonitor(stdout, os.Stdout)

	// Wait for command to finish
	err = cmd.Wait()
	if err != nil {
		if exitError, ok := err.(*exec.ExitError); ok {
			os.Exit(exitError.ExitCode())
		}
		os.Exit(1)
	}
}

func copyAndMonitor(src io.Reader, dst io.Writer) {
	buf := make([]byte, 32*1024)
	accumulator := &bytes.Buffer{}

	for {
		n, err := src.Read(buf)
		if n > 0 {
			// Write to destination immediately
			dst.Write(buf[:n])

			// Also accumulate for title detection
			accumulator.Write(buf[:n])

			// Check for title sequences
			checkForTitle(accumulator.Bytes())

			// Prevent unbounded growth
			if accumulator.Len() > 64*1024 {
				accumulator.Reset()
			}
		}

		if err != nil {
			break
		}
	}
}

func checkForTitle(data []byte) {
	matches := titleRegex.FindAllSubmatch(data, -1)
	for _, match := range matches {
		if len(match) > 1 {
			title := string(match[1])
			// Run zellij rename command in background
			go func(t string) {
				cmd := exec.Command("zellij", "action", "rename-pane", t)
				cmd.Run()
			}(title)
		}
	}
}
