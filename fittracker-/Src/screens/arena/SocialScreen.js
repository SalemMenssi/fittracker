import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, Image,
  TextInput, ActivityIndicator, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { getAllPosts, addPost, toggleLike } from "../../services/SocialService";
import { getCurrentUser } from "../../services/AuthService";
import { useIsFocused } from "@react-navigation/native";

const SEED_FRIENDS = [
  { id: "f1", name: "Sara M.",  avatar: "https://randomuser.me/api/portraits/women/44.jpg", status: "online" },
  { id: "f2", name: "Lina K.",  avatar: "https://randomuser.me/api/portraits/women/22.jpg", status: "online" },
  { id: "f3", name: "Amira B.", avatar: "https://randomuser.me/api/portraits/women/55.jpg", status: "offline" },
  { id: "f4", name: "Yasmine",  avatar: "https://randomuser.me/api/portraits/women/33.jpg", status: "online" },
];

export default function SocialScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [posts, setPosts]         = useState([]);
  const [user, setUser]           = useState(null);
  const [postText, setPostText]   = useState("");
  const [postImage, setPostImage] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, u] = await Promise.all([getAllPosts(), getCurrentUser()]);
        setPosts(p);
        setUser(u);
      } finally {
        setLoading(false);
      }
    };
    if (isFocused) load();
  }, [isFocused]);

  const handleLike = async (postId) => {
    if (!user) return;
    const updated = await toggleLike(postId);
    // Since toggleLike now returns the updated post, we need to refresh the whole list
    // or update just that post in the state. 
    // To match current logic simply, let's refresh all posts.
    const allPosts = await getAllPosts();
    setPosts(allPosts);
  };

  const pickPostImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow access to your photo library.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [16, 9], quality: 0.7,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setPostImage(result.assets[0].uri);
    }
  };

  const handlePublish = async () => {
    if (!postText.trim()) return;
    setPublishing(true);
    try {
      await addPost({ text: postText.trim(), image: postImage });
      const updated = await getAllPosts();
      setPosts(updated);
      setPostText("");
      setPostImage(null);
    } catch (err) {
      Alert.alert("Error", "Could not publish post.");
    } finally {
      setPublishing(false);
    }
  };

  const isLikedByMe = (post) => user && (post.likes || []).includes(user._id);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#00c2c2" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back-outline" size={26} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Social</Text>
        <TouchableOpacity>
          <Ionicons name="person-add-outline" size={24} color="#00c2c2" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Friends Online */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Friends</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            {SEED_FRIENDS.map((f) => (
              <TouchableOpacity key={f.id} style={styles.friendItem}>
                <View style={styles.friendAvatarWrapper}>
                  <Image source={{ uri: f.avatar }} style={styles.friendAvatar} />
                  <View style={[styles.statusDot, { backgroundColor: f.status === "online" ? "#2ecc71" : "#ccc" }]} />
                </View>
                <Text style={styles.friendName}>{f.name.split(" ")[0]}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Compose Box */}
        <View style={styles.card}>
          <View style={styles.shareRow}>
            <Image
              source={{ uri: user?.avatar || "https://randomuser.me/api/portraits/men/32.jpg" }}
              style={styles.shareAvatar}
            />
            <TextInput
              style={styles.shareInput}
              placeholder="Share your progress..."
              placeholderTextColor="#aaa"
              value={postText}
              onChangeText={setPostText}
              multiline
            />
          </View>

          {/* Selected image preview */}
          {postImage && (
            <View style={{ position: "relative", marginBottom: 10 }}>
              <Image source={{ uri: postImage }} style={styles.previewImage} />
              <TouchableOpacity style={styles.removeImage} onPress={() => setPostImage(null)}>
                <Ionicons name="close-circle" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.shareActions}>
            <TouchableOpacity style={styles.shareActionBtn} onPress={pickPostImage}>
              <Ionicons name="image-outline" size={20} color="#00c2c2" />
              <Text style={styles.shareActionText}>Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareActionBtn}>
              <Ionicons name="barbell-outline" size={20} color="#ff8c42" />
              <Text style={styles.shareActionText}>Workout</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.postBtn, postText.length > 0 && styles.postBtnActive]}
              disabled={postText.length === 0 || publishing}
              onPress={handlePublish}
            >
              {publishing
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={[styles.postBtnText, postText.length > 0 && styles.postBtnTextActive]}>Post</Text>
              }
            </TouchableOpacity>
          </View>
        </View>

        {/* Feed */}
        {posts.map((post) => {
          const liked = isLikedByMe(post);
          const hasSeedId = typeof post.id === "string" && post.id.startsWith("seed");
          const likeCount = (post.likes || []).length + (hasSeedId ? (
            post.id === "seed1" ? 24 : post.id === "seed2" ? 18 : 41
          ) : 0);

          return (
            <View key={post.id || Math.random().toString()} style={styles.card}>
              <View style={styles.postHeader}>
                <Image source={{ uri: post.avatar }} style={styles.postAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.postName}>{post.name}</Text>
                  <Text style={styles.postTime}>{post.time}</Text>
                </View>
                <Ionicons name="ellipsis-horizontal" size={20} color="#ccc" />
              </View>
              <Text style={styles.postText}>{post.text}</Text>
              {post.image && (
                <Image source={{ uri: post.image }} style={styles.postImage} />
              )}
              <View style={styles.postActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(post.id)}>
                  <Ionicons
                    name={liked ? "heart" : "heart-outline"}
                    size={20}
                    color={liked ? "#e74c3c" : "#888"}
                  />
                  <Text style={[styles.actionText, liked && { color: "#e74c3c" }]}>
                    {likeCount + (liked ? 1 : 0)}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons name="chatbubble-outline" size={20} color="#888" />
                  <Text style={styles.actionText}>{post.comments}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons name="share-social-outline" size={20} color="#888" />
                  <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6f8" },
  centered:  { justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14, backgroundColor: "#fff" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#111" },
  card: { backgroundColor: "#fff", marginHorizontal: 20, borderRadius: 20, padding: 18, marginBottom: 12, marginTop: 4, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#111" },
  friendItem: { alignItems: "center", marginRight: 16 },
  friendAvatarWrapper: { position: "relative" },
  friendAvatar: { width: 54, height: 54, borderRadius: 27, borderWidth: 2, borderColor: "#00c2c2" },
  statusDot: { position: "absolute", bottom: 1, right: 1, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: "#fff" },
  friendName: { fontSize: 11, color: "#555", marginTop: 6, fontWeight: "500" },
  shareRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 12 },
  shareAvatar: { width: 40, height: 40, borderRadius: 20 },
  shareInput: { flex: 1, fontSize: 14, color: "#111", minHeight: 60, backgroundColor: "#f5f6f8", borderRadius: 12, padding: 12 },
  previewImage: { width: "100%", height: 160, borderRadius: 12 },
  removeImage: { position: "absolute", top: 8, right: 8 },
  shareActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  shareActionBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  shareActionText: { fontSize: 13, color: "#555", fontWeight: "500" },
  postBtn: { marginLeft: "auto", backgroundColor: "#e0e0e0", paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  postBtnActive: { backgroundColor: "#00c2c2" },
  postBtnText: { fontSize: 13, color: "#aaa", fontWeight: "600" },
  postBtnTextActive: { color: "#fff" },
  postHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 10 },
  postAvatar: { width: 44, height: 44, borderRadius: 22 },
  postName: { fontSize: 15, fontWeight: "600", color: "#111" },
  postTime: { fontSize: 12, color: "#aaa" },
  postText: { fontSize: 14, color: "#333", lineHeight: 20, marginBottom: 12 },
  postImage: { width: "100%", height: 180, borderRadius: 12, marginBottom: 12 },
  postActions: { flexDirection: "row", gap: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#f5f5f5" },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionText: { fontSize: 13, color: "#888", fontWeight: "500" },
});