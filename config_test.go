package main

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestConfig(t *testing.T) {
	config := `
baseDir: integration/
dirs:
	backend: Coding/Tutero/Backend/
	frontend: Coding/Tutero/Frontend/
	infrastructure: Coding/Tutero/Infrastructure/
	playground: Coding/Playground/
		`
	config = strings.ReplaceAll(config, "\t", "  ")
	t.Run("parses config correctly", func(t *testing.T) {
		c, err := parseConfig([]byte(config))
		assert.NoError(t, err)
		assert.Equal(t, "integration/", c.BaseDir)
		assert.Equal(t, "Coding/Tutero/Backend/", c.Dirs.Backend)
		assert.Equal(t, "Coding/Tutero/Frontend/", c.Dirs.Frontend)
		assert.Equal(t, "Coding/Tutero/Infrastructure/", c.Dirs.Infrastructure)
		assert.Equal(t, "Coding/Playground/", c.Dirs.Playground)
	})
}
