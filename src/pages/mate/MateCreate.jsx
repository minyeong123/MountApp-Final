import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { ChevronLeft, Search, Calendar, Clock, Camera, MapPin } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function MateCreate() {
    const navigation = useNavigation();

    // 로컬호스트 주소 설정
    const BACKEND_URL = Platform.OS === 'android' ? "http://10.0.2.2:8080" : "http://localhost:8080";

    const [title, setTitle] = useState('');
    const [images, setImages] = useState([]);
    const [mountain, setMountain] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('08:00');
    const [level, setLevel] = useState('중급');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');

    const [mountainList, setMountainList] = useState([]);

    useEffect(() => {
        fetch(`${BACKEND_URL}/api/mountains`)
            .then(res => res.ok ? res.json() : [])
            .then(data => setMountainList(data))
            .catch(err => console.error('산 정보 로딩 에러:', err));
    }, []);

    const handleSubmit = async () => {
        if (!title || !mountain || !location) {
            Alert.alert("알림", "필수 정보를 모두 입력해주세요!");
            return;
        }
        Alert.alert("성공", "모임이 등록되었습니다!");
        navigation.goBack();
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center p-4 pt-12 bg-white border-b border-gray-50">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeft size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text className="flex-1 text-center font-bold text-[16px]">모임 만들기</Text>
                <View className="w-6" />
            </View>

            <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
                {/* Photo Section */}
                <View className="mb-10">
                    <Text className="font-extrabold text-[17px] mb-4">사진 등록 (최대 5장)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                        <TouchableOpacity className="w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl items-center justify-center mr-2">
                            <Camera size={24} color="#9CA3AF" />
                            <Text className="text-[10px] text-gray-400 mt-1 font-bold">{images.length}/5</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* Input Section */}
                <View className="space-y-6 mb-10">
                    {/* Mountain Search */}
                    <View>
                        <Text className="font-extrabold text-[17px] mb-4">어떤 산을 가시나요?</Text>
                        <View className="relative">
                            <View className="absolute left-4 top-4 z-10">
                                <Search size={20} color="#9CA3AF" />
                            </View>
                            <TextInput
                                value={mountain}
                                onChangeText={setMountain}
                                placeholder="산 이름을 검색해주세요"
                                className="bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-[15px]"
                            />
                        </View>
                    </View>

                    {/* Title */}
                    <View>
                        <Text className="font-extrabold text-[17px] mb-4">제목</Text>
                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            placeholder="제목을 입력해주세요"
                            className="bg-gray-50 border border-gray-200 rounded-2xl py-4 px-5 text-[15px]"
                        />
                    </View>

                    {/* Description */}
                    <View>
                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            placeholder="상세 설명을 입력해주세요"
                            multiline
                            numberOfLines={6}
                            className="h-40 bg-gray-50 border border-gray-200 rounded-2xl p-5 text-[15px]"
                            style={{ textAlignVertical: 'top' }}
                        />
                    </View>
                </View>

                {/* Date & Location */}
                <View className="space-y-4 mb-10">
                    <View className="flex-row space-x-3">
                        <View className="flex-1 relative justify-center">
                            <View className="absolute left-3 z-10"><Calendar size={16} color="#3CD371" /></View>
                            <TextInput value={date} className="bg-gray-50 border border-gray-100 rounded-xl py-3 pl-9 text-[13px]" />
                        </View>
                        <View className="flex-1 relative justify-center">
                            <View className="absolute left-3 z-10"><Clock size={16} color="#3CD371" /></View>
                            <TextInput value={time} className="bg-gray-50 border border-gray-100 rounded-xl py-3 pl-9 text-[13px]" />
                        </View>
                    </View>
                    <View className="relative justify-center">
                        <View className="absolute left-4 z-10"><MapPin size={20} color="#3CD371" /></View>
                        <TextInput
                            value={location}
                            onChangeText={setLocation}
                            placeholder="상세 모임 장소"
                            className="bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-[15px]"
                        />
                    </View>
                </View>

                {/* Level Selection */}
                <View className="mb-10">
                    <Text className="font-extrabold text-[17px] mb-4">난이도</Text>
                    <View className="flex-row space-x-3">
                        {['초급', '중급', '상급'].map((id) => (
                            <TouchableOpacity
                                key={id}
                                onPress={() => setLevel(id)}
                                className={`flex-1 items-center py-4 rounded-2xl border-2 ${level === id ? 'border-[#3CD371] bg-green-50' : 'border-gray-50 bg-white'}`}
                            >
                                <Text className={`font-bold ${level === id ? 'text-[#3CD371]' : 'text-gray-400'}`}>{id}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    className="bg-[#3CD371] py-5 rounded-2xl shadow-lg mb-20"
                >
                    <Text className="text-white text-center font-black text-[18px]">모임 등록하기</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}