export const hasWebSocketChannel = (
  obj: unknown
): obj is { channel: string; type: string } => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "channel" in obj &&
    typeof (obj as Record<string, unknown>).channel === "string"
  );
};
