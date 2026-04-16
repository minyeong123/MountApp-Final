import React, { useState, useEffect } from "react";
import {
    View, Text, TouchableOpacity, ScrollView,
    TextInput, Modal, Alert, Image, SafeAreaView
} from "react-native";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    ShieldCheck, X, UserCog, MessageSquareText,
    ArrowLeft, Search, Trash2, Star, FileText, Calendar, User
} from "lucide-react-native";

export default function AdminMode({ children, pathname }) {
    // 1. 상태 및 권한 확인 (localStorage -> AsyncStorage 교체)
    const [isAdmin, setIsAdmin] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentView, setCurrentView] = useState("menu");
    const [searchTerm, setSearchTerm] = useState("");

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    const [communityPosts, setCommunityPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [communityTab, setCommunityTab] = useState("all");

    useEffect(() => {
        const checkAdmin = async () => {
            const role = await AsyncStorage.getItem("role");
            setIsAdmin(role === "admin" || role === "ROLE_ADMIN");
        };
        checkAdmin();
    }, []);

    // 2. API 통신 함수 (기존 로직 유지)
    const fetchUsers = async () => {
        const token = await AsyncStorage.getItem("jwtToken");
        if (!token) return;
        try {
            const response = await axios.get("/api/admin/users", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (error) { console.error("사용자 로딩 실패:", error); }
    };

    const fetchCommunityPosts = async () => {
        const token = await AsyncStorage.getItem("jwtToken");
        if (!token) return;
        try {
            const response = await axios.get("/api/posts", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCommunityPosts(response.data);
        } catch (error) { console.error("게시글 로딩 실패:", error); }
    };

    useEffect(() => {
        if (!isModalOpen) return;
        if (currentView === "users") fetchUsers();
        else if (currentView === "community") fetchCommunityPosts();
    }, [isModalOpen, currentView]);

    // 3. Early Return (경로 처리)
    if (pathname === "/login" || pathname === "/join" || pathname === "/find") {
        return <>{children}</>;
    }

    // 4. 핸들러 (window.confirm -> Alert.alert 교체)
    const handleDeleteUser = async (id) => {
        Alert.alert("확인", "정말 삭제하시겠습니까?", [
            { text: "취소", style: "cancel" },
            { text: "삭제", onPress: async () => {
                    const token = await AsyncStorage.getItem("jwtToken");
                    try {
                        await axios.delete(`/api/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                        setUsers(prev => prev.filter(user => user.id !== id));
                        setSelectedUser(null);
                    } catch (e) { Alert.alert("삭제 실패"); }
                }}
        ]);
    };

    const handleBack = () => {
        if (selectedUser) setSelectedUser(null);
        else if (selectedPost) setSelectedPost(null);
        else setCurrentView("menu");
    };

    // 5. 필터링 로직 (기존 유지)
    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(user.id).includes(searchTerm)
    );

    const filteredPosts = communityPosts.filter(post => {
        const isReview = post.rating > 0;
        if (communityTab === "post" && isReview) return false;
        if (communityTab === "review" && !isReview) return false;
        if (searchTerm) {
            const title = post.title?.toLowerCase() || "";
            const nickname = post.nickname?.toLowerCase() || "";
            return title.includes(searchTerm.toLowerCase()) || nickname.includes(searchTerm.toLowerCase());
        }
        return true;
    });

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <View className="flex-1 bg-white relative">
                {isAdmin && (
                    <TouchableOpacity
                        className="absolute top-4 right-4 bg-red-500/80 px-4 py-1.5 rounded-full z-40 flex-row items-center"
                        onPress={() => setIsModalOpen(true)}>
                        <ShieldCheck size={16} color="white" />
                        <Text className="text-white font-medium ml-2 text-xs">관리자</Text>
                    </TouchableOpacity>
                )}

                <Modal visible={isModalOpen} animationType="fade" transparent={true}>
                    <View className="flex-1 bg-black/60 justify-center items-center p-4">
                        <View className={`bg-white rounded-2xl overflow-hidden flex-col ${currentView === 'menu' ? 'w-[320px] h-[340px]' : 'w-[400px] h-[600px]'}`}>

                            {/* 헤더 */}
                            <View className="bg-red-500 p-4 flex-row justify-between items-center shadow-md">
                                <View className="flex-row items-center">
                                    {currentView !== "menu" ? (
                                        <TouchableOpacity onPress={handleBack} className="mr-2">
                                            <ArrowLeft size={20} color="white" />
                                        </TouchableOpacity>
                                    ) : <ShieldCheck size={20} color="white" />}
                                    <Text className="text-white font-bold text-lg">
                                        {currentView === "menu" ? "관리자 메뉴" : currentView === "users" ? "사용자 관리" : "커뮤니티 관리"}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                                    <X size={20} color="white" />
                                </TouchableOpacity>
                            </View>

                            {/* 바디 */}
                            <ScrollView className="flex-1 bg-gray-50 p-4">
                                {currentView === "menu" && (
                                    <View className="flex-col gap-4 justify-center h-full">
                                        <TouchableOpacity onPress={() => setCurrentView("users")} className="flex-row items-center p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
                                            <View className="bg-red-50 p-3 rounded-full mr-4"><UserCog size={24} color="#ef4444" /></View>
                                            <View><Text className="font-bold text-gray-800">사용자 관리</Text><Text className="text-xs text-gray-400">회원 조회 및 삭제</Text></View>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setCurrentView("community")} className="flex-row items-center p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
                                            <View className="bg-blue-50 p-3 rounded-full mr-4"><MessageSquareText size={24} color="#3b82f6" /></View>
                                            <View><Text className="font-bold text-gray-800">커뮤니티 관리</Text><Text className="text-xs text-gray-400">게시글 및 리뷰 관리</Text></View>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {currentView === "users" && (
                                    <View className="flex-col gap-3">
                                        {!selectedUser ? (
                                            <>
                                                <View className="relative mb-2 flex-row items-center bg-white border border-gray-200 rounded-lg px-3">
                                                    <Search size={18} color="#9ca3af" />
                                                    <TextInput className="flex-1 ml-2 py-2 text-sm" placeholder="검색..." value={searchTerm} onChangeText={setSearchTerm} />
                                                </View>
                                                {filteredUsers.map(user => (
                                                    <TouchableOpacity key={user.id} onPress={() => setSelectedUser(user)} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex-row justify-between items-center">
                                                        <View className="flex-row items-center">
                                                            <View className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center mr-3"><Text className="font-bold text-gray-500">{user.name?.[0]}</Text></View>
                                                            <View><Text className="font-bold text-sm">{user.name}</Text><Text className="text-xs text-gray-400">{user.email}</Text></View>
                                                        </View>
                                                        <TouchableOpacity onPress={() => handleDeleteUser(user.id)}><Trash2 size={18} color="#d1d5db" /></TouchableOpacity>
                                                    </TouchableOpacity>
                                                ))}
                                            </>
                                        ) : (
                                            <View className="bg-white p-6 rounded-xl border border-gray-100">
                                                <View className="items-center mb-6">
                                                    <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-3"><Text className="text-3xl font-bold text-gray-500">{selectedUser.name?.[0]}</Text></View>
                                                    <Text className="text-xl font-bold">{selectedUser.name}</Text>
                                                </View>
                                                <View className="gap-4">
                                                    <View className="flex-row justify-between border-b border-gray-100 pb-2"><Text className="font-bold text-sm">아이디</Text><Text className="text-sm">{selectedUser.userid}</Text></View>
                                                    <View className="flex-row justify-between border-b border-gray-100 pb-2"><Text className="font-bold text-sm">이메일</Text><Text className="text-sm">{selectedUser.email}</Text></View>
                                                </View>
                                                <TouchableOpacity onPress={() => handleDeleteUser(selectedUser.id)} className="mt-6 py-3 bg-red-50 rounded-xl flex-row justify-center items-center"><Trash2 size={18} color="#ef4444" /><Text className="text-red-500 font-bold ml-2">강제 탈퇴</Text></TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                )}

                                {/* 커뮤니티 관리 뷰 (사용자 뷰와 동일한 NativeWind 패턴 적용) */}
                                {currentView === "community" && (
                                    <View className="flex-col gap-3">
                                        {!selectedPost ? (
                                            <>
                                                <View className="relative mb-2 flex-row items-center bg-white border border-gray-200 rounded-lg px-3">
                                                    <Search size={18} color="#9ca3af" />
                                                    <TextInput className="flex-1 ml-2 py-2 text-sm" placeholder="제목 검색..." value={searchTerm} onChangeText={setSearchTerm} />
                                                </View>
                                                <View className="flex-row gap-2 mb-2">
                                                    {['all', 'post', 'review'].map(tab => (
                                                        <TouchableOpacity key={tab} onPress={() => setCommunityTab(tab)} className={`flex-1 py-1.5 rounded-lg border ${communityTab === tab ? 'bg-gray-800 border-gray-800' : 'bg-white border-gray-200'}`}>
                                                            <Text className={`text-center text-xs font-bold ${communityTab === tab ? 'text-white' : 'text-gray-500'}`}>{tab === 'all' ? '전체' : (tab === 'post' ? '게시글' : '리뷰')}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                                {filteredPosts.map(post => (
                                                    <TouchableOpacity key={post.id} onPress={() => setSelectedPost(post)} className="bg-white p-4 rounded-xl border border-gray-100 flex-row justify-between items-center">
                                                        <View className="flex-row items-center flex-1">
                                                            <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${post.rating > 0 ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                                                                {post.rating > 0 ? <Star size={18} color="#eab308" /> : <FileText size={18} color="#3b82f6" />}
                                                            </View>
                                                            <View className="flex-1"><Text className="font-bold text-sm" numberOfLines={1}>{post.title}</Text><Text className="text-xs text-gray-400">{post.nickname || "익명"}</Text></View>
                                                        </View>
                                                        <Trash2 size={18} color="#d1d5db" />
                                                    </TouchableOpacity>
                                                ))}
                                            </>
                                        ) : (
                                            <View className="bg-white p-5 rounded-xl border border-gray-100">
                                                <Text className="text-xl font-bold mb-2">{selectedPost.title}</Text>
                                                <Text className="text-sm text-gray-700 mb-4">{selectedPost.content || selectedPost.comment}</Text>
                                                <TouchableOpacity onPress={() => setSelectedPost(null)} className="py-2.5 bg-gray-100 rounded-lg"><Text className="text-center font-bold text-gray-600">목록으로</Text></TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
                {children}
            </View>
        </SafeAreaView>
    );
}