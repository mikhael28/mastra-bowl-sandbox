import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var appState: AppState
    @State private var selection: TabKey = .chat

    enum TabKey: Hashable {
        case chat, tools, workspace, settings
    }

    var body: some View {
        TabView(selection: $selection) {
            Tab("Chat", systemImage: "bubble.left.and.bubble.right.fill", value: TabKey.chat) {
                ChatView()
            }

            Tab("Tools", systemImage: "wrench.and.screwdriver.fill", value: TabKey.tools) {
                ToolsView()
            }

            Tab("Workspace", systemImage: "folder.fill", value: TabKey.workspace) {
                WorkspaceView()
            }

            Tab("Settings", systemImage: "gearshape.fill", value: TabKey.settings) {
                SettingsView()
            }
        }
        .tabBarMinimizeBehavior(.onScrollDown)
    }
}
