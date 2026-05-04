import SwiftUI

/// Slow-drifting starfield rendered with Canvas. Cheap, organic, never the same
/// twice. In light mode it becomes a soft floating-dust effect instead of stars.
struct StarfieldBackground: View {
    @Environment(\.colorScheme) private var scheme

    private let stars: [Star] = (0..<70).map { _ in Star.random() }

    var body: some View {
        TimelineView(.animation(minimumInterval: 1.0 / 30.0)) { timeline in
            let t = timeline.date.timeIntervalSinceReferenceDate
            Canvas { context, size in
                for star in stars {
                    let x = (star.x + (t * star.drift) * 0.04).truncatingRemainder(dividingBy: 1.0) * size.width
                    let y = (star.y + (t * star.drift) * 0.02).truncatingRemainder(dividingBy: 1.0) * size.height
                    let twinkle = 0.55 + 0.45 * sin(t * star.twinkleSpeed + star.phase)
                    let radius = star.radius * (scheme == .dark ? 1.0 : 0.85)
                    let baseOpacity = scheme == .dark ? 0.85 : 0.18
                    let color = scheme == .dark
                        ? Color.white.opacity(baseOpacity * twinkle)
                        : Theme.indigo.opacity(baseOpacity * twinkle)
                    let rect = CGRect(x: x - radius, y: y - radius, width: radius * 2, height: radius * 2)
                    context.fill(Path(ellipseIn: rect), with: .color(color))
                }
            }
        }
        .allowsHitTesting(false)
    }

    private struct Star {
        var x: Double
        var y: Double
        var radius: Double
        var twinkleSpeed: Double
        var phase: Double
        var drift: Double

        static func random() -> Star {
            Star(
                x: .random(in: 0...1),
                y: .random(in: 0...1),
                radius: .random(in: 0.4...1.6),
                twinkleSpeed: .random(in: 0.6...2.4),
                phase: .random(in: 0...(2 * .pi)),
                drift: .random(in: 0.3...1.0)
            )
        }
    }
}
