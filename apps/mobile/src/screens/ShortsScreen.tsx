import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../components/common";

const cards = [
  { title: "逆袭千金", color: "#d77a64" },
  { title: "仙门小师妹", color: "#6f88a8" },
  { title: "末日同行", color: "#74658c" },
  { title: "古宅谜案", color: "#b68b5f" },
];

export function ShortsScreen({ openService }: { openService: (title: string) => void }) {
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>短剧</Text>
        <Pressable onPress={() => openService("短剧分类")}>
          <Text style={styles.muted}>热播　分类　⌕</Text>
        </Pressable>
      </View>
      <Pressable onPress={() => openService("今日热播")} style={styles.hero}>
        <Text style={styles.heroTitle}>今日热播</Text>
        <Text style={styles.heroSubtitle}>高能剧情 · 连续观看</Text>
        <Text style={styles.play}>▶ 立即播放</Text>
      </Pressable>
      <Text style={styles.sectionTitle}>猜你喜欢</Text>
      <View style={styles.grid}>
        {cards.map((card, index) => (
          <Pressable onPress={() => openService(card.title)} key={card.title} style={styles.card}>
            <View style={[styles.poster, { backgroundColor: card.color }]}>
              <Text style={styles.posterTitle}>{card.title}</Text>
              <Text style={styles.badge}>{index + 12} 集</Text>
            </View>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.meta}>热度 {98 - index * 7} 万</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "white" },
  content: { padding: 18, paddingBottom: 30 },
  header: { flexDirection: "row", justifyContent: "space-between" },
  title: { fontSize: 23, fontWeight: "900" },
  muted: { color: "#999", lineHeight: 22 },
  hero: {
    height: 210,
    borderRadius: 22,
    backgroundColor: "#342f43",
    padding: 24,
    justifyContent: "flex-end",
    marginVertical: 18,
  },
  heroTitle: { fontSize: 28, fontWeight: "900", color: "white" },
  heroSubtitle: { color: "#ddd", marginTop: 8 },
  play: {
    alignSelf: "flex-start",
    marginTop: 14,
    color: "white",
    backgroundColor: colors.orange,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    overflow: "hidden",
  },
  sectionTitle: { fontSize: 18, fontWeight: "800", marginBottom: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -6 },
  card: { width: "50%", padding: 6 },
  poster: {
    aspectRatio: 0.72,
    borderRadius: 16,
    padding: 14,
    justifyContent: "flex-end",
  },
  posterTitle: { color: "white", fontSize: 21, fontWeight: "900" },
  badge: {
    alignSelf: "flex-start",
    color: "white",
    backgroundColor: "rgba(0,0,0,.35)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 8,
    overflow: "hidden",
  },
  cardTitle: { fontSize: 15, fontWeight: "800", marginTop: 8 },
  meta: { color: "#999", fontSize: 13, marginTop: 6 },
});
