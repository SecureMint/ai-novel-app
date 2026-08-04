// 个人中心、浏览历史与用户主页。
import React, { useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { BookRow } from "../../components/books";
import { TopBar } from "../../components/common";
import { books } from "../../data/books";
import { api } from "../../services/api";
import { type Book, type Route } from "../../types";
import { appStyles as s } from "../../styles/appStyles";

export function ProfileScreen({
  go,
  openService,
}: {
  go: (r: Route) => void;
  openService: (title: string) => void;
}) {
  return (
    <ScrollView style={s.page} contentContainerStyle={{ padding: 20 }}>
      <View style={s.profileHead}>
        <View style={s.avatar}>
          <Text style={{ fontSize: 28 }}>木</Text>
        </View>
        <Pressable style={s.profileIdentity} onPress={() => go("user")}>
          <Text style={s.heroTitle}>木子是李pro</Text>
          <Text numberOfLines={2} style={s.muted}>
            关注 2　粉丝 0　获赞 0　拯救书荒 0　›
          </Text>
        </Pressable>
      </View>
      <View style={s.quick}>
        {[
          ["商城", "▣"],
          ["浏览历史", "◷"],
          ["我的消息", "◌"],
          ["写小说", "✎"],
          ["我的预约", "▤"],
        ].map(([x, i]) => (
          <Pressable
            key={x}
            onPress={() => (x === "浏览历史" ? go("history") : openService(x))}
            style={s.quickItem}
          >
            <Text style={s.quickIcon}>{i}</Text>
            <Text numberOfLines={1} style={s.quickLabel}>
              {x}
            </Text>
          </Pressable>
        ))}
      </View>
      <Pressable onPress={() => openService("书友热聊")} style={s.discussion}>
        <Text style={s.bookTitle}>书友热聊 · 末日灾祸：谁让这群癫子去救世的</Text>
        <Text style={s.muted}>1小时前更新 · 3552人正在讨论　›</Text>
      </Pressable>
      <View style={s.profileCard}>
        <Text style={s.filterTitle}>我的服务</Text>
        {["消息通知", "阅读偏好", "字体与主题", "帮助与反馈", "设置"].map(x => (
          <Pressable onPress={() => openService(x)} key={x} style={s.menuRow}>
            <Text>{x}</Text>
            <Text>›</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

export function HistoryScreen({
  back,
  open,
  guard,
}: {
  back: () => void;
  open: (b: Book) => void;
  guard: (f: () => void) => void;
}) {
  const [items, setItems] = useState(books);
  const clear = () => setItems([]);
  return (
    <View style={s.page}>
      <TopBar
        title="浏览历史"
        onBack={back}
        right={
          <Pressable onPress={clear}>
            <Text>清空</Text>
          </Pressable>
        }
      />
      <Text style={[s.filterTitle, { paddingHorizontal: 20 }]}>今天</Text>
      <FlatList
        data={items}
        keyExtractor={b => b.id}
        renderItem={({ item, index }) => (
          <View style={{ position: "relative" }}>
            <BookRow book={item} onPress={() => open(item)} />
            <Pressable
              onPress={() => guard(() => api.addShelf(item.id).catch(() => {}))}
              style={s.addShelf}
            >
              <Text style={s.searchAction}>{index < 2 ? "已加书架" : "加入书架"}</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setItems(v => v.filter(x => x.id !== item.id));
                api.deleteHistory(item.id).catch(() => {});
              }}
              style={s.swipeDelete}
            >
              <Text style={{ color: "#aaa" }}>删除</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={<Text style={s.empty}>历史已清空，你的划线和想法仍然保留</Text>}
      />
    </View>
  );
}

export function UserScreen({ back }: { back: () => void }) {
  return (
    <ScrollView style={s.page}>
      <View style={s.userHero}>
        <TopBar title="" onBack={back} />
        <View style={s.bigAvatar}>
          <Text style={{ fontSize: 38 }}>木</Text>
        </View>
        <Text style={s.userName}>木子是李pro ♀</Text>
        <Text>阅读 481 本书 · 2433 时 28 分</Text>
        <Text style={s.userBio}>单机日更30000字，不会作诗也会吟</Text>
      </View>
      <View style={s.archive}>
        <Text style={s.heroTitle}>▣ 我的档案</Text>
        <Text style={s.muted}>本月听读15天 · 超63%用户　›</Text>
      </View>
      <View style={s.profileTabs}>
        <Text>书架 47</Text>
        <Text style={s.heroTitle}>创作 1</Text>
        <Text>点评 0</Text>
        <Text>讨论 0</Text>
      </View>
      <View style={s.creationCard}>
        <View style={s.creationPlaceholder}>
          <Text style={s.creationText}>玄幻单女主超甜！</Text>
        </View>
        <Text style={s.meta}>推荐1本书 · 15浏览</Text>
      </View>
    </ScrollView>
  );
}
