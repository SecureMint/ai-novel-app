// 福利、书架管理与书架筛选页面。
import React, { useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { BookRow } from "../../components/books";
import { Pill, TopBar } from "../../components/common";
import { books } from "../../data/books";
import { api } from "../../services/api";
import { type Book, type Filters, type Route } from "../../types";
import { appStyles as s } from "../../styles/appStyles";

export function BenefitsScreen({ guard }: { guard: (f: () => void) => void }) {
  const [days, setDays] = useState(2);
  return (
    <ScrollView style={s.page} contentContainerStyle={{ padding: 20 }}>
      <Text style={s.heroTitle}>阅读有礼</Text>
      <View style={s.benefitCard}>
        <Text style={s.coin}>◉ {128 + days * 20}</Text>
        <Text style={s.muted}>我的金币</Text>
        <Text style={s.filterTitle}>连续签到 {days} 天</Text>
        <View style={s.days}>
          {[1, 2, 3, 4, 5, 6, 7].map(d => (
            <View key={d} style={[s.day, d <= days && s.dayOn]}>
              <Text>{d <= days ? "✓" : `+${d * 10}`}</Text>
              <Text style={s.meta}>{d}天</Text>
            </View>
          ))}
        </View>
        <Pressable onPress={() => guard(() => setDays(d => Math.min(7, d + 1)))} style={s.login}>
          <Text style={s.loginText}>立即签到</Text>
        </Pressable>
      </View>
      <Text style={s.filterTitle}>每日任务</Text>
      {["阅读 10 分钟", "加入一本喜欢的书", "写下一条想法"].map((x, i) => (
        <View key={x} style={s.task}>
          <Text>
            {i ? "◇" : "◉"}　{x}
          </Text>
          <Text style={s.searchAction}>去完成</Text>
        </View>
      ))}
    </ScrollView>
  );
}

export function ShelfScreen({
  go,
  open,
  guard,
}: {
  go: (r: Route) => void;
  open: (b: Book) => void;
  guard: (f: () => void) => void;
}) {
  const [edit, setEdit] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (id: string) =>
    setSelected(x => (x.includes(id) ? x.filter(i => i !== id) : [...x, id]));
  const action = (a: string) =>
    guard(async () => {
      await api.batch(selected, a).catch(() => {});
      if (a === "delete") setSelected([]);
    });
  return (
    <View style={s.page}>
      {edit ? (
        <View style={s.editTop}>
          <Pressable
            onPress={() =>
              setSelected(selected.length === books.length ? [] : books.map(b => b.id))
            }
          >
            <Text>全选</Text>
          </Pressable>
          <Text numberOfLines={1} style={s.editTitle}>
            全部书籍（已选择 {selected.length} 本）
          </Text>
          <Pressable onPress={() => setEdit(false)}>
            <Text style={s.searchAction}>完成</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={s.shelfTabs}>
            <Text style={s.heroTitle}>书架</Text>
            {["历史", "收藏", "圈子"].map(x => (
              <Text key={x} style={s.muted}>
                {x}
              </Text>
            ))}
            <Text>⌕　⋮</Text>
          </View>
          <View style={s.readTime}>
            <Text>🟠 今日已看听读 1 分钟</Text>
            <Pressable onPress={() => setEdit(true)}>
              <Text>编辑</Text>
            </Pressable>
          </View>
          <View style={s.banner}>
            <Text style={s.filterTitle}>你看过的小说上架改编剧了</Text>
            <Text style={s.muted}>漫剧 · 94.5 万原著粉推荐</Text>
          </View>
          <View style={s.filterBar}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={s.filterScroller}
              contentContainerStyle={s.filterScrollerContent}
            >
              {["全部", "阅读", "听书", "出版", "分组"].map((x, i) => (
                <Pill key={x} label={x} active={!i} />
              ))}
            </ScrollView>
            <Pressable onPress={() => go("filter")} style={s.filterTrigger}>
              <Text>▽ 筛选</Text>
            </Pressable>
          </View>
        </>
      )}
      <FlatList
        data={books}
        keyExtractor={b => b.id}
        contentContainerStyle={{ paddingBottom: edit ? 90 : 20 }}
        renderItem={({ item }) => (
          <BookRow
            book={item}
            onPress={() => open(item)}
            selectable={edit}
            selected={selected.includes(item.id)}
            onSelect={() => toggle(item.id)}
          />
        )}
      />
      {edit && (
        <View style={s.actionBar}>
          {[
            ["similar", "⌕", "找相似书"],
            ["move", "↪", "移动至分组"],
            ["playlist", "＋", "加入书单"],
            ["delete", "⌫", "删除"],
          ].map(([a, ic, label]) => (
            <Pressable
              disabled={!selected.length}
              key={a}
              onPress={() => action(a)}
              style={{
                alignItems: "center",
                opacity: selected.length ? 1 : 0.35,
              }}
            >
              <Text style={s.actionIcon}>{ic}</Text>
              <Text style={s.actionLabel}>{label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

export function ShelfFilterScreen({ back }: { back: () => void }) {
  const [f, setF] = useState<Filters>({
    type: ["全部"],
    progress: ["全部"],
    status: ["全部"],
    subject: ["全部"],
  });
  const blocks: [keyof Filters, string, string[]][] = [
    ["type", "类型", ["全部", "阅读", "听书", "短剧", "漫剧", "互动", "出版"]],
    ["progress", "阅读进度", ["全部", "未读过", "未读50章以上", "未读300章以上", "已读"]],
    ["status", "完结状态", ["全部", "完结", "连载", "已下载"]],
    ["subject", "题材分类", ["全部", "穿越", "古代言情", "玄幻言情", "异世", "机甲", "末世"]],
  ];
  const toggle = (k: keyof Filters, x: string) =>
    setF(v => ({
      ...v,
      [k]:
        x === "全部"
          ? ["全部"]
          : [...v[k].filter(y => y !== "全部" && y !== x), ...(v[k].includes(x) ? [] : [x])],
    }));
  return (
    <ScrollView style={s.page}>
      <TopBar
        title="书架筛选"
        onBack={back}
        right={
          <Pressable
            onPress={() =>
              setF({
                type: ["全部"],
                progress: ["全部"],
                status: ["全部"],
                subject: ["全部"],
              })
            }
          >
            <Text>重置</Text>
          </Pressable>
        }
      />
      {blocks.map(([k, title, items]) => (
        <View key={k} style={s.filterBlock}>
          <Text style={s.filterTitle}>{title}</Text>
          <View style={s.wrap}>
            {items.map(x => (
              <Pill key={x} label={x} active={f[k].includes(x)} onPress={() => toggle(k, x)} />
            ))}
          </View>
        </View>
      ))}
      <Pressable onPress={back} style={[s.login, { margin: 20 }]}>
        <Text style={s.loginText}>查看筛选结果</Text>
      </Pressable>
    </ScrollView>
  );
}
