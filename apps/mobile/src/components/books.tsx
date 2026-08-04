import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { type Book } from "../types";
import { TruncatedText } from "./common";

const coverColors = ["#b85e48", "#56778c", "#735b80", "#d48b69", "#415c8a"];

export function BookCover({
  book,
  small = false,
  compact = false,
}: {
  book: Book;
  small?: boolean;
  compact?: boolean;
}) {
  const index = Math.max(0, Number(book.id.slice(1)) - 1);
  return (
    <View
      style={[
        styles.cover,
        small && styles.coverSmall,
        compact && styles.coverCompact,
        { backgroundColor: coverColors[index % coverColors.length] },
      ]}
    >
      <Text style={[styles.coverText, compact && styles.coverTextCompact]}>{book.cover}</Text>
    </View>
  );
}

type BookRowProps = {
  book: Book;
  onPress?: () => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
};

export function BookRow({
  book,
  onPress,
  selectable = false,
  selected = false,
  onSelect,
}: BookRowProps) {
  return (
    <Pressable onPress={selectable ? onSelect : onPress} style={styles.row}>
      <BookCover book={book} small />
      <View style={styles.info}>
        <TruncatedText style={styles.title}>{book.title}</TruncatedText>
        <Text style={styles.meta}>{book.unread ? `${book.unread}章未读` : "已读完"}</Text>
        <Text numberOfLines={1} style={styles.meta}>
          {book.status} · {book.chapter}
        </Text>
      </View>
      {selectable ? (
        <View style={[styles.checkbox, selected && styles.checked]}>
          <Text style={styles.checkmark}>{selected ? "✓" : ""}</Text>
        </View>
      ) : (
        <Text style={styles.more}>⋮</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cover: {
    width: "100%",
    aspectRatio: 0.72,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  coverSmall: { width: 74, height: 100 },
  coverCompact: { width: 42, height: 58, borderRadius: 5, shadowRadius: 3 },
  coverText: {
    color: "white",
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,.25)",
    textShadowRadius: 3,
  },
  coverTextCompact: { fontSize: 10, lineHeight: 13 },
  row: {
    minHeight: 120,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  info: { flex: 1, minWidth: 0 },
  title: { fontSize: 16, fontWeight: "700", lineHeight: 22 },
  meta: { color: "#999", fontSize: 13, marginTop: 6 },
  more: { fontSize: 24, color: "#aaa" },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  checked: { backgroundColor: "#ff6b35", borderColor: "#ff6b35" },
  checkmark: { color: "white" },
});
