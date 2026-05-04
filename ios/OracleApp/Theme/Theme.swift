import SwiftUI

enum Theme {
    static let gold = Color(red: 0.86, green: 0.71, blue: 0.36)
    static let goldSoft = Color(red: 0.95, green: 0.85, blue: 0.55)
    static let indigo = Color(red: 0.18, green: 0.16, blue: 0.42)
    static let plum = Color(red: 0.32, green: 0.18, blue: 0.46)
    static let midnight = Color(red: 0.06, green: 0.05, blue: 0.16)
    static let parchment = Color(red: 0.97, green: 0.94, blue: 0.88)
    static let parchmentDeep = Color(red: 0.92, green: 0.87, blue: 0.78)

    static func backdrop(for scheme: ColorScheme) -> LinearGradient {
        switch scheme {
        case .dark:
            LinearGradient(
                colors: [
                    Color(red: 0.04, green: 0.03, blue: 0.12),
                    Color(red: 0.10, green: 0.05, blue: 0.22),
                    Color(red: 0.18, green: 0.08, blue: 0.30)
                ],
                startPoint: .top,
                endPoint: .bottom
            )
        default:
            LinearGradient(
                colors: [
                    parchment,
                    parchmentDeep,
                    Color(red: 0.86, green: 0.78, blue: 0.74)
                ],
                startPoint: .top,
                endPoint: .bottom
            )
        }
    }

    static func bubbleTint(for scheme: ColorScheme, role: BubbleRole) -> Color {
        switch (scheme, role) {
        case (.dark, .user): Color.white.opacity(0.10)
        case (.dark, .assistant): plum.opacity(0.30)
        case (_, .user): indigo.opacity(0.10)
        case (_, .assistant): gold.opacity(0.16)
        }
    }

    enum BubbleRole { case user, assistant }
}
