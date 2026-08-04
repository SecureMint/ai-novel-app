import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { books } from "../data/books";
import { type Book, type Route } from "../types";
import { BookCover } from "../components/books";
import { colors, FilterSheet, type FilterGroup } from "../components/common";
import { HorizontalPagedList, InfiniteMasonry } from "../components/contentFeeds";
import { api } from "../services/api";

type Props = {
  go: (route: Route) => void;
  openBook: (book: Book) => void;
  onUnhandled: (name: string) => void;
};
const channels = ["推荐", "小说", "听书", "看剧", "经典", "短篇", "漫剧", "视频", "知识"];
const filters = ["完结", "一年内上架", "200万字以上", "男生"];
const cardColors = [
  "#a8272f",
  "#e5d4b5",
  "#222d48",
  "#d6ebe3",
  "#594938",
  "#e9d9ce",
  "#4c627f",
  "#f0d2cc",
];

export function HomeScreen({ go, openBook, onUnhandled }: Props) {
  const [channel, setChannel] = useState("推荐");
  const [filter, setFilter] = useState("一年内上架");
  const [filterVisible, setFilterVisible] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, string>>({
    progress: "全部",
    audience: "全部",
    words: "全部",
  });
  const [loading, setLoading] = useState(false);
  const [feedBooks, setFeedBooks] = useState(books);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    api
      .books(1, 16)
      .then(response => setFeedBooks(response.books))
      .catch(() => setFeedBooks(books));
  }, []);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const changeChannel = (next: string) => {
    if (next === channel || loading) return;
    if (timer.current) clearTimeout(timer.current);
    setLoading(true);
    timer.current = setTimeout(() => {
      setChannel(next);
      setLoading(false);
    }, 240);
  };
  const changeNovelFilter = (next: string) => {
    if (next === filter || loading) return;
    setLoading(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setFilter(next);
      setLoading(false);
    }, 240);
  };
  const novelFilterGroups: FilterGroup[] = [
    { key: "progress", title: "连载状态", options: ["全部", "连载中", "已完结"] },
    { key: "audience", title: "频道", options: ["全部", "男生", "女生"] },
    { key: "words", title: "字数", options: ["全部", "30万字以下", "30-100万字", "100万字以上"] },
  ];
  const advancedFilterCount = Object.values(advancedFilters).filter(
    value => value !== "全部",
  ).length;
  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <View style={styles.searchLine}>
          <Pressable
            onPress={() => go("search")}
            style={({ pressed }) => [styles.search, pressed && styles.pressed]}
          >
            <Text numberOfLines={1} style={styles.searchText}>
              ⌕ {channel === "小说" ? "军校联赛夺冠，我是帝国小殿下？" : "机甲系里的那个省钱奇才"}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => go("category")}
            style={({ pressed }) => [styles.categoryButton, pressed && styles.pressed]}
          >
            <Text style={styles.categoryText}>⌘ 分类</Text>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.channels}
        >
          {channels.map(item => (
            <Pressable key={item} onPress={() => changeChannel(item)} style={styles.channelHit}>
              <Text style={[styles.channel, item === channel && styles.channelActive]}>{item}</Text>
            </Pressable>
          ))}
        </ScrollView>
        {channel === "小说" && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
          >
            {filters.map(item => (
              <Pressable
                key={item}
                onPress={() => changeNovelFilter(item)}
                style={[styles.filter, item === filter && styles.filterActive]}
              >
                <Text style={[styles.filterText, item === filter && styles.filterTextActive]}>
                  {item}
                </Text>
              </Pressable>
            ))}
            <Pressable onPress={() => setFilterVisible(true)} style={styles.filterMore}>
              <Text style={advancedFilterCount > 0 && styles.filterMoreActive}>
                {advancedFilterCount > 0 ? advancedFilterCount : "⌄"}
              </Text>
            </Pressable>
          </ScrollView>
        )}
      </View>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.orange} />
        </View>
      ) : (
        <>
          {channel === "推荐" ? (
            <RecommendedFeed books={feedBooks} openBook={openBook} onUnhandled={onUnhandled} />
          ) : (
            <ChannelFeed books={feedBooks} channel={channel} openBook={openBook} />
          )}
        </>
      )}
      <Pressable
        onPress={() => onUnhandled("听读赚钱")}
        style={({ pressed }) => [styles.reward, pressed && styles.pressed]}
      >
        <Text style={styles.rewardIcon}>◉</Text>
        <Text style={styles.rewardText}>听读赚钱</Text>
      </Pressable>
      <Pressable
        onPress={() => go("ai")}
        style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
      >
        <Text style={styles.fabText}>羽</Text>
      </Pressable>
      <FilterSheet
        visible={filterVisible}
        groups={novelFilterGroups}
        value={advancedFilters}
        onChange={setAdvancedFilters}
        onClose={() => setFilterVisible(false)}
        onConfirm={() => {
          setFilterVisible(false);
          setLoading(true);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => setLoading(false), 240);
        }}
      />
    </View>
  );
}

