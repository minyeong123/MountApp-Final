import React, { useState, useCallback } from "react";
import {
    View, Text, TouchableOpacity, ScrollView,
    TextInput, Modal, Alert, Image, Platform
} from "react-native";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, usePathname } from "expo-router";
import {
    ShieldCheck, X, UserCog, MessageSquareText,
    ArrowLeft, Search, Trash2, Star, FileText, Calendar, User
} from "lucide-react-native";

const BACKEND_URL = Platform.OS === 'android' ? "http://10.0.2.2:8082" : "http://localhost:8082";

export default function AdminMode({ children }) {
    const pathname = usePathname();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentView, setCurrentView] = useState("menu");
    const [searchTerm, setSearchTerm] = useState("");

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    const [communityPosts, setCommunityPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [communityTab, setCommunityTab] = useState("all");

    // 🔥 실전 코드: 진짜 권한이 있는 사람만 버튼이 보이게 합니다.
    useFocusEffect(
        useCallback(() => {
            const checkAdmin = async () => {
                try {
                    const role = await AsyncStorage.getItem("role");
                    const safeRole = role ? String(role).trim().toUpperCase() : "";
                    setIsAdmin(safeRole === "Y" || safeRole === "ADMIN" || safeRole === "ROLE_ADMIN");
                } catch (e) {
                    setIsAdmin(false);
                }
            };
            checkAdmin();
        }, [pathname])
    );

    // 🔥 실전 코드: 귀찮은 팝업창 제거, 조용하고 완벽하게 데이터를 가져옵니다.
    const fetchUsers = async () => {
        const token = await AsyncStorage.getItem("jwtToken");
        if (!token) return;
        try {
            const response = await axios.get(`${BACKEND_URL}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data || []);
        } catch (error) {
            console.error("사용자 로딩 실패:", error);
        }
    };

    const fetchCommunityPosts = async () => {
        const token = await AsyncStorage.getItem("jwtToken");
        if (!token) return;
        try {
            const response = await axios.get(`${BACKEND_URL}/api/posts`, { headers: { Authorization: `Bearer ${token}` } });
            setCommunityPosts(response.data);
        } catch (error) { console.error("게시글 로딩 실패:", error); }
    };

    const handleUserClick = async (id) => {
        const token = await AsyncStorage.getItem("jwtToken");
        try {
            const response = await axios.get(`${BACKEND_URL}/api/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setSelectedUser(response.data);
        } catch (error) { Alert.alert("오류", "사용자 정보를 불러오지 못했습니다."); }
    };

    const handleDeleteUser = (id) => {
        Alert.alert("확인", "정말 삭제하시겠습니까?", [
            { text: "취소", style: "cancel" },
            { text: "삭제", style: "destructive", onPress: async () => {
                    const token = await AsyncStorage.getItem("jwtToken");
                    try {
                        await axios.delete(`${BACKEND_URL}/api/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                        setUsers(prev => prev.filter(user => user.id !== id));
                        setSelectedUser(null);
                        Alert.alert("알림", "삭제되었습니다.");
                    } catch (e) { Alert.alert("오류", "삭제에 실패했습니다."); }
                }}
        ]);
    };

    const handlePostClick = async (id) => {
        const token = await AsyncStorage.getItem("jwtToken");
        try {
            const response = await axios.get(`${BACKEND_URL}/api/posts/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setSelectedPost(response.data);
        } catch (error) { Alert.alert("오류", "글 내용을 불러오지 못했습니다."); }
    };

    const handleDeletePost = (id) => {
        Alert.alert("확인", "게시글을 삭제하시겠습니까?", [
            { text: "취소", style: "cancel" },
            { text: "삭제", style: "destructive", onPress: async () => {
                    const token = await AsyncStorage.getItem("jwtToken");
                    try {
                        await axios.delete(`${BACKEND_URL}/api/posts/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                        setCommunityPosts(prev => prev.filter(post => post.id !== id));
                        if (selectedPost && selectedPost.id === id) setSelectedPost(null);
                        Alert.alert("알림", "삭제되었습니다.");
                    } catch (e) { Alert.alert("오류", "삭제 권한이 없거나 오류가 발생했습니다."); }
                }}
        ]);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            setCurrentView("menu");
            setSearchTerm("");
            setCommunityTab("all");
            setSelectedUser(null);
            setSelectedPost(null);
        }, 300);
    };

    const handleBack = () => {
        if (selectedUser) setSelectedUser(null);
        else if (selectedPost) setSelectedPost(null);
        else setCurrentView("menu");
    };

    const filteredUsers = users.filter(user =>
        (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || "") ||
        (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || "") ||
        String(user.id).includes(searchTerm)
    );

    const filteredPosts = communityPosts.filter(post => {
        const isReview = post.rating > 0;
        if (communityTab === "post" && isReview) return false;
        if (communityTab === "review" && !isReview) return false;
        if (searchTerm) {
            const title = post.title?.toLowerCase() || "";
            const nickname = post.nickname?.toLowerCase() || "";
            const search = searchTerm.toLowerCase();
            return title.includes(search) || nickname.includes(search);
        }
        return true;
    });

    if (pathname === "/login" || pathname === "/join" || pathname === "/find") {
        return <>{children}</>;
    }

    return (
        <View style={{ flex: 1 }}>

            <View style={{ flex: 1 }}>
                {children}
            </View>

            {isAdmin && (
                <TouchableOpacity
                    style={{
                        position: 'absolute',
                        top: 60,
                        right: 16,
                        backgroundColor: '#ef4444',
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 20,
                        flexDirection: 'row',
                        alignItems: 'center',
                        zIndex: 999999,
                        elevation: 100,
                    }}
                    onPress={() => setIsModalOpen(true)}>
                    <ShieldCheck size={18} color="white" />
                    <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 6, fontSize: 13 }}>
                        관리자
                    </Text>
                </TouchableOpacity>
            )}

            <Modal visible={isModalOpen} animationType="fade" transparent={true} onRequestClose={handleClose}>
                <View className="flex-1 bg-black/60 justify-center items-center p-4">
                    <View className={`bg-white rounded-2xl overflow-hidden shadow-xl w-full max-w-[400px] ${currentView === 'menu' ? 'h-[340px]' : 'h-[600px]'}`}>

                        <View className="bg-red-500 p-4 flex-row justify-between items-center z-10">
                            <View className="flex-row items-center space-x-2">
                                {currentView !== "menu" ? (
                                    <TouchableOpacity onPress={handleBack} className="p-1">
                                        <ArrowLeft size={20} color="white" />
                                    </TouchableOpacity>
                                ) : <ShieldCheck size={20} color="white" />}
                                <Text className="text-white font-bold text-lg">
                                    {currentView === "menu" ? "관리자 메뉴" : currentView === "users" ? "사용자 관리" : "커뮤니티 관리"}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={handleClose} className="p-1">
                                <X size={20} color="white" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="flex-1 bg-gray-50 p-4" showsVerticalScrollIndicator={false}>
                            {currentView === "menu" && (
                                <View className="flex-col gap-4 mt-4">
                                    <TouchableOpacity
                                        onPress={() => {
                                            setCurrentView("users");
                                            fetchUsers();
                                        }}
                                        className="flex-row items-center p-4 rounded-xl border border-gray-200 bg-white shadow-sm"
                                    >
                                        <View className="bg-red-50 p-3 rounded-full mr-4">
                                            <UserCog size={24} color="#ef4444" />
                                        </View>
                                        <View>
                                            <Text className="font-bold text-gray-800 text-base">사용자 관리</Text>
                                            <Text className="text-xs text-gray-400 mt-1">회원 상세 조회 및 강제 탈퇴</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setCurrentView("community");
                                            fetchCommunityPosts();
                                        }}
                                        className="flex-row items-center p-4 rounded-xl border border-gray-200 bg-white shadow-sm"
                                    >
                                        <View className="bg-blue-50 p-3 rounded-full mr-4">
                                            <MessageSquareText size={24} color="#3b82f6" />
                                        </View>
                                        <View>
                                            <Text className="font-bold text-gray-800 text-base">커뮤니티 관리</Text>
                                            <Text className="text-xs text-gray-400 mt-1">게시글 및 리뷰 상세 관리</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {currentView === "users" && (
                                <View className="flex-col gap-3 pb-8">
                                    {!selectedUser && (
                                        <>
                                            <View className="relative flex-row items-center bg-white border border-gray-200 rounded-lg px-3 py-1 mb-2">
                                                <Search size={18} color="#9ca3af" />
                                                <TextInput className="flex-1 ml-2 h-10 text-sm" placeholder="이름, 이메일 검색..." value={searchTerm} onChangeText={setSearchTerm} />
                                            </View>

                                            {filteredUsers.length > 0 ? (
                                                filteredUsers.map(user => (
                                                    <TouchableOpacity key={user.id} onPress={() => handleUserClick(user.id)} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex-row justify-between items-center mb-2">
                                                        <View className="flex-row items-center">
                                                            <View className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center mr-3">
                                                                <Text className="font-bold text-gray-500">{user.name ? user.name[0] : "?"}</Text>
                                                            </View>
                                                            <View>
                                                                <Text className="font-bold text-sm text-gray-800">{user.name || "이름 없음"}</Text>
                                                                <Text className="text-xs text-gray-400 mt-0.5">{user.email || "이메일 없음"}</Text>
                                                            </View>
                                                        </View>
                                                    </TouchableOpacity>
                                                ))
                                            ) : (
                                                <View className="py-10 items-center">
                                                    <Text className="text-gray-500 font-bold text-base">텅 비어있습니다! 🕵️‍♂️</Text>
                                                    <Text className="text-gray-400 text-xs mt-2">서버에서 넘어온 유저 리스트가 0명입니다.</Text>
                                                </View>
                                            )}
                                        </>
                                    )}
                                    {selectedUser && (
                                        <View className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                            <View className="items-center mb-6">
                                                <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-3">
                                                    <Text className="text-3xl font-bold text-gray-500">{selectedUser.name ? selectedUser.name[0] : "?"}</Text>
                                                </View>
                                                <Text className="text-xl font-bold text-gray-800">{selectedUser.name}</Text>
                                            </View>
                                            <View className="gap-4">
                                                <View className="flex-row justify-between border-b border-gray-100 pb-3">
                                                    <Text className="font-bold text-sm text-gray-700">아이디</Text>
                                                    <Text className="text-sm text-gray-600">{selectedUser.userid}</Text>
                                                </View>
                                                <View className="flex-row justify-between border-b border-gray-100 pb-3">
                                                    <Text className="font-bold text-sm text-gray-700">이메일</Text>
                                                    <Text className="text-sm text-gray-600">{selectedUser.email}</Text>
                                                </View>
                                                <View className="flex-row justify-between border-b border-gray-100 pb-3">
                                                    <Text className="font-bold text-sm text-gray-700">전화번호</Text>
                                                    <Text className="text-sm text-gray-600">{selectedUser.phone || "미등록"}</Text>
                                                </View>
                                            </View>
                                            <TouchableOpacity onPress={() => handleDeleteUser(selectedUser.id)} className="mt-8 py-3.5 bg-red-50 rounded-xl flex-row justify-center items-center">
                                                <Trash2 size={18} color="#ef4444" />
                                                <Text className="text-red-500 font-bold ml-2">강제 탈퇴</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            )}

                            {currentView === "community" && (
                                <View className="flex-col gap-3 pb-8">
                                    {!selectedPost ? (
                                        <>
                                            <View className="relative flex-row items-center bg-white border border-gray-200 rounded-lg px-3 py-1 mb-2">
                                                <Search size={18} color="#9ca3af" />
                                                <TextInput className="flex-1 ml-2 h-10 text-sm" placeholder="제목 검색..." value={searchTerm} onChangeText={setSearchTerm} />
                                            </View>
                                            <View className="flex-row gap-2 mb-3">
                                                {['all', 'post', 'review'].map(tab => (
                                                    <TouchableOpacity key={tab} onPress={() => setCommunityTab(tab)} className={`flex-1 py-2 rounded-lg border ${communityTab === tab ? 'bg-gray-800 border-gray-800' : 'bg-white border-gray-200'}`}>
                                                        <Text className={`text-center text-xs font-bold ${communityTab === tab ? 'text-white' : 'text-gray-500'}`}>
                                                            {tab === 'all' ? '전체' : (tab === 'post' ? '게시글' : '리뷰')}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                            {filteredPosts.length > 0 ? filteredPosts.map(post => (
                                                <TouchableOpacity key={post.id} onPress={() => handlePostClick(post.id)} className="bg-white p-4 rounded-xl border border-gray-100 flex-row justify-between items-center mb-2 shadow-sm">
                                                    <View className="flex-row items-center flex-1 pr-3">
                                                        <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${post.rating > 0 ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                                                            {post.rating > 0 ? <Star size={18} color="#eab308" /> : <FileText size={18} color="#3b82f6" />}
                                                        </View>
                                                        <View className="flex-1">
                                                            <Text className="font-bold text-sm text-gray-800" numberOfLines={1}>{post.title}</Text>
                                                            <View className="flex-row items-center mt-1">
                                                                <Text className="text-xs text-gray-400">{post.nickname || "익명"}</Text>
                                                                <Text className="text-xs text-gray-300 mx-1">|</Text>
                                                                <Text className="text-xs text-gray-400">{post.rating > 0 ? `★ ${post.rating}` : "일반글"}</Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                    <TouchableOpacity onPress={() => handleDeletePost(post.id)} className="p-2">
                                                        <Trash2 size={18} color="#d1d5db" />
                                                    </TouchableOpacity>
                                                </TouchableOpacity>
                                            )) : (
                                                <Text className="text-center py-10 text-gray-400 text-sm">등록된 글이 없습니다.</Text>
                                            )}
                                        </>
                                    ) : (
                                        <View className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                            <View className="flex-row justify-between items-center mb-4">
                                                <View className={`px-2.5 py-1 rounded-md ${selectedPost.rating > 0 ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                                                    <Text className={`text-xs font-bold ${selectedPost.rating > 0 ? 'text-yellow-600' : 'text-blue-600'}`}>
                                                        {selectedPost.rating > 0 ? `★ ${selectedPost.rating} 리뷰` : "일반 게시글"}
                                                    </Text>
                                                </View>
                                                <View className="flex-row items-center">
                                                    <Calendar size={12} color="#9ca3af" />
                                                    <Text className="text-xs text-gray-400 ml-1">{selectedPost.date || selectedPost.postdate}</Text>
                                                </View>
                                            </View>
                                            <Text className="text-xl font-bold text-gray-800 mb-3">{selectedPost.title}</Text>
                                            <View className="flex-row items-center mb-5 pb-5 border-b border-gray-100">
                                                <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center mr-2">
                                                    <User size={16} color="#6b7280" />
                                                </View>
                                                <Text className="text-sm font-medium text-gray-600">{selectedPost.nickname || selectedPost.author}</Text>
                                            </View>
                                            <Text className="text-sm text-gray-700 leading-6 mb-5 min-h-[100px]">
                                                {selectedPost.comment || selectedPost.content || "내용이 없습니다."}
                                            </Text>
                                            {/* 이미지 처리 (웹 -> 앱 맞춤) */}
                                            {selectedPost.imagePath && getSafeImageUrl(selectedPost.imagePath.split(',')[0]) && (
                                                <View className="mb-6 rounded-xl overflow-hidden border border-gray-200">
                                                    <Image
                                                        source={{ uri: getSafeImageUrl(selectedPost.imagePath.split(',')[0]) }}
                                                        className="w-full h-48"
                                                        resizeMode="cover"
                                                    />
                                                </View>
                                            )}
                                            <View className="flex-row gap-3 pt-2">
                                                <TouchableOpacity onPress={() => setSelectedPost(null)} className="flex-1 py-3 bg-gray-100 rounded-xl">
                                                    <Text className="text-center font-bold text-gray-600">목록으로</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => handleDeletePost(selectedPost.id)} className="flex-1 py-3 bg-red-50 flex-row items-center justify-center rounded-xl">
                                                    <Trash2 size={16} color="#ef4444" />
                                                    <Text className="text-center font-bold text-red-500 ml-1">삭제하기</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}