// 分类、普通搜索和 AI 搜索页面。
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { BookRow } from "../../components/books";
import { colors, FilterSheet, Pill, TopBar, type FilterGroup } from "../../components/common";
import { books } from "../../data/books";
import { aiSearchUrl, api, type CategorySection } from "../../services/api";
import { type Book, type Route } from "../../types";
import { appStyles as s } from "../../styles/appStyles";

const categoryChannels = ["男生", "女生", "听书", "出版", "短剧", "漫画"];

export function CategoryScreen({ back }: { back: () => void }) {
  const [channel, setChannel] = useState("男生");
  const [sections, setSections] = useState<CategorySection[]>([]);
  const [active, setActive] = useState<CategorySection["key"]>("hot");
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Record<string, number>>({});
  const requestId = useRef(0);

  const loadCategories = (nextChannel: string) => {
    const id = ++requestId.current;
    setLoading(true);
    setLoadError(false);
    api
      .categories(nextChannel)
      .then(response => {
        if (id !== requestId.current) return;
        setSections(response.sections);
        setSelected(response.sections[0]?.tags[0] || "");
      })
      .catch(() => {
        if (id === requestId.current) setLoadError(true);
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false);
      });
  };

  useEffect(() => {
    const id = ++requestId.current;
    api
      .categories("男生")
      .then(response => {
        if (id !== requestId.current) return;
        setSections(response.sections);
        setSelected(response.sections[0]?.tags[0] || "");
      })
      .catch(() => {
        if (id === requestId.current) setLoadError(true);
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false);
      });
  }, []);

  const changeChannel = (next: string) => {
    if (next === channel) return;
    setChannel(next);
    setActive("hot");
    sectionOffsets.current = {};
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    loadCategories(next);
  };

  const selectSection = (key: CategorySection["key"]) => {
    setActive(key);
    scrollRef.current?.scrollTo({ y: sectionOffsets.current[key] || 0, animated: true });
  };

  const syncActiveSection = (offsetY: number) => {
    const marker = offsetY + 36;
    let current: CategorySection["key"] = sections[0]?.key || "hot";
    for (const section of sections) {
      if ((sectionOffsets.current[section.key] || 0) <= marker) current = section.key;
    }
    if (current !== active) setActive(current);
  };

  return (
    <View style={s.page}>
      <View style={local.categoryTop}>
        <Pressable accessibilityLabel="返回" onPress={back} hitSlop={10}>
          <Text style={s.back}>‹</Text>
        </Pressable>
        <View style={local.categoryTabs}>
          {categoryChannels.map(item => (
            <Pressable key={item} onPress={() => changeChannel(item)} style={local.categoryTabHit}>
              <Text style={[local.categoryTab, channel === item && local.categoryTabActive]}>
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={local.categorySearch}>⌕</Text>
      </View>
      <View style={{ flex: 1, flexDirection: "row" }}>
        <View style={s.side}>
          {sections.map(section => (
            <Pressable
              accessibilityLabel={`分类分区-${section.title}`}
              key={section.key}
              onPress={() => selectSection(section.key)}
              style={[s.sideItem, section.key === active && s.sideOn]}
            >
              <Text numberOfLines={1} style={section.key === active && s.active}>
                {section.title}
              </Text>
            </Pressable>
          ))}
        </View>
        {loading ? (
          <View style={local.categoryLoading}>
            <ActivityIndicator color={colors.orange} />
          </View>
        ) : loadError ? (
          <Pressable onPress={() => loadCategories(channel)} style={local.categoryLoading}>
            <Text style={s.muted}>分类加载失败，点击重试</Text>
          </Pressable>
        ) : (
          <ScrollView
            ref={scrollRef}
            accessibilityLabel="分类标签滚动区"
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={32}
            onScroll={event => syncActiveSection(event.nativeEvent.contentOffset.y)}
            contentContainerStyle={local.categoryContent}
          >
            {sections.map(section => (
              <View
                key={section.key}
                accessibilityLabel={`标签分区-${section.title}`}
                onLayout={event => {
                  sectionOffsets.current[section.key] = event.nativeEvent.layout.y;
                }}
                style={local.categorySection}
              >
                <View style={local.categorySectionHead}>
                  <Text style={local.categorySectionTitle}>{section.title}</Text>
                  {section.key !== "hot" && <Text style={local.expand}>展开⌄</Text>}
                </View>
                <View style={local.categoryTagGrid}>
                  {section.tags.map(tag => {
                    const isSelected = selected === `${section.key}:${tag}`;
                    return (
                      <Pressable
                        key={tag}
                        onPress={() => setSelected(`${section.key}:${tag}`)}
                        style={[local.categoryTag, isSelected && local.categoryTagSelected]}
                      >
                        <Text
                          numberOfLines={1}
                          style={[
                            local.categoryTagText,
                            isSelected && local.categoryTagTextSelected,
                          ]}
                        >
                          {tag}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

export function SearchScreen({
  back,
  go,
  open,
}: {
  back: () => void;
  go: (r: Route) => void;
  open: (b: Book) => void;
}) {
  const [q, setQ] = useState("");
  const [searched, setSearched] = useState(false);
  const [resultTab, setResultTab] = useState("综合");
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterValue, setFilterValue] = useState<Record<string, string>>({
    gender: "全部",
    status: "全部",
    words: "全部",
  });
  const [recent, setRecent] = useState(["九州大佬", "机甲小队", "女强", "末日群像"]);
  const resultTabs = ["综合", "广场", "短剧", "漫剧", "漫画", "听书", "书籍"];
  const filterGroups: FilterGroup[] = [
    { key: "gender", title: "频道", options: ["全部", "男生", "女生"] },
    { key: "status", title: "连载状态", options: ["全部", "连载中", "已完结"] },
    { key: "words", title: "字数", options: ["全部", "30万字以下", "30-100万字", "100万字以上"] },
  ];
  const activeFilterCount = Object.values(filterValue).filter(value => value !== "全部").length;
  const matchedBooks = books.filter(book => {
    const keywordMatch = !q || `${book.title}${book.author}${book.tags}`.includes(q);
    const genderMatch =
      filterValue.gender === "全部" ||
      (filterValue.gender === "女生"
        ? book.tags.some(tag => ["女强", "古代言情", "玄幻言情"].includes(tag))
        : !book.tags.includes("古代言情"));
    const statusMatch = filterValue.status === "全部" || book.status === filterValue.status;
    const wordBand = Number(book.id.replace("b", "")) % 3;
    const wordsMatch =
      filterValue.words === "全部" ||
      (filterValue.words === "30万字以下" && wordBand === 1) ||
      (filterValue.words === "30-100万字" && wordBand === 2) ||
      (filterValue.words === "100万字以上" && wordBand === 0);
    return keywordMatch && genderMatch && statusMatch && wordsMatch;
  });

  const submitSearch = () => {
    setResultTab("综合");
    setSearched(true);
    if (q && !recent.includes(q)) setRecent([q, ...recent].slice(0, 8));
  };

  return (
    <View style={s.page}>
      <View style={s.searchTop}>
        <Pressable onPress={back}>
          <Text style={s.back}>‹</Text>
        </Pressable>
        <View style={[s.search, { flex: 1 }]}>
          <TextInput
            placeholder="搜索书名、作者"
            value={q}
            onChangeText={x => {
              setQ(x);
              setSearched(false);
            }}
            style={{ flex: 1 }}
          />
          {q ? (
            <Pressable
              onPress={() => {
                setQ("");
                setSearched(false);
              }}
            >
              <Text>×</Text>
            </Pressable>
          ) : (
            <Pressable onPress={() => go("ai")}>
              <Text style={s.ai}>Ai</Text>
            </Pressable>
          )}
        </View>
        <Pressable onPress={submitSearch}>
          <Text style={s.searchAction}>搜索</Text>
        </Pressable>
      </View>
      {searched ? (
        <>
          <View style={local.resultBar}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={local.resultTabsContent}
            >
              {resultTabs.map(tab => (
                <Pressable key={tab} onPress={() => setResultTab(tab)} style={local.resultTabHit}>
                  <Text style={[local.resultTab, resultTab === tab && local.resultTabActive]}>
                    {tab}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable onPress={() => setFilterVisible(true)} style={local.filterTrigger}>
              <Text style={[local.filterTriggerText, activeFilterCount > 0 && local.filterOn]}>
                ⏷ 筛选{activeFilterCount > 0 ? ` ${activeFilterCount}` : ""}
              </Text>
            </Pressable>
          </View>
          {resultTab === "综合" || resultTab === "书籍" ? (
            <FlatList
              data={matchedBooks}
              keyExtractor={book => book.id}
              renderItem={({ item }) => <BookRow book={item} onPress={() => open(item)} />}
              ListEmptyComponent={<Text style={s.empty}>没有找到，试试 AI 智能寻书</Text>}
            />
          ) : (
            <SearchChannelResults tab={resultTab} query={q} open={open} />
          )}
          <FilterSheet
            visible={filterVisible}
            groups={filterGroups}
            value={filterValue}
            onChange={setFilterValue}
            onClose={() => setFilterVisible(false)}
            onConfirm={() => setFilterVisible(false)}
          />
        </>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View style={s.titleRow}>
            <Text style={s.filterTitle}>搜索历史</Text>
            <Pressable onPress={() => setRecent([])}>
              <Text>♲</Text>
            </Pressable>
          </View>
          <View style={s.wrap}>
            {recent.map(x => (
              <Pill key={x} label={x} onPress={() => setQ(x)} />
            ))}
          </View>
          <Text style={[s.filterTitle, { marginTop: 26 }]}>番茄热搜</Text>
          {books.map((b, i) => (
            <Pressable
              key={b.id}
              onPress={() => {
                setQ(b.title);
                setSearched(true);
              }}
              style={s.hot}
            >
              <Text style={s.rankNo}>{i + 1}</Text>
              <Text numberOfLines={1} style={{ flex: 1 }}>
                {b.title}
              </Text>
              <Text style={s.meta}>热</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function SearchChannelResults({
  tab,
  query,
  open,
}: {
  tab: string;
  query: string;
  open: (book: Book) => void;
}) {
  return (
    <ScrollView contentContainerStyle={local.channelResults}>
      <Text style={local.channelHeading}>
        {query || "热门"} · {tab}
      </Text>
      {books.slice(0, 4).map((book, index) => (
        <Pressable key={`${tab}-${book.id}`} onPress={() => open(book)} style={local.channelCard}>
          <View
            style={[local.channelPoster, { backgroundColor: index % 2 ? "#dce7ef" : "#ede2db" }]}
          >
            <Text style={local.channelPosterType}>{tab}</Text>
            <Text style={local.channelPosterTitle}>{book.cover.replace("\n", " ")}</Text>
          </View>
          <Text numberOfLines={2} style={local.channelTitle}>
            {book.title}
          </Text>
          <Text style={local.channelMeta}>
            {book.tags[0]} · {85 - index * 9}万热度
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

export function AiSearchScreen({ back, open }: { back: () => void; open: (b: Book) => void }) {
  const [q, setQ] = useState("想看女强群像玄幻小说");
  const [answer, setAnswer] = useState("");
  const [matches, setMatches] = useState<Book[]>([]);
  const es = useRef<EventSource | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      es.current?.close();
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const search = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      es.current?.close();
      setAnswer("");
      setMatches([]);
      try {
        const stream = new EventSource(aiSearchUrl(q));
        es.current = stream;
        stream.addEventListener("token", (e: any) => setAnswer(a => a + JSON.parse(e.data).text));
        stream.addEventListener("books", (e: any) => setMatches(JSON.parse(e.data).books));
        stream.addEventListener("done", () => stream.close());
        stream.onerror = () => {
          stream.close();
          setAnswer("为你找到以下高匹配作品：");
          setMatches(
            books.filter(b => b.tags.some(t => q.includes(t))).slice(0, 3).length
              ? books.filter(b => b.tags.some(t => q.includes(t))).slice(0, 3)
              : books.slice(0, 3),
          );
        };
      } catch {
        setMatches(books.slice(0, 3));
      }
    }, 300);
  };
  return (
    <View style={s.page}>
      <TopBar title="AI 智能寻书" onBack={back} />
      <ScrollView style={s.chat}>
        <View style={s.aiHello}>
          <Text style={s.aiTitle}>你好，我是拾光 AI</Text>
          <Text style={s.muted}>告诉我想看的题材、人物或情节，我会从书库中寻找。</Text>
        </View>
        {!!answer && (
          <View style={s.bubble}>
            <Text>{answer}</Text>
          </View>
        )}
        {matches.map(b => (
          <BookRow key={b.id} book={b} onPress={() => open(b)} />
        ))}
      </ScrollView>
      <View style={s.composer}>
        <TextInput value={q} onChangeText={setQ} multiline style={s.composeInput} />
        <Pressable onPress={search} style={s.send}>
          <Text style={{ color: "white" }}>发送</Text>
        </Pressable>
      </View>
    </View>
  );
}

const local = StyleSheet.create({
  categoryTop: {
    height: 58,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  categoryTabs: { flex: 1, flexDirection: "row", justifyContent: "space-around" },
  categoryTabHit: { minWidth: 42, height: 48, alignItems: "center", justifyContent: "center" },
  categoryTab: { color: "#999", fontSize: 16 },
  categoryTabActive: { color: "#171717", fontSize: 18, fontWeight: "800" },
  categorySearch: { width: 28, textAlign: "right", fontSize: 26 },
  categoryLoading: { flex: 1, alignItems: "center", justifyContent: "center" },
  categoryContent: { paddingHorizontal: 14, paddingBottom: 80 },
  categorySection: { paddingTop: 14, paddingBottom: 5 },
  categorySectionHead: {
    height: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categorySectionTitle: { color: "#999", fontSize: 14 },
  expand: { color: "#999", fontSize: 13 },
  categoryTagGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryTag: {
    width: "31%",
    flexGrow: 1,
    height: 42,
    borderRadius: 8,
    backgroundColor: "#f6f6f6",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  categoryTagSelected: { backgroundColor: "#fff0e9" },
  categoryTagText: { color: "#222", fontSize: 14 },
  categoryTagTextSelected: { color: colors.orange, fontWeight: "700" },
  resultBar: {
    height: 50,
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f2f2f2",
  },
  resultTabsContent: { paddingHorizontal: 13 },
  resultTabHit: {
    height: 50,
    paddingHorizontal: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  resultTab: { color: "#888", fontSize: 15 },
  resultTabActive: { color: "#171717", fontWeight: "800" },
  filterTrigger: {
    minWidth: 76,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    shadowColor: "white",
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  filterTriggerText: { color: "#777", fontSize: 14 },
  filterOn: { color: colors.orange, fontWeight: "700" },
  channelResults: { padding: 12, flexDirection: "row", flexWrap: "wrap", gap: 10 },
  channelHeading: { width: "100%", fontSize: 16, fontWeight: "800", marginBottom: 2 },
  channelCard: { width: "48%", flexGrow: 1, paddingBottom: 10 },
  channelPoster: { height: 150, borderRadius: 10, padding: 12, justifyContent: "flex-end" },
  channelPosterType: { position: "absolute", top: 9, right: 9, fontSize: 11, color: "#555" },
  channelPosterTitle: { fontSize: 24, fontWeight: "900" },
  channelTitle: { fontSize: 15, fontWeight: "700", lineHeight: 21, marginTop: 8 },
  channelMeta: { color: "#aaa", fontSize: 12, marginTop: 5 },
});
