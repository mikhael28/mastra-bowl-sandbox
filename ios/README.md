# MastraClaw — iOS

A simple, on-rails portfolio client for the MastraClaw agent. Point it at a
Mastra server, chat with the assistant, browse its tools, and inspect the
files it has access to. Built for iOS 26 with **Liquid Glass** throughout.

## Stack

- SwiftUI, iOS 26.0+
- Liquid Glass (`.glassEffect`, `GlassEffectContainer`)
- Live `URLSession.bytes` streaming against the Mastra HTTP API

## Project layout

```
ios/
├── project.yml                      # XcodeGen project definition
├── OracleApp/                       # (legacy folder name; product is "MastraClaw")
│   ├── App/                         # @main entry, AppState (endpoint, memory, connection)
│   ├── Theme/                       # colors, gradients
│   ├── Models/                      # Message, ToolCall, Agent, WorkspaceEntry
│   ├── ViewModels/                  # ChatViewModel (live streaming), WorkspaceViewModel
│   ├── Data/                        # MastraClient + MastraChunk parser
│   ├── Views/
│   │   ├── ContentView.swift        # 4-tab shell
│   │   ├── Chat/                    # chat surface + cards
│   │   ├── Tools/                   # capability showcase
│   │   ├── Workspace/               # file browser + viewer
│   │   └── Settings/                # endpoint URL + memory + appearance
│   └── Resources/                   # Info.plist
```

## Generating the Xcode project

```bash
brew install xcodegen
cd ios
xcodegen generate
open OracleApp.xcodeproj
```

## Running

1. Start the Mastra dev server on your Mac: `npm run dev` from the project root.
   It listens on `http://localhost:4111` by default.
2. Open the iOS project in Xcode 26+, choose an iOS 26 simulator (iPhone 17 Pro
   recommended for the glass), and Run.
3. On first launch, open **Settings**, confirm the endpoint URL, and tap **Save**.
   When the dot turns green, head to **Chat** and start talking.
4. To talk to a deployed Mastra server, paste its URL into Settings instead.

> ATS is configured to allow arbitrary loads so you can hit `http://` URLs on
> your local network. For App Store submission you'd want to lock that down.

## Tabs

- **Chat** — streaming conversation with the configured agent. Tool calls
  render as expandable Liquid Glass cards (input + output preview).
  Approval-gated tools auto-approve so the conversation never stalls.
- **Tools** — read-only browse of every tool the agent has registered, plus
  its sub-agents and workflows. A live snapshot of what MastraClaw can do.
- **Workspace** — file tree rooted at `./workspace` on the server. Tap a
  folder to descend, tap a file to open it as plain text in a glass sheet.
- **Settings** — endpoint URL, connection status, appearance (System / Light
  / Dark), clear-conversation (new thread, keep profile), forget-me (wipe
  working memory).

## What's persisted

- `endpoint-url` — the Mastra base URL you saved.
- `appearance` — System / Light / Dark.
- `thread-id` — stable conversation thread (so observational memory carries
  across launches). Replaced when you "Clear conversation".
- `resource-id` — stable working-memory profile. Replaced only when you
  "Forget me".
