import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, TextInput, Alert, Modal, SafeAreaView, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { EllipsisVertical, Edit, Trash2, Star, User as UserIcon, Heart, StarHalf } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import BackButton from "../../layouts/BackButton";

// 🔥 백엔드 서버 주소 (에뮬레이터 권장)
const BACKEND_URL = "http://10.0.2.2:8082";

// 🔥 웹 버전의 로컬/외부/상대경로 완벽 대응 로직 이식
const getSafeImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
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
    const { id } = useLocalSearchParams();

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
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });

                setItem(response.data);
                setLikeCount(response.data.likeCount || 0);

                if (token) {
                    try {
                        const statusRes = await axios.get(`${BACKEND_URL}/api/likes/${id}/status`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        setLiked(statusRes.data);
                    } catch (e) { /* ignore */ }
                }

                const commentsRes = await axios.get(`${BACKEND_URL}/api/posts/${id}/comments`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
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

    // 🔥 웹 버전의 예외 처리(빈 값 방지, 로그인 여부 확인) 로직 이식
    const handleCommentSubmit = async () => {
        if (!commentContent.trim()) {
            Alert.alert("알림", "댓글 내용을 입력해주세요.");
            return;
        }

        try {
            const token = await AsyncStorage.getItem("jwtToken");
            if (!token) {
                Alert.alert("알림", "로그인이 필요합니다.");
                return;
            }

            const currentUserId = await AsyncStorage.getItem("userId");

            await axios.post(`${BACKEND_URL}/api/posts/${id}/comments`, {
                userId: currentUserId,
                commentContents: commentContent
            }, { headers: { Authorization: `Bearer ${token}` } });

            setCommentContent("");
            Alert.alert("알림", "댓글이 등록되었습니다.");

            const commentsRes = await axios.get(`${BACKEND_URL}/api/posts/${id}/comments`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setComments(commentsRes.data);
        } catch (error) {
            console.error("댓글 등록 실패:", error);
            Alert.alert("실패", "댓글 등록 중 오류가 발생했습니다.");
        }
    };

    // 🔥 웹 버전의 명시적인 로그인 여부 확인 로직 이식
    const onLikeClick = async () => {
        try {
            const token = await AsyncStorage.getItem("jwtToken");
            if (!token) {
                Alert.alert("알림", "로그인이 필요합니다.");
                return;
            }

            const response = await axios.post(`${BACKEND_URL}/api/likes/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLiked(response.data.liked);
            setLikeCount(response.data.count);
        } catch (error) {
            console.error("좋아요 오류:", error);
            Alert.alert("오류", "오류가 발생했습니다.");
        }
    };

    const handleDelete = async () => {
        try {
            const token = await AsyncStorage.getItem("jwtToken");
            await axios.delete(`${BACKEND_URL}/api/posts/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            Alert.alert("알림", "삭제되었습니다.");
            setShowDeleteModal(false);
            router.push("/community");
        } catch (error) {
            console.error("삭제 실패:", error);
            Alert.alert("실패", "삭제 권한이 없거나 오류가 발생했습니다.");
        }
    };

// 157번 줄 근처를 이렇게 수정하세요
    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    if (!item) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="text-gray-500 font-bold">데이터를 찾을 수 없습니다.</Text>
            </View>
        );
    }

    const isReview = (item?.rating && item.rating > 0);

    const renderStars = (score) => {
        if (!score) return null;
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
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

                {/* 1. 상단 헤더 섹션 */}
                <View className="flex-row justify-between items-center py-4 px-4 bg-white border-b border-gray-100">
                        <BackButton />
                    <Text className="text-lg font-extrabold text-gray-900 flex-1 text-center" numberOfLines={1}>
                        {item.title}
                    </Text>
                    <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)} className="p-1">
                        <EllipsisVertical size={22} color="#1f2937" />
                    </TouchableOpacity>
                </View>

                {/* 2. 게시글 메인 컨테이너 */}
                <View className="bg-white m-4 p-5 rounded-3xl shadow-sm border border-gray-100">
                    {/* 작성자 섹션 */}
                    <View className="flex-row justify-between items-center mb-6">
                        <View className="flex-row items-center">
                            <View className="mr-4">
                                <ProfileAvatar imagePath={item.profileImage} nickname={item.nickname} />
                            </View>
                            <View className="flex-col justify-center">
                                <Text className="font-bold text-gray-900 text-[16px] mb-1">
                                    {item.nickname || "익명"}
                                </Text>
                                <Text className="text-xs text-gray-400">
                                    {item.postdate || "방금 전"}
                                </Text>
                            </View>
                        </View>
                        {isReview ? renderStars(item.rating) : null}
                    </View>

                    {/* 이미지 */}
                    {item.imagePath && (
                        <Image
                            source={{ uri: getSafeImageUrl(item.imagePath) }}
                            className="w-full h-72 rounded-2xl mb-5"
                            resizeMode="cover"
                        />
                    )}

                    {/* 본문 */}
                    <Text className="text-gray-700 leading-7 text-[16px]">
                        {item.postContents || item.comment || item.content || ""}
                    </Text>

                    {/* 좋아요 섹션 */}
                    <View className="flex-row items-center mt-6 pt-5 border-t border-gray-50">
                        <TouchableOpacity onPress={onLikeClick} className="flex-row items-center">
                            <Heart
                                size={24}
                                color={liked ? "#ef4444" : "#9ca3af"}
                                fill={liked ? "#ef4444" : "transparent"}
                            />
                            <Text className={`ml-2 font-semibold ${liked ? "text-red-500" : "text-gray-600"}`}>
                                {likeCount}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 6. 댓글 영역 */}
                <View className="px-4 mb-10">
                    <Text className="text-base font-bold text-gray-900 mb-4">댓글 {comments.length}개</Text>

                    {/* 댓글 입력창 */}
                    <View className="flex-row items-center mb-6">
                        <TextInput
                            className="w-[77%] bg-white border border-gray-200 rounded-2xl px-4 py-3.5"
                            placeholder="따뜻한 댓글을 남겨보세요!"
                            placeholderTextColor="#9ca3af"
                            value={commentContent}
                            onChangeText={setCommentContent}
                        />
                        <TouchableOpacity
                            onPress={handleCommentSubmit}
                            className="ml-auto bg-indigo-600 px-6 h-[50px] rounded-2xl justify-center items-center shadow-indigo-200 shadow-lg"
                        >
                            <Text className="text-white font-bold">등록</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 댓글 리스트 */}
                    <View>
                        {comments.length === 0 ? (
                            <Text className="text-gray-400 text-center py-10">아직 댓글이 없습니다.</Text>
                        ) : (
                            comments.map((comment) => (
                                <View key={comment.commentId} className="flex-row bg-white p-4 rounded-2xl border border-gray-100 mb-4">
                                    {/* 아바타 영역: mr-4로 텍스트와 간격 확보 */}
                                    <View className="mr-4">
                                        <ProfileAvatar imagePath={comment.profileImage} nickname={comment.nickname} size="w-10 h-10" />
                                    </View>

                                    {/* 내용 영역 */}
                                    <View className="flex-1">
                                        <View className="flex-row justify-between items-center mb-1.5">
                                            <Text className="font-bold text-gray-800 text-sm">{comment.nickname}</Text>
                                            <Text className="text-[10px] text-gray-400">{comment.commentDate}</Text>
                                        </View>
                                        <Text className="text-gray-600 text-[14px] leading-5">{comment.commentContents}</Text>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                </View>
            </ScrollView>

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
    );
}