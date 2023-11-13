package main

import (
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path"
	"path/filepath"

	"gopkg.in/yaml.v3"
)

type Config struct {
	BaseDir string `yaml:"baseDir"`
	Dirs    struct {
		Config         string `yaml:"config"`
		Backend        string `yaml:"backend"`
		Frontend       string `yaml:"frontend"`
		Infrastructure string `yaml:"infrastructure"`
		Playground     string `yaml:"playground"`
	}
}

func main() {
	if err := run(); err != nil {
		panic(err)
	}
}

func run() error {
	bytes, err := os.ReadFile("config.yaml")
	if err != nil {
		return fmt.Errorf("cannot read config file: %w", err)
	}
	c, err := parseConfig(bytes)
	if err != nil {
		return err
	}
	if err := setupEnvs(c); err != nil {
		return err
	}
	if err := runDotbot(); err != nil {
		return err
	}
	return nil
}

func parseConfig(bytes []byte) (*Config, error) {
	c := new(Config)
	if err := yaml.Unmarshal(bytes, c); err != nil {
		return nil, fmt.Errorf("cannot parse config: %w", err)
	}
	if c.BaseDir == "" {
		return nil, errors.New("base directory needs to be configured, please set baseDir in config")
	}
	return c, nil
}

func setupEnvs(c *Config) error {
	baseDir, err := filepath.Abs(c.BaseDir)
	if err != nil {
		return err
	}
	os.Setenv("BASE_DIR", baseDir)

	sub := func(d string) string {
		return path.Join(baseDir, d)
	}
	os.Setenv("DIRS_CONFIG", sub(c.Dirs.Config))
	os.Setenv("DIRS_BACKEND", sub(c.Dirs.Backend))
	os.Setenv("DIRS_FRONTEND", sub(c.Dirs.Frontend))
	os.Setenv("DIRS_INFRASTRUCTURE", sub(c.Dirs.Infrastructure))
	os.Setenv("DIRS_PLAYGROUND", sub(c.Dirs.Playground))
	fmt.Println(os.Getenv("DIRS_CONFIG"))
	return nil
}

func runDotbot() error {
	if err := os.Chmod("install", os.ModePerm); err != nil {
		return fmt.Errorf("cannot chmod install: %w", err)
	}
	cmd := exec.Command("./install")
	cmd.Stdout = os.Stdout
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("cannot run install: %w", err)
	}
	return nil
}
