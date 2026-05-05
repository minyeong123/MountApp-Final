import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, Dimensions, Alert, Modal } from 'react-native';
import { Search, Settings, ChevronLeft, MoreVertical, Send, Paperclip, Megaphone, Calendar, Smile, LogOut, X, MapPin, Users } from 'lucide-react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import { Buffer } from 'buffer';
import { useRouter } from 'expo-router';

global.Buffer = Buffer;
const { width } = Dimensions.get('window');

const BACKEND_URL = "http://10.0.2.2:8082";

// 이미지 경로 안전 변환 함수
const getSafeImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const filename = path.split('\\').pop().split('/').pop();
    return `${BACKEND_URL}/uploads/${filename}`;
};

// 시간 포맷 함수
const formatTime = (dateData) => {
    if (!dateData) return "시간없음";
    try {
        if (Array.isArray(dateData)) {
            const [year, month, day, hour, minute, second = 0] = dateData;
            return new Date(year, month - 1, day, hour, minute, second)
                .toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        }
        let parsedStr = dateData;
        if (typeof dateData === 'string' && dateData.includes(' ') && !dateData.includes('T')) {
            parsedStr = dateData.replace(' ', 'T');
        }
        const parsedDate = new Date(parsedStr);
        if (isNaN(parsedDate.getTime())) return "변환실패";
        return parsedDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
        return "에러남";
    }
};

