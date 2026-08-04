import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
export const colors = {
  orange: "#ff6b2c",
  ink: "#171717",
  muted: "#999",
  bg: "#f7f7f7",
};
export function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[s.pill, active && s.pillActive]}>
      <Text style={[s.pillText, active && { color: colors.orange }]}>{label}</Text>
    </Pressable>
  );
}
export function TruncatedText({ children, style }: { children: string; style?: any }) {
  return (
    <Text numberOfLines={2} ellipsizeMode="tail" style={style}>
      {children}
    </Text>
  );
}
export function Skeleton() {
  return (
    <View style={s.skeleton}>
      <ActivityIndicator color={colors.orange} />
    </View>
  );
}
export function TopBar({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <View style={s.top}>
      <Pressable onPress={onBack}>
        <Text style={s.back}>{onBack ? "‹" : ""}</Text>
      </Pressable>
      <Text style={s.title}>{title}</Text>
      <View style={{ minWidth: 38, alignItems: "flex-end" }}>{right}</View>
    </View>
  );
}
export function LoginSheet({
  visible,
  onClose,
  onSuccess,
}: {
  visible: boolean;
  onClose: () => void;
  onSuccess: (token: string, user: any) => void;
}) {
  const [username, setU] = React.useState("reader");
  const [password, setP] = React.useState("reader123");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const login = async () => {
    setBusy(true);
    setError("");
    try {
      const { api, setToken } = await import("../services/api");
      const r = await api.login(username, password);
      setToken(r.token);
      onSuccess(r.token, r.user);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.scrim} onPress={onClose} />
      <View style={s.sheet}>
        <View style={s.handle} />
        <Text style={s.loginTitle}>登录后继续</Text>
        <Text style={s.hint}>保存书架、签到与想法，并在多设备间同步</Text>
        <TextInput value={username} onChangeText={setU} placeholder="用户名" style={s.input} />
        <TextInput
          value={password}
          onChangeText={setP}
          secureTextEntry
          placeholder="密码（至少 6 位）"
          style={s.input}
        />
        {!!error && <Text style={s.error}>{error}</Text>}
        <Pressable onPress={login} style={s.login}>
          <Text style={s.loginText}>{busy ? "登录中…" : "登录并继续"}</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

export type FilterGroup = {
  key: string;
  title: string;
  options: string[];
};

export function FilterSheet({
  visible,
  groups,
  value,
  onChange,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  groups: FilterGroup[];
  value: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const reset = () =>
    onChange(Object.fromEntries(groups.map(group => [group.key, group.options[0]])));

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable accessibilityLabel="关闭筛选" style={s.filterScrim} onPress={onClose} />
      <View style={s.filterSheet}>
        <View style={s.filterHeader}>
          <Text style={s.filterSheetTitle}>筛选</Text>
          <Pressable accessibilityRole="button" onPress={reset} hitSlop={10}>
            <Text style={s.reset}>重置</Text>
          </Pressable>
        </View>
        {groups.map(group => (
          <View key={group.key} style={s.filterGroup}>
            <Text style={s.filterGroupTitle}>{group.title}</Text>
            <View style={s.filterOptions}>
              {group.options.map(option => {
                const active = value[group.key] === option;
                return (
                  <Pressable
                    accessibilityRole="button"
                    key={option}
                    onPress={() => onChange({ ...value, [group.key]: option })}
                    style={[s.filterOption, active && s.filterOptionActive]}
                  >
                    <Text style={[s.filterOptionText, active && s.filterOptionTextActive]}>
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
        <Pressable accessibilityRole="button" onPress={onConfirm} style={s.filterConfirm}>
          <Text style={s.filterConfirmText}>查看筛选结果</Text>
        </Pressable>
      </View>
    </Modal>
  );
}
const s = StyleSheet.create({
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#f6f6f6",
    marginRight: 7,
    marginBottom: 8,
  },
  pillActive: { backgroundColor: "#fff1eb" },
  pillText: { fontSize: 14, color: "#333" },
  skeleton: { height: 180, alignItems: "center", justifyContent: "center" },
  top: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  back: { fontSize: 34, lineHeight: 38 },
  title: { fontSize: 20, fontWeight: "700" },
  scrim: { flex: 1, backgroundColor: "rgba(0,0,0,.35)" },
  sheet: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    backgroundColor: "white",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    paddingBottom: 36,
  },
  handle: {
    width: 42,
    height: 5,
    borderRadius: 4,
    backgroundColor: "#ddd",
    alignSelf: "center",
    marginBottom: 20,
  },
  loginTitle: { fontSize: 22, fontWeight: "800" },
  hint: { color: colors.muted, marginVertical: 8 },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 14,
    padding: 14,
    marginTop: 11,
    fontSize: 15,
  },
  error: { color: "#d33", marginTop: 8 },
  login: {
    backgroundColor: colors.orange,
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    marginTop: 17,
  },
  loginText: { color: "white", fontWeight: "700", fontSize: 16 },
  filterScrim: { flex: 1, backgroundColor: "rgba(0,0,0,.28)" },
  filterSheet: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    backgroundColor: "white",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 28,
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  filterSheetTitle: { fontSize: 20, fontWeight: "800" },
  reset: { color: "#777", fontSize: 14 },
  filterGroup: { paddingTop: 17 },
  filterGroupTitle: { fontSize: 15, fontWeight: "700", marginBottom: 11 },
  filterOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterOption: {
    minWidth: 82,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#f5f5f4",
    alignItems: "center",
    justifyContent: "center",
  },
  filterOptionActive: { backgroundColor: "#fff0e9" },
  filterOptionText: { color: "#333", fontSize: 14 },
  filterOptionTextActive: { color: colors.orange, fontWeight: "700" },
  filterConfirm: {
    height: 48,
    marginTop: 22,
    borderRadius: 24,
    backgroundColor: colors.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  filterConfirmText: { color: "white", fontSize: 16, fontWeight: "800" },
});
