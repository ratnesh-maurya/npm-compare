# Package Comparer Research and Architecture Plan

## 1. NPM Comparer (Current state & Roadmap)
- **API endpoints used**: `registry.npmjs.org/<pkg>` (Metadata), `api.npmjs.org/downloads/range/<period>/<pkg>` (Downloads).
- **Improvements**: Upgrading `chart.js` and other dependencies. Implementing retro-style UI.

## 2. Go (Golang) Comparer
- **Ecosystem**: Go packages use paths.
- **Key APIs**: 
  1. `proxy.golang.org/<module>/@v/list` for versions.
  2. GitHub API for stars/forks/activity (because `pkg.go.dev` doesn't have a public open REST API for those stats).
- **Implementation Strategy**: Create a tab for Go, take module path, fetch GitHub metadata, and display versions.

## 3. Elixir (Hex) Comparer
- **Ecosystem**: Hex.pm
- **Key APIs**: `https://hex.pm/api/packages/<pkg>`
- **Implementation**: Great REST API that provides download stats and metadata immediately.

## 4. UI/UX Strategy
- **Retro-Style Light Theme**: Inspired by preferences. Heavy borders, monochromatic/sepia/cream tone scale `#F4F0EB`, brutalist button design `box-shadow: 4px 4px 0px #000`.