export default function Chat() {
    const router = useRouter();
    const [view, setView] = useState("list");
    const [selectedChat, setSelectedChat] = useState(null);
    const [message, setMessage] = useState("");
    const [liveMessages, setLiveMessages] = useState([]);
    const [chatRooms, setChatRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [myName, setMyName] = useState("");
    const [chatMembers, setChatMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const stompClient = useRef(null);
    const scrollRef = useRef(null);

    // 1. 사용자 정보 로드
    useEffect(() => {
        const initUser = async () => {
            const token = await AsyncStorage.getItem("jwtToken");
            if (token) {
                try {
                    const payload = token.split('.')[1];
                    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
                    setMyName(decoded.sub || decoded.nickname || decoded.username || "나");
                } catch (e) { console.error(e); }
            }
        };
        initUser();
    }, []);

    // 2. 채팅방 목록 및 마지막 메시지 로드
    const fetchRooms = useCallback(async () => {
        setLoading(true);
        const token = await AsyncStorage.getItem("jwtToken");
        try {
            const res = await axios.get(`${BACKEND_URL}/api/mates/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const roomsWithLastMsg = await Promise.all(res.data.map(async (room) => {
                let lastMsg = room.message || "메시지가 없습니다.";
                let lastTime = room.meeting?.date ? room.meeting.date.split(' ')[1]?.substring(0, 5) : "";

                try {
                    const msgRes = await axios.get(`${BACKEND_URL}/api/chat/room/${room.id}/messages`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (msgRes.data?.length > 0) {
                        const lastChat = msgRes.data[msgRes.data.length - 1];
                        lastMsg = lastChat.message;
                        lastTime = formatTime(lastChat.sendDate);
                    }
                } catch (e) { console.error(`${room.id}번 메시지 로드 실패`); }

                return {
                    id: room.id,
                    name: room.title,
                    topic: room.course?.name || "하이킹",
                    lastMsg: lastMsg,
                    time: lastTime,
                    profile: getSafeImageUrl(room.course?.image) || "https://placehold.co/150",
                    location: room.meeting?.location || "장소 미정",
                    date: room.meeting?.date || "일정 미정"
                };
            }));
            setChatRooms(roomsWithLastMsg);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { if (view === "list") fetchRooms(); }, [view, fetchRooms]);

    // 3. 방 입장 시 멤버 정보 로드
    useEffect(() => {
        const fetchMembers = async () => {
            if (view === "chat" && selectedChat) {
                const token = await AsyncStorage.getItem("jwtToken");
                try {
                    const res = await axios.get(`${BACKEND_URL}/api/mates/${selectedChat.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const members = res.data.members?.list || [];
                    const host = res.data.host ? { name: res.data.host.name, profileImg: res.data.host.profileImg, isHost: true } : null;

                    let allMembers = [...members];
                    if (host && !allMembers.some(m => m.name === host.name)) {
                        allMembers.unshift(host); // 방장을 맨 앞으로
                    }
                    setChatMembers(allMembers);
                } catch (err) { console.error("모임 상세 정보 로드 실패:", err); }
            }
        };
        fetchMembers();
    }, [view, selectedChat]);

    // 4. 소켓 연결 및 메시지 내역 로드
    useEffect(() => {
        const initChat = async () => {
            if (view === "chat" && selectedChat && myName) {
                const token = await AsyncStorage.getItem("jwtToken");

                // 과거 메시지 내역 불러오기
                try {
                    const res = await axios.get(`${BACKEND_URL}/api/chat/room/${selectedChat.id}/messages`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const history = res.data.map(msg => ({
                        id: msg.id,
                        sender: msg.sender,
                        senderName: msg.senderNickname || msg.sender,
                        profile: getSafeImageUrl(msg.profileImage) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender}`,
                        message: msg.message,
                        time: formatTime(msg.sendDate),
                        isMe: msg.sender === myName
                    }));
                    setLiveMessages(history);
                } catch (e) { setLiveMessages([]); }

                // WebSocket 연결
                const client = new Client({
                    webSocketFactory: () => new SockJS(`${BACKEND_URL}/ws-stomp`),
                    connectHeaders: { Authorization: `Bearer ${token}` },
                    onConnect: () => {
                        client.subscribe(`/sub/chat/room/${selectedChat.id}`, (res) => {
                            const receivedMsg = JSON.parse(res.body);
                            setLiveMessages(prev => [...prev, {
                                id: receivedMsg.id || Date.now(),
                                sender: receivedMsg.sender,
                                senderName: receivedMsg.senderNickname || receivedMsg.sender,
                                profile: getSafeImageUrl(receivedMsg.profileImage) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${receivedMsg.sender}`,
                                message: receivedMsg.message,
                                time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                                isMe: receivedMsg.sender === myName
                            }]);
                        });
                    }
                });
                client.activate();
                stompClient.current = client;
            }
        };

        initChat();

        return () => {
            if (stompClient.current) stompClient.current.deactivate();
        };
    }, [view, selectedChat, myName]);

    // 5. 메시지 전송
    const handleSendMessage = () => {
        if (message.trim() && stompClient.current?.connected) {
            stompClient.current.publish({
                destination: "/pub/chat/message",
                body: JSON.stringify({
                    type: 'TALK',
                    roomId: selectedChat.id.toString(),
                    sender: myName,
                    message: message
                })
            });
            setMessage("");
        }
    };

    // 6. 메이트 취소
    const handleLeaveMate = async () => {
        Alert.alert("모임 취소", "정말 이 모임을 취소하시겠습니까?", [
            { text: "아니요", style: "cancel" },
            {
                text: "예",
                style: "destructive",
                onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem("jwtToken");
                        await axios.delete(`${BACKEND_URL}/api/mates/${selectedChat.id}/leave`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        Alert.alert("알림", "모임 참여가 취소되었습니다.");
                        setIsDrawerOpen(false);
                        setSelectedChat(null);
                        setView("list");
                    } catch (error) {
                        Alert.alert("오류", error.response?.data || "취소 중 오류가 발생했습니다.");
                    }
                }
            }
        ]);
    };

    const filteredRooms = chatRooms.filter(room => room.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const enterChat = (chat) => {
        setSelectedChat(chat);
        setLiveMessages([]);
        setView("chat");
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                {view === "list" ? (
                    <View className="flex-1 bg-[#F8F9FA]">
                        <View className="bg-white px-6 pt-4 pb-4 border-b border-gray-100 shadow-sm mt-4">
                            <View className="flex-row justify-between items-center mb-4">
                                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                                    <ChevronLeft size={24} color="#4b5563" />
                                </TouchableOpacity>
                                <Text className="text-xl font-bold tracking-tight text-gray-900">채팅</Text>
                                <TouchableOpacity className="p-2"><Settings size={20} color="#9ca3af" /></TouchableOpacity>
                            </View>
                            <View className="relative flex-row items-center bg-gray-100 rounded-2xl px-4 py-1">
                                <Search size={18} color="#9ca3af" />
                                <TextInput
                                    placeholder="채팅방 검색"
                                    value={searchTerm}
                                    onChangeText={setSearchTerm}
                                    className="flex-1 h-10 ml-2 text-[15px]"
                                    placeholderTextColor="#9ca3af"
                                />
                                {searchTerm !== "" && (
                                    <TouchableOpacity onPress={() => setSearchTerm("")}>
                                        <X size={16} color="#9ca3af" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        <ScrollView className="flex-1 px-4 py-4">
                            {loading ? (
                                <ActivityIndicator size="large" color="#4f46e5" style={{ marginTop: 50 }} />
                            ) : filteredRooms.length > 0 ? (
                                filteredRooms.map(chat => (
                                    <TouchableOpacity
                                        key={chat.id}
                                        onPress={() => enterChat(chat)}
                                        className="flex-row items-center p-4 bg-white rounded-[24px] mb-3 shadow-sm border border-transparent active:border-orange-100"
                                    >
                                        <View className="relative">
                                            <Image source={{ uri: chat.profile }} className="w-14 h-14 rounded-2xl bg-gray-200" />
                                            <View className="absolute -bottom-1 -right-1 bg-orange-500 w-5 h-5 rounded-full border-2 border-white items-center justify-center">
                                                <Users size={10} color="white" strokeWidth={3} />
                                            </View>
                                        </View>
                                        <View className="flex-1 ml-4 min-w-0">
                                            <View className="flex-row justify-between items-start mb-1">
                                                <View className="flex-1 mr-2">
                                                    <Text className="font-bold text-gray-900 text-base" numberOfLines={1}>{chat.name}</Text>
                                                    <Text className="text-[11px] text-gray-400 font-medium">{chat.topic}</Text>
                                                </View>
                                                <Text className="text-[11px] text-gray-400 font-medium">{chat.time}</Text>
                                            </View>
                                            <Text className="text-sm text-gray-500 mt-1" numberOfLines={1}>{chat.lastMsg}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <Text className="text-center text-gray-400 mt-10">
                                    {searchTerm ? "검색 결과가 없습니다." : "참여 중인 채팅방이 없습니다."}
                                </Text>
                            )}
                        </ScrollView>
                    </View>
                ) : (
                    <View className="flex-1 bg-[#F2F3F5]">
                        {/* 헤더 */}
                        <View className="flex-row items-center justify-between bg-white/95 px-4 py-3 border-b border-gray-200 z-30">
                            <View className="flex-row items-center flex-1">
                                <TouchableOpacity onPress={() => {
                                    if(stompClient.current) stompClient.current.deactivate();
                                    setView("list");
                                }} className="p-2">
                                    <ChevronLeft size={24} color="#4b5563" />
                                </TouchableOpacity>
                                <View className="ml-1 flex-1">
                                    <Text className="font-bold text-[16px] text-gray-900" numberOfLines={1}>{selectedChat.name}</Text>
                                    <View className="flex-row items-center">
                                        <View className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-1" />
                                        <Text className="text-[11px] text-indigo-500 font-bold">{chatMembers.length}명 참여 중</Text>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => setIsDrawerOpen(true)} className="p-2">
                                <MoreVertical size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>

                        {/* 공지사항 */}
                        <View className="px-4 py-2">
                            <View className="bg-white/80 border border-white/60 rounded-[20px] p-4 shadow-sm">
                                <View className="flex-row items-center mb-2">
                                    <Megaphone size={16} color="#4f46e5" />
                                    <Text className="text-indigo-600 font-extrabold text-[10px] ml-1 tracking-wider">공지사항</Text>
                                </View>
                                <Text className="text-sm font-bold text-gray-800 mb-2 leading-snug">{selectedChat.name}</Text>
                                <View className="flex-row items-center space-x-3">
                                    <View className="flex-row items-center mr-3">
                                        <MapPin size={12} color="#9ca3af" />
                                        <Text className="text-[11px] text-gray-500 font-medium ml-1">{selectedChat.location}</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Calendar size={12} color="#9ca3af" />
                                        <Text className="text-[11px] text-gray-500 font-medium ml-1">{selectedChat.date}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* 메시지 내역 */}
                        <ScrollView
                            ref={scrollRef}
                            className="flex-1 p-4"
                            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
                        >
                            {liveMessages.map((msg, idx) => (
                                <View key={idx} className={`flex-row mb-4 ${msg.isMe ? 'justify-end' : 'justify-start'} items-end`}>
                                    {!msg.isMe && (
                                        <Image source={{ uri: msg.profile }} className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 self-start" />
                                    )}
                                    <View className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'} max-w-[75%] ml-2`}>
                                        {!msg.isMe && <Text className="text-[11px] text-gray-500 mb-1 ml-1 font-bold">{msg.senderName}</Text>}
                                        <View className={`px-4 py-2.5 rounded-[18px] shadow-sm ${msg.isMe ? 'bg-indigo-600 rounded-tr-none' : 'bg-white rounded-tl-none border border-gray-100'}`}>
                                            <Text className={`text-[14.5px] leading-relaxed ${msg.isMe ? 'text-white' : 'text-gray-800'}`}>{msg.message}</Text>
                                        </View>
                                        <Text className="text-[10px] text-gray-400 mt-1.5 font-semibold px-1">{msg.time}</Text>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>

                        {/* 입력창 */}
                        <View className="bg-white px-4 py-4 pb-10 border-t border-gray-100 flex-row items-center">
                            <TouchableOpacity className="p-1.5 mr-1"><Paperclip size={24} color="#9ca3af" /></TouchableOpacity>
                            <View className="flex-1 relative flex-row items-center bg-gray-100 rounded-2xl">
                                <TextInput
                                    className="flex-1 py-3 px-4 text-[15px] border border-transparent"
                                    placeholder="메시지를 입력하세요..."
                                    value={message}
                                    onChangeText={setMessage}
                                    onSubmitEditing={handleSendMessage}
                                />
                                <TouchableOpacity className="pr-3"><Smile size={20} color="#d1d5db" /></TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                onPress={handleSendMessage}
                                disabled={!message.trim()}
                                className={`ml-3 p-3 rounded-2xl shadow-lg ${message.trim() ? 'bg-indigo-600' : 'bg-gray-200'}`}
                            >
                                <Send size={20} color={message.trim() ? "white" : "#9ca3af"} fill={message.trim() ? "currentColor" : "none"} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* 우측 사이드 드로어 (멤버 목록 / 취소 버튼) */}
                <Modal visible={isDrawerOpen} transparent animationType="fade">
                    <View className="flex-1 flex-row">
                        <TouchableOpacity className="flex-1 bg-black/40" onPress={() => setIsDrawerOpen(false)} />
                        <View className="w-[75%] bg-white h-full shadow-2xl flex flex-col">
                            <View className="p-5 border-b border-gray-100 flex-row justify-between items-center mt-10">
                                <Text className="font-bold text-lg">채팅방 정보</Text>
                                <TouchableOpacity onPress={() => setIsDrawerOpen(false)} className="p-1 bg-gray-100 rounded-full">
                                    <X size={20} color="#9ca3af" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView className="flex-1 p-5">
                                <View className="flex-row items-center mb-4">
                                    <Users size={14} color="#9ca3af" />
                                    <Text className="text-[12px] font-bold text-gray-400 uppercase tracking-widest ml-2">
                                        참여 멤버 ({chatMembers.length})
                                    </Text>
                                </View>
                                {chatMembers.map((member, index) => (
                                    <View key={index} className="flex-row items-center mb-4">
                                        <Image
                                            source={{ uri: getSafeImageUrl(member.profileImg) || "https://placehold.co/100" }}
                                            className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200"
                                        />
                                        <View className="ml-3 flex-row items-center">
                                            <Text className="font-semibold text-[15px] text-gray-800">{member.name}</Text>
                                            {member.name === myName && (
                                                <View className="ml-2 bg-indigo-100 px-1.5 py-0.5 rounded">
                                                    <Text className="text-[10px] text-indigo-600 font-bold">나</Text>
                                                </View>
                                            )}
                                            {member.isHost && (
                                                <View className="ml-1 bg-orange-100 px-1.5 py-0.5 rounded">
                                                    <Text className="text-[10px] text-orange-600 font-bold">방장</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>

                            <View className="p-4 border-t border-gray-100 mb-6">
                                <TouchableOpacity onPress={handleLeaveMate} className="w-full py-4 bg-red-50 rounded-2xl flex-row items-center justify-center">
                                    <LogOut size={18} color="#ef4444" />
                                    <Text className="text-red-500 font-bold ml-2">메이트 취소</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}