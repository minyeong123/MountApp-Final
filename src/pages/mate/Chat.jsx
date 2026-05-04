import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, Dimensions } from 'react-native';
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
const SOCKET_URL = "http://10.0.2.2:8082/ws-stomp";

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

    const stompClient = useRef(null);
    const scrollRef = useRef(null);

    // [기존 로직 유지] 사용자 정보 및 채팅방 정보 로드...
    useEffect(() => {
        const initUser = async () => {
            const token = await AsyncStorage.getItem("jwtToken");
            if (token) {
                try {
                    const payload = token.split('.')[1];
                    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
                    setMyName(decoded.sub || decoded.nickname || "나");
                } catch (e) { console.error(e); }
            }
        };
        initUser();
    }, []);

    const fetchRooms = useCallback(async () => {
        setLoading(true);
        const token = await AsyncStorage.getItem("jwtToken");
        try {
            const res = await axios.get(`${BACKEND_URL}/api/mates/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setChatRooms(res.data.map(room => ({
                id: room.id,
                name: room.title,
                topic: room.course?.name || "하이킹",
                lastMsg: "대화를 나눠보세요",
                time: "방금",
                profile: room.course?.image || "https://via.placeholder.com/150",
                location: room.meeting?.location || "장소 미정",
                date: room.meeting?.date || "일정 미정"
            })));
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { if (view === "list") fetchRooms(); }, [view, fetchRooms]);

    // [소켓 연결 및 핸들러 부분 생략 - 이전 답변과 동일]
    const enterChat = (chat) => {
        setSelectedChat(chat);
        setLiveMessages([]);
        setView("chat");
        // 소켓 연결 로직 호출 (connectSocket 등)
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                {view === "list" ? (
                    /* --- 웹 스타일 리스트 뷰 --- */
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
                                    className="flex-1 h-10 ml-2 text-[15px]"
                                    placeholderTextColor="#9ca3af"
                                    style={{
                                        textAlignVertical: 'center',
                                        paddingVertical: 0,
                                        includeFontPadding: false
                                    }}
                                />
                            </View>
                        </View>

                        <ScrollView className="flex-1 px-4 py-4">
                            {chatRooms.map(chat => (
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
                                            <View>
                                                <Text className="font-bold text-gray-900 text-base" numberOfLines={1}>{chat.name}</Text>
                                                <Text className="text-[11px] text-gray-400 font-medium">{chat.topic}</Text>
                                            </View>
                                            <Text className="text-[11px] text-gray-400 font-medium ml-2">{chat.time}</Text>
                                        </View>
                                        <Text className="text-sm text-gray-500 mt-1" numberOfLines={1}>{chat.lastMsg}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                ) : (
                    /* --- 웹 스타일 채팅창 내부 --- */
                    <View className="flex-1 bg-[#F2F3F5]">
                        {/* 헤더 */}
                        <View className="flex-row items-center justify-between bg-white/95 px-4 py-3 border-b border-gray-200 z-30">
                            <View className="flex-row items-center">
                                <TouchableOpacity onPress={() => setView("list")} className="p-2">
                                    <ChevronLeft size={24} color="#4b5563" />
                                </TouchableOpacity>
                                <View className="ml-1">
                                    <Text className="font-bold text-[16px] text-gray-900" numberOfLines={1}>{selectedChat.name}</Text>
                                    <View className="flex-row items-center">
                                        <View className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-1" />
                                        <Text className="text-[11px] text-indigo-500 font-bold">멤버 확인 중</Text>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => setIsDrawerOpen(true)} className="p-2">
                                <MoreVertical size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>

                        {/* 공지사항 (웹 UI 스타일) */}
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

                        {/* 메시지 영역 */}
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

                        {/* 입력창 (웹 UI 스타일) */}
                        <View className="bg-white px-4 py-4 pb-10 border-t border-gray-100 flex-row items-center">
                            <TouchableOpacity className="p-1.5 mr-1"><Paperclip size={24} color="#9ca3af" /></TouchableOpacity>
                            <View className="flex-1 relative flex-row items-center">
                                <TextInput
                                    className="flex-1 bg-gray-100 rounded-2xl py-3 px-4 pr-10 text-[15px] focus:bg-white border border-transparent"
                                    placeholder="메시지를 입력하세요..."
                                    value={message}
                                    onChangeText={setMessage}
                                />
                                <TouchableOpacity className="absolute right-3"><Smile size={20} color="#d1d5db" /></TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                onPress={() => {/* 전송 로직 */}}
                                className={`ml-3 p-3 rounded-2xl shadow-lg ${message.trim() ? 'bg-indigo-600' : 'bg-gray-100'}`}
                            >
                                <Send size={20} color={message.trim() ? "white" : "#d1d5db"} fill={message.trim() ? "currentColor" : "none"} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}