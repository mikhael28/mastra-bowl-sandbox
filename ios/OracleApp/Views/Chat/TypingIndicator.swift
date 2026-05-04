import SwiftUI

struct TypingIndicator: View {
    @State private var phase: Double = 0

    var body: some View {
        HStack(spacing: 6) {
            ForEach(0..<3) { i in
                Circle()
                    .fill(Theme.gold.opacity(0.85))
                    .frame(width: 6, height: 6)
                    .scaleEffect(0.6 + 0.4 * pulse(for: i))
                    .opacity(0.4 + 0.6 * pulse(for: i))
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .glassEffect(.regular, in: .capsule)
        .onAppear {
            withAnimation(.linear(duration: 1.2).repeatForever(autoreverses: false)) {
                phase = 1
            }
        }
    }

    private func pulse(for i: Int) -> Double {
        let offset = Double(i) / 3.0
        let t = (phase + offset).truncatingRemainder(dividingBy: 1)
        return sin(t * .pi)
    }
}