function RecommendedFeed({
  books: sourceBooks,
  openBook,
  onUnhandled,
}: {
  books: Book[];
  openBook: (book: Book) => void;
  onUnhandled: (name: string) => void;
}) {
  const rankTabs = ["推荐榜", "完本榜", "巅峰榜", "新书榜", "短剧榜"];
  const [rankTab, setRankTab] = useState("推荐榜");
  const tabOffset = rankTabs.indexOf(rankTab);
  const rankedBooks = sourceBooks.map((_, index, all) => all[(index + tabOffset) % all.length]);
  const initialFeed: FeedEntry[] = [
    { key: "initial-book-0", type: "book", book: sourceBooks[0], index: 0 },
    { key: "initial-quote", type: "quote" },
    { key: "initial-forum", type: "forum" },
    { key: "initial-book-1", type: "book", book: sourceBooks[1], index: 1, tall: true },
    { key: "initial-book-2", type: "book", book: sourceBooks[2], index: 2 },
    { key: "initial-book-3", type: "book", book: sourceBooks[3], index: 3 },
    { key: "initial-book-4", type: "book", book: sourceBooks[4], index: 4 },
    { key: "initial-book-5", type: "book", book: sourceBooks[5] || sourceBooks[0], index: 5 },
  ];

  const ranking = (
    <View style={styles.ranking}>
      <View style={styles.rankingHeader}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rankTabs}
        >
          {rankTabs.map(tab => (
            <Pressable key={tab} onPress={() => setRankTab(tab)} style={styles.rankTabHit}>
              <Text style={[styles.rankTab, tab === rankTab && styles.rankTabActive]}>{tab}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Pressable onPress={() => onUnhandled("完整榜单")} style={styles.moreHit}>
          <Text style={styles.more}>完整榜单 ›</Text>
        </Pressable>
      </View>
      <HorizontalPagedList
        data={rankedBooks}
        pageSize={8}
        getKey={(book, index) => `${rankTab}-${book.id}-${index}`}
        renderItem={(book, index) => (
          <Pressable
            onPress={() => openBook(book)}
            style={({ pressed }) => [styles.rankingRow, pressed && styles.pressed]}
          >
            <BookCover book={book} compact />
            <Text style={styles.rankNumber}>{index + 1}</Text>
            <View style={styles.rankInfo}>
              <Text numberOfLines={2} style={styles.rankBook}>
                {book.title}
              </Text>
              <Text numberOfLines={1} style={styles.rankMeta}>
                {book.tags[0]} · {Math.max(31, 91 - index * 4)}万热度
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );

  return (
    <InfiniteMasonry
      key={`${rankTab}-${sourceBooks.length}`}
      data={initialFeed}
      header={ranking}
      contentContainerStyle={styles.content}
      getKey={item => item.key}
      loadMore={async page => {
        const response = await api.books(page, 10);
        return response.books.map((book, index) => ({
          key: `recommended-${page}-${book.id}-${index}`,
          type: "book" as const,
          book,
          index: page * 10 + index,
          tall: index % 5 === 1,
        }));
      }}
      renderItem={item => {
        if (item.type === "forum") return <ForumCard onPress={() => onUnhandled("书荒广场")} />;
        if (item.type === "quote") return <QuoteCard />;
        return item.book ? (
          <SquareCard
            index={item.index || 0}
            book={item.book}
            openBook={openBook}
            tall={item.tall}
          />
        ) : null;
      }}
    />
  );
}

type FeedEntry = {
  key: string;
  type: "book" | "forum" | "quote";
  book?: Book;
  index?: number;
  tall?: boolean;
};

function ChannelFeed({
  books: sourceBooks,
  channel,
  openBook,
}: {
  books: Book[];
  channel: string;
  openBook: (book: Book) => void;
}) {
  const initialItems = sourceBooks.map((book, index) => ({
    key: `${channel}-initial-${book.id}-${index}`,
    book,
    index,
  }));

  return (
    <InfiniteMasonry
      key={`${channel}-${sourceBooks.length}`}
      data={initialItems}
      contentContainerStyle={styles.content}
      getKey={item => item.key}
      loadMore={async page => {
        const response = await api.books(page, 10);
        return response.books.map((book, index) => ({
          key: `${channel}-${page}-${book.id}-${index}`,
          book,
          index: page * 10 + index,
        }));
      }}
      renderItem={item => (
        <SquareCard
          index={item.index}
          book={item.book}
          openBook={openBook}
          tall={item.index % 6 === 0}
          label={channel}
        />
      )}
    />
  );
}

function SquareCard({
  index,
  book,
  openBook,
  tall,
  label,
}: {
  index: number;
  book: Book;
  openBook: (book: Book) => void;
  tall?: boolean;
  label?: string;
}) {
  return (
    <Pressable
      accessibilityLabel={`瀑布流书籍-${book.id}`}
      onPress={() => openBook(book)}
      style={({ pressed }) => [styles.feedCard, pressed && styles.pressed]}
    >
      <View
        style={[
          styles.poster,
          tall && styles.posterTall,
          { backgroundColor: cardColors[index % cardColors.length] },
        ]}
      >
        <Text style={styles.posterEyebrow}>{label || book.tags[0]}</Text>
        <Text style={styles.posterTitle}>{book.cover.replace("\n", " ")}</Text>
        <Text style={styles.posterScore}>{book.score}分</Text>
      </View>
      <Text numberOfLines={2} style={styles.feedTitle}>
        {book.title}
      </Text>
      <Text numberOfLines={2} style={styles.feedMeta}>
        {book.description}
      </Text>
    </Pressable>
  );
}
function ForumCard({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.forum, pressed && styles.pressed]}>
      <Text style={styles.forumLine}>“不想当机甲师的指挥不是好单兵”</Text>
      <Text style={styles.forumLine}>女主出身顶级豪世，修仙大陆横着走</Text>
      <Text style={styles.forumLine}>有没有修仙沙雕女爽文</Text>
      <Text style={styles.forumButton}>去广场 ›</Text>
    </Pressable>
  );
}
function QuoteCard() {
  return (
    <View style={styles.quote}>
      <Text style={styles.quoteText}>@若不辞，万岚的秘密到底有哪些？</Text>
      <Text style={styles.feedTitle}>万岚的秘密到底有哪些？</Text>
      <Text style={styles.feedMeta}>万岚 · 零号院</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f5f5f3" },
  header: { backgroundColor: "rgba(250,252,248,.98)", zIndex: 4 },
  searchLine: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    flexDirection: "row",
    gap: 10,
  },
  search: {
    height: 42,
    minWidth: 0,
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: 9,
    backgroundColor: "white",
  },
  searchText: { color: "#8f8f8f", fontSize: 15 },
  categoryButton: {
    height: 42,
    paddingHorizontal: 12,
    justifyContent: "center",
    borderRadius: 9,
    backgroundColor: "white",
  },
  categoryText: { fontSize: 15, fontWeight: "700" },
  channels: { paddingHorizontal: 10, height: 46, alignItems: "center" },
  channelHit: { paddingHorizontal: 9, height: 46, justifyContent: "center" },
  channel: { fontSize: 16, color: "#999" },
  channelActive: { fontSize: 19, color: "#151515", fontWeight: "900" },
  filters: { paddingHorizontal: 12, paddingBottom: 10, gap: 8 },
  filter: {
    height: 34,
    minWidth: 72,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
    backgroundColor: "#f1f1ef",
  },
  filterActive: { backgroundColor: "#fff0e9" },
  filterText: { fontSize: 14 },
  filterTextActive: { color: "#e76535", fontWeight: "700" },
  filterMore: { width: 36, alignItems: "center", justifyContent: "center" },
  filterMoreActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    color: "white",
    backgroundColor: colors.orange,
    textAlign: "center",
    lineHeight: 20,
    overflow: "hidden",
    fontSize: 11,
    fontWeight: "800",
  },
  content: { paddingHorizontal: 12, paddingBottom: 100 },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  ranking: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    borderRadius: 12,
    backgroundColor: "white",
  },
  rankingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  rankTabs: { flexGrow: 1, alignItems: "center" },
  rankTabHit: { height: 34, paddingHorizontal: 9, justifyContent: "center" },
  rankTab: { color: "#999", fontSize: 13 },
  rankTabActive: { color: "#171717", fontSize: 17, fontWeight: "900" },
  moreHit: { height: 34, paddingLeft: 8, justifyContent: "center", backgroundColor: "white" },
  more: { fontSize: 12, color: "#222" },
  rankingRow: {
    width: "50%",
    height: 68,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 6,
    gap: 3,
  },
  rankNumber: {
    width: 18,
    textAlign: "center",
    fontSize: 15,
    color: "#c9964e",
  },
  rankInfo: { flex: 1, minWidth: 0 },
  rankBook: { fontSize: 13, fontWeight: "700", lineHeight: 18 },
  rankMeta: { fontSize: 11, color: "#c59b63", marginTop: 4 },
  feedCard: { overflow: "hidden", borderRadius: 10, backgroundColor: "white" },
  poster: { height: 168, padding: 12, justifyContent: "flex-end" },
  posterTall: { height: 230 },
  posterEyebrow: { color: "rgba(255,255,255,.85)", fontSize: 12 },
  posterTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 29,
    marginTop: 6,
    textShadowColor: "rgba(0,0,0,.28)",
    textShadowRadius: 3,
  },
  posterScore: { color: "white", fontSize: 12, marginTop: 10 },
  feedTitle: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
    paddingHorizontal: 10,
    paddingTop: 9,
  },
  feedMeta: {
    fontSize: 12,
    color: "#aaa",
    lineHeight: 18,
    paddingHorizontal: 10,
    paddingTop: 5,
    paddingBottom: 12,
  },
  forum: { padding: 12, borderRadius: 10, backgroundColor: "#fff9f3" },
  forumLine: {
    fontSize: 12,
    lineHeight: 19,
    paddingVertical: 7,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee2d6",
  },
  forumButton: {
    alignSelf: "center",
    marginTop: 14,
    color: "#df724b",
    backgroundColor: "#fff0e8",
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 16,
    overflow: "hidden",
  },
  quote: {
    minHeight: 230,
    padding: 16,
    justifyContent: "flex-end",
    borderRadius: 10,
    backgroundColor: "#eeeadd",
  },
  quoteText: {
    fontSize: 25,
    lineHeight: 35,
    fontWeight: "500",
    marginBottom: 14,
  },
  reward: {
    position: "absolute",
    right: 11,
    bottom: 92,
    width: 62,
    height: 62,
    borderRadius: 11,
    backgroundColor: "#ff7a31",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  rewardIcon: { color: "#fff4ac", fontSize: 22 },
  rewardText: { color: "white", fontSize: 10, fontWeight: "700" },
  fab: {
    position: "absolute",
    right: 12,
    bottom: 18,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#ff6b35",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 4,
  },
  fabText: { color: "white", fontSize: 22, fontStyle: "italic" },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
});
