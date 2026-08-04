import React, { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { type Book } from "../types";
import { colors, Pill } from "../components/common";

type Panel = "none" | "brief" | "catalog" | "detail" | "settings";

type Props = {
  book: Book;
  onBack: () => void;
  onRead: () => void;
  onAddShelf: () => void;
};

const palette = ["#eee7dd", "#e7dfc7", "#dbe4c9", "#d5dde3", "#17130f", "#39322d", "#57514c"];

export function BookDetailScreen({ book, onBack, onRead, onAddShelf }: Props) {
  const [panel, setPanel] = useState<Panel>("none");
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState(palette[0]);

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <Pressable onPress={onBack} hitSlop={12}>
            <Text style={styles.back}>‹</Text>
          </Pressable>
          <Pressable onPress={onAddShelf}>
            <Text style={styles.topAction}>加入书架</Text>
          </Pressable>
          <Text style={styles.topAction}>下载</Text>
          <Text style={styles.topIcons}>◌　↗　⋮</Text>
        </View>

        <View style={[styles.cover, { backgroundColor: "#a94f42" }]}>
          <Text style={styles.coverText}>{book.cover}</Text>
        </View>
        <Text style={styles.title}>{book.title}（轻手染星河）</Text>
        <Text style={styles.author}>
          ●　{book.author}　 <Text style={styles.follow}>＋关注</Text>
        </Text>

        <View style={styles.metrics}>
          <Pressable onPress={() => setPanel("detail")} style={styles.metric}>
            <Text style={styles.metricValue}>
              {book.score}
              <Text style={styles.unit}>分</Text>
            </Text>
            <Text style={styles.metricHint}>73人五星追评 ›</Text>
          </Pressable>
          <View style={styles.divider} />
          <View style={styles.metric}>
            <Text style={styles.metricValue}>
              7.2<Text style={styles.unit}>万人</Text>
            </Text>
            <Text style={styles.metricHint}>正在阅读</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.metric}>
            <Text style={styles.metricValue}>
              175.3<Text style={styles.unit}>万字</Text>
            </Text>
            <Text style={styles.metricHint}>{book.status.replace("已", "")}</Text>
          </View>
        </View>

        <Pressable onPress={() => setPanel("brief")} style={styles.briefBlock}>
          <View style={styles.tagLine}>
            <Text style={styles.sectionTitle}>简介</Text>
            {book.tags.map(tag => (
              <Pill key={tag} label={tag} />
            ))}
          </View>
          <Text numberOfLines={2} style={styles.description}>
            {book.description} 原主干啥啥不行，背锅第一名。女主泄露宗门秘法，都是她背锅。...
          </Text>
          <Text style={styles.moreText}>更多</Text>
        </Pressable>

        <View style={styles.reviewHeader}>
          <Text style={styles.sectionTitle}>热门书评</Text>
          <Pressable onPress={() => setPanel("detail")}>
            <Text style={styles.moreText}>更多书评</Text>
          </Pressable>
        </View>
        {[
          "真的贼啦好看，女主很牛掰，看的挺爽的，五道精通，天赋异禀。",
          "好看😊女主好可爱呀，情节很有趣，笑得一抽一抽的。",
          "很好看，我好喜欢女主，人物群像也很精彩。",
        ].map((text, index) => (
          <View key={text} style={styles.review}>
            <View
              style={[styles.avatar, { backgroundColor: ["#51433d", "#b45e47", "#687e99"][index] }]}
            />
            <View style={styles.reviewBody}>
              <Text style={styles.reviewText}>{text}</Text>
              <Text style={styles.stars}>★★★★★　阅读{index * 3 + 3}小时后点评</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <Pressable onPress={onRead} style={styles.listen}>
        <Text style={styles.listenText}>读</Text>
      </Pressable>
      <View style={styles.bottomBar}>
        <Pressable onPress={() => setPanel("catalog")}>
          <Text style={styles.bottomItem}>▣{`\n`}目录</Text>
        </Pressable>
        <Pressable onPress={() => setPanel("settings")}>
          <Text style={styles.bottomItem}>◒{`\n`}夜间</Text>
        </Pressable>
        <Pressable onPress={() => setPanel("settings")}>
          <Text style={styles.bottomItem}>◇{`\n`}设置</Text>
        </Pressable>
        <Pressable onPress={onRead}>
          <Text style={styles.bottomItem}>▱{`\n`}改编剧场</Text>
        </Pressable>
      </View>

      <DetailPanel
        panel={panel}
        close={() => setPanel("none")}
        book={book}
        fontSize={fontSize}
        setFontSize={setFontSize}
        theme={theme}
        setTheme={setTheme}
      />
    </View>
  );
}

function DetailPanel({
  panel,
  close,
  book,
  fontSize,
  setFontSize,
  theme,
  setTheme,
}: {
  panel: Panel;
  close: () => void;
  book: Book;
  fontSize: number;
  setFontSize: (n: number) => void;
  theme: string;
  setTheme: (c: string) => void;
}) {
  if (panel === "none") return null;
  return (
    <Modal transparent animationType="slide">
      <Pressable style={styles.scrim} onPress={close} />
      <View style={styles.panel}>
        {panel === "brief" && (
          <ScrollView>
            <Text style={styles.panelTitle}>书籍简介</Text>
            <Text style={styles.longText}>
              {book.description}
              {"\n\n"}
              原主干啥啥不行，背锅第一名。什么女主害死同门，女主泄露宗门秘法，女主和魔族圣主勾勾搭搭，都是她背锅。
              {"\n\n"}
              不慌，这题她会。撸起袖子开卷，一边拯救师门，一边开启震慑九州大佬之路。
            </Text>
          </ScrollView>
        )}
        {panel === "catalog" && (
          <ScrollView>
            <View style={styles.panelTabs}>
              <Text>详情</Text>
              <Text style={styles.selectedTab}>目录</Text>
              <Text>笔记</Text>
            </View>
            <Text style={styles.catalogMeta}>共786章 已完结　　　　　　　　　精简⌄　倒序</Text>
            <Text style={styles.bookPage}>⌾ 书封页</Text>
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <View key={i} style={styles.chapter}>
                <Text>
                  第 {i} 章　
                  {i === 1 ? "这锅我不背了" : i === 2 ? "她生来就该卷生卷死" : "清渺宗的新旅途"}
                </Text>
                <Text style={styles.chapterMeta}>
                  {2100 + i * 143}字 · 2023年5月{i}日
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
        {panel === "detail" && (
          <ScrollView>
            <View style={styles.panelTabs}>
              <Text style={styles.selectedTab}>详情</Text>
              <Text>目录</Text>
              <Text>笔记</Text>
            </View>
            <View style={styles.metrics}>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{book.score}分</Text>
                <Text style={styles.metricHint}>73人五星追评</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>7.2万人</Text>
                <Text style={styles.metricHint}>正在阅读</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>175.3万字</Text>
                <Text style={styles.metricHint}>完结</Text>
              </View>
            </View>
            <Text style={styles.sectionTitle}>简介</Text>
            <Text style={styles.longText}>{book.description}</Text>
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>书评 · 5097</Text>
            <Text style={styles.longText}>
              ★★★★★　好好看！！！女主三观正，群像人物鲜活，节奏轻快。
            </Text>
          </ScrollView>
        )}
        {panel === "settings" && (
          <ScrollView>
            <View style={styles.settingLine}>
              <Text>亮度</Text>
              <View style={styles.slider} />
              <Text>护眼模式 ◉</Text>
            </View>
            <View style={styles.settingLine}>
              <Text>字体</Text>
              <Pressable onPress={() => setFontSize(Math.max(14, fontSize - 1))}>
                <Text style={styles.settingButton}>A⁻</Text>
              </Pressable>
              <Text>{fontSize}</Text>
              <Pressable onPress={() => setFontSize(Math.min(30, fontSize + 1))}>
                <Text style={styles.settingButton}>A⁺</Text>
              </Pressable>
            </View>
            <Text style={styles.settingLabel}>颜色</Text>
            <View style={styles.palette}>
              {palette.map(c => (
                <Pressable
                  key={c}
                  onPress={() => setTheme(c)}
                  style={[
                    styles.swatch,
                    { backgroundColor: c },
                    theme === c && styles.swatchSelected,
                  ]}
                />
              ))}
            </View>
            <Text style={styles.settingLabel}>翻页</Text>
            <View style={styles.optionRow}>
              {["仿真", "覆盖", "平移", "上下", "无动画"].map((x, i) => (
                <Pill key={x} label={x} active={i === 0} />
              ))}
            </View>
            <Text style={styles.autoRead}>开启自动阅读 ▷</Text>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#eee7dd" },
  content: { paddingBottom: 126 },
  topBar: {
    height: 64,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  back: { fontSize: 36 },
  topAction: { fontSize: 16 },
  topIcons: { fontSize: 18 },
  cover: {
    width: 132,
    height: 184,
    borderRadius: 10,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  coverText: {
    color: "white",
    fontSize: 25,
    fontWeight: "900",
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 34,
    textAlign: "center",
    paddingHorizontal: 28,
    marginTop: 18,
  },
  author: { textAlign: "center", color: "#665f58", marginTop: 12 },
  follow: { backgroundColor: "#ded7ce" },
  metrics: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 28,
    paddingHorizontal: 14,
  },
  metric: { flex: 1, alignItems: "center" },
  metricValue: { fontSize: 24, fontWeight: "800" },
  unit: { fontSize: 14 },
  metricHint: { fontSize: 12, color: "#999", marginTop: 7 },
  divider: { width: 1, height: 34, backgroundColor: "#d7d0c8" },
  briefBlock: {
    padding: 20,
    marginTop: 24,
    borderTopWidth: 1,
    borderColor: "#ddd4cb",
  },
  tagLine: { flexDirection: "row", flexWrap: "wrap", alignItems: "center" },
  sectionTitle: { fontSize: 20, fontWeight: "900", marginRight: 8 },
  description: {
    fontSize: 16,
    lineHeight: 25,
    color: "#5d5751",
    marginTop: 12,
  },
  moreText: { color: "#176db5", fontSize: 16, alignSelf: "flex-end" },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 8,
  },
  review: { flexDirection: "row", padding: 18, gap: 10 },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  reviewBody: { flex: 1 },
  reviewText: { fontSize: 15, lineHeight: 23, color: "#514b46" },
  stars: { color: "#625a54", fontSize: 12, marginTop: 6 },
  listen: {
    position: "absolute",
    right: 20,
    bottom: 102,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#68615a",
    alignItems: "center",
    justifyContent: "center",
  },
  listenText: { color: "white", fontSize: 22, fontWeight: "800" },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 88,
    backgroundColor: "#eee7dd",
    borderTopWidth: 1,
    borderColor: "#d8d0c8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  bottomItem: { textAlign: "center", lineHeight: 25 },
  scrim: { flex: 1, backgroundColor: "rgba(0,0,0,.5)" },
  panel: {
    height: "68%",
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    backgroundColor: "#f4f1ed",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
  },
  panelTitle: {
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 22,
  },
  longText: { fontSize: 17, lineHeight: 30 },
  panelTabs: { flexDirection: "row", gap: 36, marginBottom: 24 },
  selectedTab: { fontWeight: "900", fontSize: 19 },
  catalogMeta: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  bookPage: { color: colors.orange, fontSize: 18, paddingVertical: 18 },
  chapter: { paddingVertical: 15, borderBottomWidth: 1, borderColor: "#ddd" },
  chapterMeta: { fontSize: 12, color: "#999", marginTop: 7 },
  settingLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 14,
  },
  slider: {
    height: 24,
    flex: 1,
    marginHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#cbc5bd",
  },
  settingButton: {
    fontSize: 23,
    backgroundColor: "#e4dfd8",
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 24,
    overflow: "hidden",
  },
  settingLabel: { marginTop: 18, marginBottom: 10 },
  palette: { flexDirection: "row", justifyContent: "space-between" },
  swatch: { width: 36, height: 36, borderRadius: 18 },
  swatchSelected: { borderWidth: 3, borderColor: colors.orange },
  optionRow: { flexDirection: "row", flexWrap: "wrap" },
  autoRead: { textAlign: "center", marginTop: 28 },
});
