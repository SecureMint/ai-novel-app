// 正文阅读器、阅读设置、目录和笔记面板。
import React, { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { Pill } from "../../components/common";
import { api } from "../../services/api";
import { cacheChapters, queueOffline } from "../../services/offline";
import { type Book } from "../../types";
import { getContrastColor } from "../../utils/contrast";
import { appStyles as s } from "../../styles/appStyles";

export function ReaderScreen({
  book,
  back,
  guard,
}: {
  book: Book;
  back: () => void;
  guard: (f: () => void) => void;
}) {
  const [controls, setControls] = useState(true);
  const [panel, setPanel] = useState<"none" | "menu" | "settings" | "brief">("none");
  const [bg, setBg] = useState("#eee7dd");
  const [size, setSize] = useState(18);
  const [auto, setAuto] = useState(false);
  const [note, setNote] = useState(false);
  const contrast = getContrastColor(bg);
  const paragraphs = [
    "暮色从远山缓缓落下，风穿过长街，捎来了一点桂花的香气。",
    "陆灵悠站在门前，看着院中聚集的众人。谁也不知道，这个看似平静的夜晚，将会改变整个九州的命运。",
    "她抬手拂去肩头的落叶，语气轻快：“既然都到了，那就出发吧。”",
    "月光落在剑锋上，映出一线清冷的银白。少年们对视一眼，终于笑着跟了上去。",
    "路很长，但他们并不孤单。",
  ];
  const longPress = () => {
    setAuto(false);
    setNote(true);
  };
  const download = () =>
    guard(async () => {
      const data = await api.download(book.id).catch(() => ({ chapters: [] }));
      await cacheChapters(data.chapters).catch(() => {});
    });
  return (
    <View style={[s.reader, { backgroundColor: bg }]}>
      <Pressable
        onPress={() => setControls(v => !v)}
        onLongPress={longPress}
        delayLongPress={450}
        style={{ flex: 1 }}
      >
        {controls && (
          <View style={s.readerTop}>
            <Pressable onPress={back}>
              <Text style={[s.back, { color: contrast.text }]}>‹</Text>
            </Pressable>
            <Pressable onPress={() => guard(() => api.addShelf(book.id).catch(() => {}))}>
              <Text style={{ color: contrast.text }}>加入书架</Text>
            </Pressable>
            <Pressable onPress={download}>
              <Text style={{ color: contrast.text }}>下载</Text>
            </Pressable>
            <Text style={{ color: contrast.text }}>☵　↗　⋮</Text>
          </View>
        )}
        <ScrollView contentContainerStyle={s.readerBody}>
          <Text style={[s.chapterTitle, { color: contrast.text }]}>{book.chapter}</Text>
          {paragraphs.map((p, i) => (
            <Text
              key={i}
              style={[
                s.paragraph,
                {
                  fontSize: size,
                  lineHeight: size * 1.9,
                  color: contrast.text,
                },
              ]}
            >
              {p}
            </Text>
          ))}
        </ScrollView>
        {controls && (
          <View style={[s.readerBottom, { backgroundColor: bg }]}>
            <View style={s.chapterBar}>
              <Text style={{ color: contrast.muted }}>上一章</Text>
              <View style={s.progress}>
                <View style={s.progressDot} />
              </View>
              <Text style={{ color: contrast.text }}>下一章</Text>
            </View>
            <View style={s.readerActions}>
              <Pressable onPress={() => setPanel("menu")}>
                <Text style={[s.readerAction, { color: contrast.text }]}>▣{`\n`}目录</Text>
              </Pressable>
              <Pressable onPress={() => setBg(bg === "#171717" ? "#eee7dd" : "#171717")}>
                <Text style={[s.readerAction, { color: contrast.text }]}>◒{`\n`}夜间</Text>
              </Pressable>
              <Pressable onPress={() => setPanel("settings")}>
                <Text style={[s.readerAction, { color: contrast.text }]}>◇{`\n`}设置</Text>
              </Pressable>
              <Text style={[s.readerAction, { color: contrast.muted }]}>▱{`\n`}改编剧场</Text>
            </View>
          </View>
        )}
        <Pressable style={s.listen}>
          <Text style={{ color: "white", fontSize: 24 }}>听</Text>
        </Pressable>
      </Pressable>
      {note && (
        <Modal transparent animationType="fade">
          <Pressable style={s.noteScrim} onPress={() => setNote(false)}>
            <View style={s.noteMenu}>
              <Text>划线　写想法　复制　分享</Text>
              <Pressable
                onPress={() =>
                  guard(async () => {
                    await queueOffline("annotation", {
                      bookId: book.id,
                      text: paragraphs[1],
                      updatedAt: new Date().toISOString(),
                    });
                    setNote(false);
                  })
                }
              >
                <Text style={s.searchAction}>保存想法</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      )}
      <ReaderPanel
        type={panel}
        close={() => setPanel("none")}
        book={book}
        bg={bg}
        setBg={setBg}
        size={size}
        setSize={setSize}
        auto={auto}
        setAuto={setAuto}
      />
    </View>
  );
}

function ReaderPanel({
  type,
  close,
  book,
  bg,
  setBg,
  size,
  setSize,
  auto,
  setAuto,
}: {
  type: string;
  close: () => void;
  book: Book;
  bg: string;
  setBg: (x: string) => void;
  size: number;
  setSize: (x: number) => void;
  auto: boolean;
  setAuto: (x: boolean) => void;
}) {
  const [tab, setTab] = useState("目录");

  if (type === "none") return null;
  const palette = ["#eee7dd", "#f7f1df", "#e1eddf", "#dbe9ef", "#f0e2e3", "#ffffff", "#171717"];
  return (
    <Modal transparent animationType="slide">
      <Pressable style={s.panelScrim} onPress={close} />
      <View style={s.readerPanel}>
        {type === "settings" ? (
          <ScrollView>
            <Pressable onPress={() => setAuto(!auto)}>
              <Text style={s.auto}>{auto ? "暂停自动阅读 Ⅱ" : "开启自动阅读 ▷"}</Text>
            </Pressable>
            <Text style={s.filterTitle}>字号与字体</Text>
            <View style={s.settingRow}>
              <Pressable onPress={() => setSize(Math.max(14, size - 1))}>
                <Text style={s.sizeBtn}>A−</Text>
              </Pressable>
              <Text>{size} 号</Text>
              <Pressable onPress={() => setSize(Math.min(30, size + 1))}>
                <Text style={s.sizeBtn}>A＋</Text>
              </Pressable>
            </View>
            <Text style={s.filterTitle}>阅读背景</Text>
            <View style={s.palette}>
              {palette.map(c => (
                <Pressable
                  key={c}
                  onPress={() => setBg(c)}
                  style={[s.swatch, { backgroundColor: c }, bg === c && s.swatchOn]}
                />
              ))}
            </View>
            <Text style={s.filterTitle}>翻页效果</Text>
            <View style={s.wrap}>
              {["仿真", "覆盖", "平移", "上下", "无动画"].map((x, i) => (
                <Pill key={x} label={x} active={!i} />
              ))}
            </View>
          </ScrollView>
        ) : (
          <>
            <View style={s.panelTabs}>
              {["详情", "目录", "笔记"].map(x => (
                <Pressable key={x} onPress={() => setTab(x)}>
                  <Text style={[s.panelTab, tab === x && s.active]}>{x}</Text>
                </Pressable>
              ))}
            </View>
            {tab === "详情" ? (
              <ScrollView>
                <Text style={s.heroTitle}>{book.title}</Text>
                <Text style={s.muted}>{book.description}</Text>
                <Text style={s.filterTitle}>热门书评</Text>
                {["情节很有趣，人物也很鲜活。", "一口气看到最新章，值得推荐！"].map(x => (
                  <Text key={x} style={s.review}>
                    ★★★★★　{x}
                  </Text>
                ))}
              </ScrollView>
            ) : tab === "笔记" ? (
              <View>
                <Text style={s.filterTitle}>全书想法与划线</Text>
                <Text style={s.review}>“路很长，但他们并不孤单。”</Text>
                <Text style={s.muted}>点击可跳转至第 329 章对应段落</Text>
              </View>
            ) : (
              <ScrollView>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <View key={i} style={s.chapterRow}>
                    <Text>
                      第 {i} 章　{i === 1 ? "初入九州" : "新的旅途"}
                    </Text>
                    <Text style={s.meta}>{i === 1 ? "已读1%" : "07-18"}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </>
        )}
      </View>
    </Modal>
  );
}
