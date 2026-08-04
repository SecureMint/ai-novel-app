// 应用级导航与全局反馈组件。
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { type Route } from "../../types";
import { appStyles as s } from "../../styles/appStyles";

const tabs: { route: Route; label: string; icon: string }[] = [
  { route: "home", label: "书城", icon: "⌂" },
  { route: "shorts", label: "短剧", icon: "▷" },
  { route: "benefits", label: "福利", icon: "◈" },
  { route: "shelf", label: "书架", icon: "▤" },
  { route: "profile", label: "我的", icon: "◉" },
];

export function ToastBanner({ trigger }: { trigger: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const offset = useRef(new Animated.Value(8)).current;
  useEffect(() => {
    if (!trigger) return;
    opacity.stopAnimation();
    offset.stopAnimation();
    opacity.setValue(0);
    offset.setValue(8);
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(offset, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1350),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(offset, {
          toValue: -5,
          duration: 180,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [trigger, opacity, offset]);
  return (
    <Animated.View
      pointerEvents="none"
      style={[s.toast, { opacity, transform: [{ translateY: offset }] }]}
    >
      <Text style={s.toastText}>该功能暂未开发</Text>
    </Animated.View>
  );
}

export function TabBar({ route, go }: { route: Route; go: (r: Route) => void }) {
  return (
    <View style={s.tabbar}>
      {tabs.map(t => (
        <Pressable key={t.route} onPress={() => go(t.route)} style={s.tab}>
          <Text style={[s.tabIcon, route === t.route && s.tabActive]}>{t.icon}</Text>
          <Text style={[s.tabText, route === t.route && s.tabActive]}>{t.label}</Text>
          {t.route === "profile" && <View style={s.dot} />}
        </Pressable>
      ))}
    </View>
  );
}
