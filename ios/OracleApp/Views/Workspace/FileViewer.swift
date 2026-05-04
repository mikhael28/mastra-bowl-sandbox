import SwiftUI

struct FileViewer: View {
    let file: WorkspaceViewModel.OpenFile

    @Environment(\.dismiss) private var dismiss
    @Environment(\.colorScheme) private var scheme

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.backdrop(for: scheme).ignoresSafeArea()

                ScrollView {
                    Text(file.content.isEmpty ? "(empty file)" : file.content)
                        .font(.system(.footnote, design: .monospaced))
                        .foregroundStyle(.primary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .textSelection(.enabled)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 14)
                }
            }
            .navigationTitle(file.name)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                        .font(.system(.body, design: .rounded).weight(.medium))
                }
                ToolbarItem(placement: .topBarLeading) {
                    HStack(spacing: 4) {
                        Image(systemName: "folder")
                            .font(.system(size: 11))
                        Text(file.path)
                            .font(.system(.caption2, design: .monospaced))
                    }
                    .foregroundStyle(.tertiary)
                }
            }
        }
    }
}
