import "./global.css";

import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView, View, useWindowDimensions } from "react-native";
import { StatusBar } from "expo-status-bar";

import { LoginSheet } from "./src/components/common";
import { TabBar, ToastBanner } from "./src/components/navigation/AppNavigation";
import { books } from "./src/data/books";
import { api } from "./src/services/api";
import { initOffline } from "./src/services/offline";
import {
  AiSearchScreen,
  CategoryScreen,
  SearchScreen,
} from "./src/screens/discovery/DiscoveryScreens";
import {
  BenefitsScreen,
  ShelfFilterScreen,
  ShelfScreen,
} from "./src/screens/library/LibraryScreens";
import { ProfileScreen, HistoryScreen, UserScreen } from "./src/screens/profile/ProfileScreens";
import { ReaderScreen } from "./src/screens/reader/ReaderScreen";
import { BookDetailScreen } from "./src/screens/BookDetailScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { ShortsScreen } from "./src/screens/ShortsScreen";
import { appStyles as styles } from "./src/styles/appStyles";
import { type Book, type Route } from "./src/types";

/**
 * 应用入口只负责跨页面状态和路由装配。
 * 页面 UI、局部状态与领域逻辑均位于 src/screens 下。
 */
export default function App() {
  const { width } = useWindowDimensions();
  const desktop = width >= 768;

  const [route, setRoute] = useState<Route>("home");
  const [, setHistory] = useState<Route[]>([]);
  const [readerBook, setReaderBook] = useState(books[0]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginVisible, setLoginVisible] = useState(false);
  const [toastKey, setToastKey] = useState(0);
  const pendingAction = useRef<null | (() => void)>(null);

  useEffect(() => {
    initOffline().catch(() => {});
  }, []);

  const go = (next: Route) => {
    setHistory(previous => [...previous, route]);
    setRoute(next);
  };

  const back = () => {
    setHistory(previous => {
      const nextHistory = [...previous];
      setRoute(nextHistory.pop() || "home");
      return nextHistory;
    });
  };

  // 需要账号的动作在登录成功后自动继续。
  const guard = (action: () => void) => {
    if (loggedIn) {
      action();
      return;
    }
    pendingAction.current = action;
    setLoginVisible(true);
  };

  const openBook = (book: Book) => {
    setReaderBook(book);
    go("detail");
  };

  const showUnhandledToast = (_featureName: string) => {
    setToastKey(key => key + 1);
  };

  const screen = renderScreen({
    route,
    readerBook,
    go,
    back,
    guard,
    openBook,
    showUnhandledToast,
  });

  const primaryRoute = ["home", "shorts", "benefits", "shelf", "profile"].includes(route);

  return (
    <View style={styles.appViewport}>
      <SafeAreaView style={[styles.appShell, desktop && styles.desktopShell]}>
        <StatusBar style="dark" />
        <View style={{ flex: 1 }}>{screen}</View>
        {primaryRoute && <TabBar route={route} go={setRoute} />}
        <LoginSheet
          visible={loginVisible}
          onClose={() => setLoginVisible(false)}
          onSuccess={() => {
            setLoggedIn(true);
            setLoginVisible(false);
            const action = pendingAction.current;
            pendingAction.current = null;
            action?.();
          }}
        />
        <ToastBanner trigger={toastKey} />
      </SafeAreaView>
    </View>
  );
}

type ScreenContext = {
  route: Route;
  readerBook: Book;
  go: (route: Route) => void;
  back: () => void;
  guard: (action: () => void) => void;
  openBook: (book: Book) => void;
  showUnhandledToast: (featureName: string) => void;
};

/** 集中声明路由到页面的映射，避免入口 JSX 出现超长三元表达式。 */
function renderScreen(context: ScreenContext) {
  const { route, readerBook, go, back, guard, openBook, showUnhandledToast } = context;

  switch (route) {
    case "home":
      return <HomeScreen go={go} openBook={openBook} onUnhandled={showUnhandledToast} />;
    case "shorts":
      return <ShortsScreen openService={showUnhandledToast} />;
    case "category":
      return <CategoryScreen back={back} />;
    case "search":
      return <SearchScreen back={back} go={go} open={openBook} />;
    case "ai":
      return <AiSearchScreen back={back} open={openBook} />;
    case "benefits":
      return <BenefitsScreen guard={guard} />;
    case "shelf":
      return <ShelfScreen go={go} open={openBook} guard={guard} />;
    case "filter":
      return <ShelfFilterScreen back={back} />;
    case "profile":
      return <ProfileScreen go={go} openService={showUnhandledToast} />;
    case "history":
      return <HistoryScreen back={back} open={openBook} guard={guard} />;
    case "user":
      return <UserScreen back={back} />;
    case "detail":
      return (
        <BookDetailScreen
          book={readerBook}
          onBack={back}
          onRead={() => go("reader")}
          onAddShelf={() => guard(() => api.addShelf(readerBook.id).catch(() => {}))}
        />
      );
    case "reader":
      return <ReaderScreen book={readerBook} back={back} guard={guard} />;
  }
}
