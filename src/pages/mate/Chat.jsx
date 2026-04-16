import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, SafeAreaView, Alert, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { Search, Settings, Users, MapPin, ChevronLeft, MoreVertical, Send, Paperclip, Megaphone, Calendar, Smile, LogOut, X } from 'lucide-react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import { Buffer } from 'buffer'; // JWT 해독용

const { width } = Dimensions.get('window');

// 텍스트 인코딩 폴리필 (JWT 해독용)
global.Buffer = Buffer;

export default function ChatApp({ navigation }) {
    const [view, setView] = useState("list");
    const [selectedChat, setSelectedChat] = useState(null);
    const [message, setMessage] = useState("");
    const [liveMessages, setLiveMessages] = useState([]);
    const [chatRooms, setChatRooms] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [chatMembers, setChatMembers] = useState([]);
    const [myName, setMyName] = useState("");

    const stompClient = useRef(null);
    const scrollRef = useRef(null);

    // 실제 서버 주소 (에뮬레이터 환경에서는 localhost가 아닌 IP 사용)
    const API_BASE = 'http://YOUR_SERVER_IP:8080/api';

    // 1. JWT 토큰 해독 및 내 이름 설정
    useEffect(() => {
        const initUser = async () => {
            const token = await AsyncStorage.getItem("jwtToken");
            if (token) {
                try {
                    const payload = token.split('.')[1];
                    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
                    setMyName(decoded.sub || decoded.username || "익명");
                } catch (e) { console.error("Token Decode Error", e); }
            }
        };
        initUser();
    }, []);

    // 2. 채팅방 목록 가져오기
    const fetchRooms = useCallback(async () => {
        const token = await AsyncStorage.getItem("jwtToken");
        try {
            const res = await axios.get(`${API_BASE}/mates/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // 시간 관계상 기본 목록만 먼저 세팅 (상세 메시지는 웹 로직과 동일하게 추가 가능)
            const rooms = res.data.map(room => ({
                id: room.id,
                name: room.title,
                topic: room.course?.name,
                lastMsg: "메시지를 확인하세요",
                time: "방금",
                profile: room.course?.image || "https://via.placeholder.com/100",
                location: room.meeting?.location || "장소 미정",
            }));
            setChatRooms(rooms);
        } catch (error) { console.error("Rooms Load Fail", error); }
    }, []);

    useEffect(() => { if (view === "list") fetchRooms(); }, [view]);

    // 3. 소켓 연결 (Stomp)
    useEffect(() => {
        const connectSocket = async () => {
            const token = await AsyncStorage.getItem("jwtToken");
            if (view === "chat" && selectedChat) {
                const socket = new SockJS('http://YOUR_SERVER_IP:8080/ws-stomp');
                const client = new Client({
                    webSocketFactory: () => socket,
                    connectHeaders: { Authorization: `Bearer ${token}` },
                    onConnect: () => {
                        client.subscribe(`/sub/chat/room/${selectedChat.id}`, (res) => {
                            const msg = JSON.parse(res.body);
                            setLiveMessages(prev => [...prev, {
                                ...msg,
                                isMe: msg.sender === myName,
                                time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
                            }]);
                        });
                    },
                });
                client.activate();
                stompClient.current = client;
            }
        };
        connectSocket();
        return () => stompClient.current?.deactivate();
    }, [view, selectedChat]);

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

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                {view === "list" ? (
                    /* --- 채팅방 리스트 --- */
                    <View className="flex-1 bg-gray-50">
                        <View className="bg-white p-6 border-b border-gray-100">
                            <View className="flex-row justify-between items-center mb-4">
                                <TouchableOpacity onPress={() => navigation.goBack()}>
                                    <ChevronLeft size={24} color="#4b5563" />
                                </TouchableOpacity>
                                <Text className="text-xl font-bold">채팅</Text>
                                <Settings size={20} color="#9ca3af" />
                            </View>
                            <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-1">
                                <Search size={18} color="#9ca3af" />
                                <TextInput
                                    className="flex-1 h-10 ml-2"
                                    placeholder="채팅방 검색"
                                    value={searchTerm}
                                    onChangeText={setSearchTerm}
                                />
                            </View>
                        </View>

                        <ScrollView className="p-4">
                            {chatRooms.map(chat => (
                                <TouchableOpacity
                                    key={chat.id}
                                    onPress={() => { setSelectedChat(chat); setView("chat"); }}
                                    className="flex-row items-center p-4 bg-white rounded-3xl mb-3 shadow-sm"
                                >
                                    <Image source={{ uri: chat.profile }} className="w-14 h-14 rounded-2xl bg-gray-200" />
                                    <View className="flex-1 ml-4">
                                        <View className="flex-row justify-between">
                                            <Text className="font-bold text-gray-900">{chat.name}</Text>
                                            <Text className="text-[10px] text-gray-400">{chat.time}</Text>
                                        </View>
                                        <Text className="text-gray-500 text-sm mt-1" numberOfLines={1}>{chat.lastMsg}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                ) : (
                    /* --- 채팅창 내부 --- */
                    <View className="flex-1 bg-gray-100">
                        {/* 헤더 */}
                        <View className="flex-row items-center justify-between bg-white px-4 py-3 border-b border-gray-200">
                            <TouchableOpacity onPress={() => setView("list")}>
                                <ChevronLeft size={24} color="#4b5563" />
                            </TouchableOpacity>
                            <View className="items-center">
                                <Text className="font-bold text-[16px]">{selectedChat.name}</Text>
                                <Text className="text-[10px] text-indigo-500 font-bold">● 멤버 확인 중</Text>
                            </View>
                            <TouchableOpacity onPress={() => setIsDrawerOpen(true)}>
                                <MoreVertical size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>

                        {/* 메시지 영역 */}
                        <ScrollView
                            ref={scrollRef}
                            className="flex-1 p-4"
                            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
                        >
                            {liveMessages.map((msg, idx) => (
                                <View key={idx} className={`flex-row mb-4 ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                                    {!msg.isMe && <View className="w-10 h-10 bg-gray-300 rounded-xl mr-2" />}
                                    <View className={`max-w-[70%] ${msg.isMe ? 'items-end' : 'items-start'}`}>
                                        <View className={`px-4 py-2 rounded-2xl ${msg.isMe ? 'bg-indigo-600 rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                                            <Text className={msg.isMe ? 'text-white' : 'text-gray-800'}>{msg.message || msg.text}</Text>
                                        </View>
                                        <Text className="text-[9px] text-gray-400 mt-1">{msg.time}</Text>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>

                        {/* 입력창 */}
                        <View className="flex-row items-center p-4 bg-white border-t border-gray-100 pb-8">
                            <TouchableOpacity className="mr-2"><Paperclip size={24} color="#9ca3af" /></TouchableOpacity>
                            <TextInput
                                className="flex-1 bg-gray-100 rounded-2xl px-4 h-11"
                                placeholder="메시지 입력..."
                                value={message}
                                onChangeText={setMessage}
                            />
                            <TouchableOpacity
                                onPress={handleSendMessage}
                                className={`ml-3 p-3 rounded-2xl ${message ? 'bg-indigo-600' : 'bg-gray-200'}`}
                            >
                                <Send size={20} color={message ? "white" : "#9ca3af"} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}