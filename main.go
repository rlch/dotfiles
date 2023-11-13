package main

import (
	"errors"
	"fmt"
	"io/fs"
	"os"
	"os/exec"
	"path"
	"path/filepath"
	"regexp"
	"strings"
	"text/template"

	"gopkg.in/yaml.v3"
)

type Config struct {
	BaseDir string `yaml:"baseDir"`
	Dirs    struct {
		Backend        string `yaml:"backend"`
		Frontend       string `yaml:"frontend"`
		Infrastructure string `yaml:"infrastructure"`
		Playground     string `yaml:"playground"`
	}
}

func main() {
	if err := run(); err != nil {
		fmt.Println("ERROR:", err)
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
	if err := execTemplate(c); err != nil {
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
		return nil, errors.New("base directory needs to be configured, please set baseDir in config.yaml")
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
		return path.Clean(path.Join(baseDir, d))
	}
	os.Setenv("DIRS_BACKEND", sub(c.Dirs.Backend))
	os.Setenv("DIRS_FRONTEND", sub(c.Dirs.Frontend))
	os.Setenv("DIRS_INFRASTRUCTURE", sub(c.Dirs.Infrastructure))
	os.Setenv("DIRS_PLAYGROUND", sub(c.Dirs.Playground))
	fmt.Println(os.Getenv("DIRS_CONFIG"))
	return nil
}

func execTemplate(c *Config) error {
	type Vars struct {
		Config
	}
	vars := Vars{Config: *c}
	cwd, err := os.Getwd()
	if err != nil {
		return fmt.Errorf("cannot get current directory: %w", err)
	}
	filepath.WalkDir(path.Join(cwd, "config"), func(p string, d fs.DirEntry, _ error) error {
		re := regexp.MustCompile(`(.*)\.(\w+)\.tmpl$`)
		matches := re.FindStringSubmatch(d.Name())
		if d.IsDir() || !strings.HasSuffix(d.Name(), ".tmpl") {
			return nil
		}
		content, err := os.ReadFile(p)
		if err != nil {
			return fmt.Errorf("cannot read file: %w", err)
		}
		tmpl, err := template.New("dotfiles").Parse(string(content))
		if err != nil {
			return fmt.Errorf("cannot parse template: %w", err)
		}
		dir := path.Dir(p)
		newFilename := matches[1] + "." + matches[2]
		file, err := os.Create(path.Join(dir, newFilename))
		if err != nil {
			return fmt.Errorf("cannot open file: %w", err)
		}
		defer file.Close()
		if err := tmpl.Execute(file, vars); err != nil {
			return fmt.Errorf("cannot execute template: %w", err)
		}
		return os.Remove(p)
	})
	return errors.New("laksjdfh")
}

func runDotbot() error {
	for _, bin := range []string{
		"install",
		"install_fonts",
		"install_fisher",
	} {
		if err := os.Chmod(bin, os.ModePerm); err != nil {
			return fmt.Errorf("cannot chmod %s: %w", bin, err)
		}
	}
	cmd := exec.Command("./install")
	cmd.Stdout = os.Stdout
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("cannot run install: %w", err)
	}
	return nil
}
