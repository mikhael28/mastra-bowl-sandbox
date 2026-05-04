import SwiftUI

@main
struct OracleApp: App {
    @StateObject private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
                .preferredColorScheme(appState.appearance.colorScheme)
                .tint(Theme.gold)
                .task {
                    await appState.refresh()
                }
        }
    }
}
