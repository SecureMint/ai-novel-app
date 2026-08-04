// 后端数据驱动的横向分页榜单与无限双列瀑布流。
import React, { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, PanResponder, ScrollView, StyleSheet, Text, View } from "react-native";
import { type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";

type HorizontalPagedListProps<T> = {
  data: T[];
  pageSize?: number;
  getKey: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => React.ReactNode;
};

/**
 * 将任意后端数组按固定数量切成横向页面。
 * 数据多于单页容量时可以左右滑动，并显示当前页位置。
 */
export function HorizontalPagedList<T>({
  data,
  pageSize = 8,
  getKey,
  renderItem,
}: HorizontalPagedListProps<T>) {
  const [pageWidth, setPageWidth] = useState(0);
  const [activePage, setActivePage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const pages = useMemo(() => {
    const result: T[][] = [];
    for (let index = 0; index < data.length; index += pageSize) {
      result.push(data.slice(index, index + pageSize));
    }
    return result;
  }, [data, pageSize]);

  const visiblePage = Math.min(activePage, Math.max(0, pages.length - 1));
  const scrollToPage = useCallback(
    (page: number) => {
      const nextPage = Math.max(0, Math.min(page, pages.length - 1));
      setActivePage(nextPage);
      scrollRef.current?.scrollTo({ x: nextPage * pageWidth, animated: true });
    },
    [pageWidth, pages.length],
  );
  const panResponder = useMemo(() => {
    const shouldCaptureHorizontalMove = (_: unknown, gesture: { dx: number; dy: number }) =>
      pages.length > 1 && Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy);
    return PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: shouldCaptureHorizontalMove,
      onMoveShouldSetPanResponderCapture: shouldCaptureHorizontalMove,
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx < -40 || gesture.vx < -0.35) {
          scrollToPage(visiblePage + 1);
        } else if (gesture.dx > 40 || gesture.vx > 0.35) {
          scrollToPage(visiblePage - 1);
        } else {
          scrollToPage(visiblePage);
        }
      },
      onPanResponderTerminate: () => scrollToPage(visiblePage),
    });
  }, [pages.length, scrollToPage, visiblePage]);

  return (
    <View
      {...panResponder.panHandlers}
      onLayout={event => setPageWidth(Math.round(event.nativeEvent.layout.width))}
      style={styles.horizontalViewport}
    >
      <ScrollView
        ref={scrollRef}
        accessibilityLabel="横向书籍榜单"
        horizontal
        pagingEnabled
        nestedScrollEnabled
        scrollEnabled={pages.length > 1}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        onScroll={event => {
          if (!pageWidth) return;
          const nextPage = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
          if (nextPage !== activePage) setActivePage(nextPage);
        }}
        onMomentumScrollEnd={event => {
          if (!pageWidth) return;
          setActivePage(Math.round(event.nativeEvent.contentOffset.x / pageWidth));
        }}
      >
        {pages.map((page, pageIndex) => (
          <View
            key={`page-${pageIndex}`}
            style={[styles.horizontalPage, pageWidth > 0 && { width: pageWidth }]}
          >
            {page.map((item, itemIndex) => {
              const absoluteIndex = pageIndex * pageSize + itemIndex;
              return (
                <React.Fragment key={getKey(item, absoluteIndex)}>
                  {renderItem(item, absoluteIndex)}
                </React.Fragment>
              );
            })}
          </View>
        ))}
      </ScrollView>
      {pages.length > 1 && (
        <View style={styles.pageDots}>
          {pages.map((_, index) => (
            <View
              key={index}
              style={[styles.pageDot, index === visiblePage && styles.pageDotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

type InfiniteMasonryProps<T> = {
  data: T[];
  getKey: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => React.ReactNode;
  loadMore: (page: number) => Promise<T[]>;
  header?: React.ReactNode;
  contentContainerStyle?: object;
};

/**
 * 双列无限瀑布流。接近底部时请求下一页；请求锁避免重复加载。
 * 调用方只需提供数据、唯一键、卡片渲染函数和分页请求函数。
 */
export function InfiniteMasonry<T>({
  data,
  getKey,
  renderItem,
  loadMore,
  header,
  contentContainerStyle,
}: InfiniteMasonryProps<T>) {
  const [items, setItems] = useState(data);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);

  const requestNextPage = async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const nextItems = await loadMore(nextPage);
      setItems(current => [...current, ...nextItems]);
      setPage(nextPage);
      setHasMore(nextItems.length > 0);
    } finally {
      loadingRef.current = false;
      setLoadingMore(false);
    }
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceToBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
    if (distanceToBottom < 360) void requestNextPage();
  };

  const leftColumn = items.filter((_, index) => index % 2 === 0);
  const rightColumn = items.filter((_, index) => index % 2 === 1);

  return (
    <ScrollView
      accessibilityLabel="无限瀑布流"
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={80}
      onScroll={onScroll}
      contentContainerStyle={contentContainerStyle}
    >
      {header}
      <View style={styles.masonryColumns}>
        <View style={styles.masonryColumn}>
          {leftColumn.map((item, columnIndex) => {
            const index = columnIndex * 2;
            return (
              <React.Fragment key={getKey(item, index)}>{renderItem(item, index)}</React.Fragment>
            );
          })}
        </View>
        <View style={styles.masonryColumn}>
          {rightColumn.map((item, columnIndex) => {
            const index = columnIndex * 2 + 1;
            return (
              <React.Fragment key={getKey(item, index)}>{renderItem(item, index)}</React.Fragment>
            );
          })}
        </View>
      </View>
      <View style={styles.loadingMore}>
        {loadingMore ? (
          <ActivityIndicator color="#ff6b2c" />
        ) : (
          <Text style={styles.loadingText}>上滑加载更多</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  horizontalViewport: { width: "100%", overflow: "hidden" },
  horizontalPage: { flexDirection: "row", flexWrap: "wrap" },
  pageDots: { height: 12, flexDirection: "row", justifyContent: "center", gap: 5 },
  pageDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#dedede" },
  pageDotActive: { width: 12, backgroundColor: "#db9b55" },
  masonryColumns: { flexDirection: "row", gap: 8, marginTop: 9 },
  masonryColumn: { flex: 1, gap: 9 },
  loadingMore: { height: 54, alignItems: "center", justifyContent: "center" },
  loadingText: { color: "#aaa", fontSize: 12 },
});
