import SwiftUI

struct MessageBubble: View {
    let message: Message
    @Environment(\.colorScheme) private var scheme

    var body: some View {
        switch message.role {
        case .user: userView
        case .assistant: assistantView
        }
    }

    private var userView: some View {
        HStack {
            Spacer(minLength: 40)
            Text(message.text)
                .font(.system(.body, design: .rounded))
                .foregroundStyle(.primary)
                .padding(.horizontal, 16)
                .padding(.vertical, 11)
                .glassEffect(
                    .regular.tint(Theme.bubbleTint(for: scheme, role: .user)),
                    in: RoundedRectangle(cornerRadius: 22, style: .continuous)
                )
        }
    }

    private var assistantView: some View {
        VStack(alignment: .leading, spacing: 12) {
            if !message.toolCalls.isEmpty {
                VStack(spacing: 8) {
                    ForEach(message.toolCalls) { call in
                        ToolCallCard(call: call)
                    }
                }
            }

            if !message.text.isEmpty {
                HStack(alignment: .top, spacing: 10) {
                    Image(systemName: "sparkle")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundStyle(Theme.gold)
                        .padding(.top, 4)

                    Text(textWithCursor)
                        .font(.system(.body, design: .rounded))
                        .foregroundStyle(.primary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .fixedSize(horizontal: false, vertical: true)
                        .textSelection(.enabled)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 14)
                .glassEffect(
                    .regular.tint(Theme.bubbleTint(for: scheme, role: .assistant)),
                    in: RoundedRectangle(cornerRadius: 20, style: .continuous)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 20, style: .continuous)
                        .strokeBorder(Theme.gold.opacity(0.20), lineWidth: 0.5)
                )
            }

            if let error = message.error {
                HStack(alignment: .top, spacing: 8) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(.system(size: 12))
                        .foregroundStyle(.red)
                    Text(error)
                        .font(.system(.footnote, design: .rounded))
                        .foregroundStyle(.red)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .fill(Color.red.opacity(0.08))
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .strokeBorder(Color.red.opacity(0.30), lineWidth: 0.5)
                )
            }
        }
        .padding(.trailing, 36)
    }

    private var textWithCursor: AttributedString {
        var attributed = AttributedString(message.text)
        if message.isStreaming {
            var cursor = AttributedString(" ▍")
            cursor.foregroundColor = Theme.gold.opacity(0.75)
            attributed.append(cursor)
        }
        return attributed
    }
}
