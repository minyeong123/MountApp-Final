import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, TextInput, Alert, Modal, SafeAreaView, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router"; // Expo Router용으로 변경
import { EllipsisVertical, Edit, Trash2, Star, User as UserIcon, Heart } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// 🔥 백엔드 서버 주소 (Community와 동일하게 10.0.2.2 권장)
const BACKEND_URL = "http://10.0.2.2:8082";

const getSafeImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const filename = path.split('\\').pop().split('/').pop();
    return `${BACKEND_URL}/uploads/${filename}`;
};

const ProfileAvatar = ({ imagePath, nickname, size = "w-11 h-11" }) => {
    const [imgError, setImgError] = useState(false);
    return (
        <View className={`${size} rounded-full bg-gray-200 overflow-hidden border border-gray-200 items-center justify-center`}>
            {imagePath && !imgError ? (
                <Image
                    source={{ uri: getSafeImageUrl(imagePath) }}
                    className="w-full h-full"
                    onError={() => setImgError(true)}
                />
            ) : (
                <UserIcon size={20} color="#9ca3af" />
            )}
        </View>
    );
};

export default function DetailPage() {
    const router = useRouter();
    const { id } = useLocalSearchParams(); // Expo Router에서 파라미터 가져오기

    const [item, setItem] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentContent, setCommentContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [likeCount, setLikeCount] = useState(0);
    const [liked, setLiked] = useState(false);

    const [menuOpen, setMenuOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!id) return;
            try {
                const token = await AsyncStorage.getItem("jwtToken");
                const response = await axios.get(`${BACKEND_URL}/api/posts/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setItem(response.data);
                setLikeCount(response.data.likeCount || 0);

                if (token) {
                    const statusRes = await axios.get(`${BACKEND_URL}/api/likes/${id}/status`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setLiked(statusRes.data);
                }

                const commentsRes = await axios.get(`${BACKEND_URL}/api/posts/${id}/comments`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setComments(commentsRes.data);
            } catch (error) {
                console.error("로딩 에러:", error);
                Alert.alert("오류", "데이터 로딩 중 문제가 발생했습니다.");
                router.back();
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const handleCommentSubmit = async () => {
        if (!commentContent.trim()) return;
        try {
            const token = await AsyncStorage.getItem("jwtToken");
            const currentUserId = await AsyncStorage.getItem("userId");

            await axios.post(`${BACKEND_URL}/api/posts/${id}/comments`, {
                userId: currentUserId,
                commentContents: commentContent
            }, { headers: { Authorization: `Bearer ${token}` } });

            setCommentContent("");
            const commentsRes = await axios.get(`${BACKEND_URL}/api/posts/${id}/comments`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setComments(commentsRes.data);
        } catch (error) {
            Alert.alert("실패", "댓글 등록에 실패했습니다.");
        }
    };

    const onLikeClick = async () => {
        try {
            const token = await AsyncStorage.getItem("jwtToken");
            const response = await axios.post(`${BACKEND_URL}/api/likes/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLiked(response.data.liked);
            setLikeCount(response.data.count);
        } catch (error) {
            Alert.alert("오류", "로그인이 필요합니다.");
        }
    };

    const handleDelete = async () => {
        try {
            const token = await AsyncStorage.getItem("jwtToken");
            await axios.delete(`${BACKEND_URL}/api/posts/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setShowDeleteModal(false);
            router.back();
        } catch (error) {
            Alert.alert("실패", "삭제 권한이 없습니다.");
        }
    };

    if (loading) return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#6366f1" /></View>;
    if (!item) return null;

    const isReview = (item?.rating && item.rating > 0);

    const renderStars = (score) => {
        const fullStars = Math.floor(score);
        const hasHalf = score % 1 !== 0;
        return (
            <View className="flex-row items-center">
                {Array(5).fill().map((_, i) => (
                    <Star
                        key={i}
                        size={14}
                        color={i < fullStars || (i === fullStars && hasHalf) ? "#fbbf24" : "#d1d5db"}
                        fill={i < fullStars || (i === fullStars && hasHalf) ? "#fbbf24" : "transparent"}
                    />
                ))}
                <Text className="ml-1 text-sm font-bold text-gray-400">{Number(score).toFixed(1)}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                {/* 1. 상단 헤더 섹션 */}
                <View className="flex-row justify-between items-center py-4 border-b border-gray-100">
                    <TouchableOpacity onPress={() => router.back()} className="p-1">
                        <Text className="text-gray-600 font-bold">뒤로</Text>
                    </TouchableOpacity>
                    <Text className="text-lg font-bold flex-1 text-center" numberOfLines={1}>
                        {item.title}
                    </Text>
                    <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)} className="p-1">
                        <EllipsisVertical size={20} color="#374151" />
                    </TouchableOpacity>
                </View>

                {/* 2. 수정/삭제 팝업 메뉴 */}
                {menuOpen && (
                    <View className="absolute right-4 top-14 bg-white shadow-xl border border-gray-100 rounded-xl z-50 py-2 w-32">
                        <TouchableOpacity
                            className="px-4 py-3 border-b border-gray-50 flex-row items-center space-x-2"
                            onPress={() => {
                                setMenuOpen(false);
                                router.push({ pathname: "/community/newpost", params: { isEdit: "true", postData: JSON.stringify(item) } });
                            }}
                        >
                            <Edit size={16} color="#4b5563" />
                            <Text className="text-gray-700">수정</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="px-4 py-3 flex-row items-center space-x-2"
                            onPress={() => { setMenuOpen(false); setShowDeleteModal(true); }}
                        >
                            <Trash2 size={16} color="#ef4444" />
                            <Text className="text-red-500">삭제</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* 3. 작성자 및 별점 정보 (여기가 191번 줄 근처입니다) */}
                <View className="flex-row justify-between items-center mt-6">
                    <View className="flex-row items-center space-x-3">
                        <ProfileAvatar imagePath={item.profileImage} nickname={item.nickname} />
                        <View>
                            <Text className="font-bold text-gray-800">{item.nickname || "익명"}</Text>
                            <Text className="text-xs text-gray-500">{item.postdate || "날짜 정보 없음"}</Text>
                        </View>
                    </View>
                    {isReview ? renderStars(item.rating) : null}
                </View>

                {/* 4. 이미지 및 본문 */}
                {item.imagePath ? (
                    <Image
                        source={{ uri: getSafeImageUrl(item.imagePath) }}
                        className="w-full h-64 rounded-2xl mt-5"
                        resizeMode="cover"
                    />
                ) : null}

                <View className="mt-5">
                    <Text className="text-gray-800 leading-6 text-[15px]">
                        {item.postContents || item.comment || item.content || ""}
                    </Text>
                </View>

                {/* 5. 좋아요 버튼 */}
                <View className="flex-row items-center mt-6 space-x-2">
                    <TouchableOpacity onPress={onLikeClick}>
                        <Heart size={28} color={liked ? "#ef4444" : "#374151"} fill={liked ? "#ef4444" : "transparent"} />
                    </TouchableOpacity>
                    <Text className="font-bold text-gray-800">좋아요 {likeCount}개</Text>
                </View>

                {/* 6. 댓글 영역 */}
                <View className="mt-10 mb-20">
                    <Text className="text-lg font-bold mb-4">댓글 ({comments.length})</Text>

                    <View className="flex-row space-x-2 mb-6">
                        <TextInput
                            className="flex-1 bg-gray-100 rounded-xl px-4 py-3"
                            placeholder="댓글을 입력하세요..."
                            value={commentContent}
                            onChangeText={setCommentContent}
                        />
                        <TouchableOpacity
                            onPress={handleCommentSubmit}
                            className="bg-indigo-500 px-5 rounded-xl justify-center"
                        >
                            <Text className="text-white font-bold">등록</Text>
                        </TouchableOpacity>
                    </View>

                    {comments.map((comment) => (
                        <View key={comment.commentId} className="flex-row space-x-3 mb-5 bg-gray-50 p-4 rounded-2xl">
                            <ProfileAvatar imagePath={comment.profileImage} nickname={comment.nickname} size="w-10 h-10" />
                            <View className="flex-1">
                                <View className="flex-row justify-between items-center mb-1">
                                    <Text className="font-bold text-gray-900 text-sm">{comment.nickname}</Text>
                                    <Text className="text-[10px] text-gray-400">{comment.commentDate}</Text>
                                </View>
                                <Text className="text-gray-600 text-[14px] leading-5">{comment.commentContents}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* 삭제 확인 모달은 ScrollView 밖에 두는 것이 좋습니다 */}
            <Modal visible={showDeleteModal} transparent animationType="fade">
                <View className="flex-1 bg-black/50 justify-center items-center px-10">
                    <View className="bg-white p-6 rounded-2xl w-full">
                        <Text className="text-lg font-bold text-center mb-6">정말 삭제하시겠습니까?</Text>
                        <View className="flex-row space-x-3">
                            <TouchableOpacity className="flex-1 bg-gray-100 py-3 rounded-xl items-center" onPress={() => setShowDeleteModal(false)}>
                                <Text className="font-bold text-gray-600">취소</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-1 bg-red-500 py-3 rounded-xl items-center" onPress={handleDelete}>
                                <Text className="font-bold text-white">삭제</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );}