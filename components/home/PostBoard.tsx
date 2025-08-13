import { useState } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";
import Post from "../Post";
import { HomeHeader } from "./HomeHeader";
import { usePostBoard } from "./_hooks/usePostBoard";

export const PostBoard = () => {
  const [pageSize, setPageSize] = useState<number>(10);
  const { isLoading, postItems, onRefresh, onEndReached } = usePostBoard();

  const Header = <HomeHeader pageSize={pageSize} setPageSize={setPageSize} />;

  const Footer = (
    <View style={{ padding: 16 }}>
      {isLoading && (
        <View style={{ paddingVertical: 8 }}>
          <ActivityIndicator />
        </View>
      )}
    </View>
  );

  return (
    <FlatList
      data={postItems}
      renderItem={({ item }) => (
        <View style={{ paddingHorizontal: 16 }}>
          <Post
            id={item.postId}
            title={item.title}
            content={item.content}
            createdAt={item.createdAt}
            images={item.images}
            nickname={item.nickname}
            profileImageURL={item.profileImageURL}
          />
        </View>
      )}
      keyExtractor={(item) => item.postId}
      ListHeaderComponent={Header}
      ListFooterComponent={Footer}
      contentContainerStyle={{ paddingBottom: 120, gap: 0 }}
      refreshing={isLoading}
      onRefresh={onRefresh}
      onEndReachedThreshold={0.5}
      onEndReached={onEndReached}
    />
  );
};
