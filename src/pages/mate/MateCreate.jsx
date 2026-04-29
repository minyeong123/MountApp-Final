import React, { useState } from 'react';
import {
    View, Text, TextInput, ScrollView, TouchableOpacity
    ,Alert, Platform, Dimensions
} from 'react-native';
import {
    ChevronLeft, Search, Calendar, Clock, Camera,
    MapPin, X, Plus
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider'; // 'expo install @react-native-community/slider' 필요

const { width } = Dimensions.get('window');

export default function MateCreate() {
    const router = useRouter();

    const BACKEND_URL = Platform.OS === 'android' ? "http://10.0.2.2:8082" : "http://localhost:8082";

    // --- States ---
    const [title, setTitle] = useState('');
    const [mountain, setMountain] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('08:00');
    const [location, setLocation] = useState('');
    const [capacity, setCapacity] = useState(4);
    const [level, setLevel] = useState('중급');

    // 상세 일정 상태
    const [schedules, setSchedules] = useState([{ id: Date.now(), time: '08:00', plan: '', description: '' }]);
    // 태그 상태
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    // 이미지 (현재는 placeholder)
    const [images, setImages] = useState([]);

    // --- Functions ---
    const addSchedule = () => setSchedules([...schedules, { id: Date.now(), time: '', plan: '', description: '' }]);
    const updateSchedule = (id, field, value) => setSchedules(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    const removeSchedule = (id) => schedules.length > 1 && setSchedules(schedules.filter(s => s.id !== id));

    const addTag = () => {
        const trimmed = tagInput.trim();
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => setTags(tags.filter(tag => tag !== tagToRemove));

    const handleSubmit = async () => {
        if (!title || !mountain || !location) {
            Alert.alert("알림", "필수 정보를 모두 입력해주세요!");
            return;
        }
        // 전송 로직 생략 (기존 handleSubmit 참고)
        Alert.alert("성공", "모임이 등록되었습니다!");
        router.back();
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center px-4 pt-14 pb-4 bg-white border-b border-gray-50">
                <TouchableOpacity onPress={() => router.back()}>
                    <ChevronLeft size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text className="flex-1 text-center font-bold text-[16px]">모임 만들기</Text>
                <View className="w-6" />
            </View>

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                {/* 1. Photo Section */}
                <View className="mt-6 mb-10">
                    <Text className="font-extrabold text-[17px] mb-4">사진 등록 (최대 5장)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                        <TouchableOpacity className="w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl items-center justify-center mr-2">
                            <Camera size={24} color="#9CA3AF" />
                            <Text className="text-[10px] text-gray-400 mt-1 font-bold">{images.length}/5</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* 2. Mountain & Title Section */}
                <View className="space-y-8 mb-10">
                    <View className="mb-6">
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

                    <View className="mb-6">
                        <Text className="font-extrabold text-[17px] mb-4">제목</Text>
                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            placeholder="제목을 입력해주세요"
                            className="bg-gray-50 border border-gray-200 rounded-2xl py-4 px-5 text-[15px]"
                        />
                    </View>

                    <View className="mb-6">
                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            placeholder="상세 설명을 입력해주세요"
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                            className="h-40 bg-gray-50 border border-gray-200 rounded-2xl p-5 text-[15px]"
                        />
                    </View>
                </View>

                {/* 3. Date & Location */}
                <View className="mb-10">
                    <View className="flex-row space-x-3 mb-4">
                        <View className="flex-1 relative flex-row items-center bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 mr-2">
                            <Calendar size={16} color="#3CD371" />
                            <TextInput value={date} onChangeText={setDate} className="flex-1 ml-2 text-[13px]" />
                        </View>
                        <View className="flex-1 relative flex-row items-center bg-gray-50 border border-gray-100 rounded-xl px-3 py-3">
                            <Clock size={16} color="#3CD371" />
                            <TextInput value={time} onChangeText={setTime} className="flex-1 ml-2 text-[13px]" />
                        </View>
                    </View>
                    <View className="relative flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4">
                        <MapPin size={20} color="#3CD371" />
                        <TextInput
                            value={location}
                            onChangeText={setLocation}
                            placeholder="상세 모임 장소"
                            className="flex-1 ml-3 text-[15px]"
                        />
                    </View>
                </View>

                {/* 4. Capacity & Level */}
                <View className="mb-10">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="font-extrabold text-[17px]">모집 인원</Text>
                        <View className="bg-green-50 px-4 py-1.5 rounded-full">
                            <Text className="text-[#3CD371] font-bold">{capacity}명</Text>
                        </View>
                    </View>
                    <Slider
                        style={{width: '100%', height: 40}}
                        minimumValue={2}
                        maximumValue={10}
                        step={1}
                        value={capacity}
                        onValueChange={setCapacity}
                        minimumTrackTintColor="#3CD371"
                        maximumTrackTintColor="#F3F4F6"
                        thumbTintColor="#3CD371"
                    />

                    <View className="flex-row space-x-3 mt-6">
                        {['초급', '중급', '상급'].map((id) => (
                            <TouchableOpacity
                                key={id}
                                onPress={() => setLevel(id)}
                                className={`flex-1 items-center py-4 rounded-2xl border-2 mr-2 ${level === id ? 'border-[#3CD371] bg-green-50' : 'border-gray-50 bg-white'}`}
                            >
                                <Text className={`font-bold ${level === id ? 'text-[#3CD371]' : 'text-gray-400'}`}>{id}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* 5. 상세 일정 Section */}
                <View className="mb-10">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="font-extrabold text-[17px]">상세 일정</Text>
                        <TouchableOpacity onPress={addSchedule} className="flex-row items-center">
                            <Plus size={16} color="#3CD371" />
                            <Text className="text-[#3CD371] text-[14px] font-bold ml-1">추가</Text>
                        </TouchableOpacity>
                    </View>
                    <View className="space-y-4">
                        {schedules.map((schedule) => (
                            <View key={schedule.id} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl mb-4">
                                <View className="flex-row mb-3">
                                    <TextInput
                                        value={schedule.time}
                                        onChangeText={(v) => updateSchedule(schedule.id, 'time', v)}
                                        placeholder="08:00"
                                        className="w-20 bg-white border border-gray-200 rounded-lg py-1 px-2 text-[12px] mr-2"
                                    />
                                    <TextInput
                                        value={schedule.plan}
                                        onChangeText={(v) => updateSchedule(schedule.id, 'plan', v)}
                                        placeholder="장소/활동"
                                        className="flex-1 bg-white border border-gray-200 rounded-lg py-1 px-3 text-[12px] font-semibold"
                                    />
                                    {schedules.length > 1 && (
                                        <TouchableOpacity onPress={() => removeSchedule(schedule.id)} className="ml-2 justify-center">
                                            <X size={18} color="#D1D5DB" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <TextInput
                                    value={schedule.description}
                                    onChangeText={(v) => updateSchedule(schedule.id, 'description', v)}
                                    placeholder="상세 설명"
                                    className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-[11px] h-10"
                                />
                            </View>
                        ))}
                    </View>
                </View>

                {/* 6. Tag Section */}
                <View className="mb-10">
                    <Text className="font-extrabold text-[17px] mb-4">태그 (#)</Text>
                    <View className="flex-row flex-wrap gap-2 p-3 border border-gray-100 rounded-2xl bg-white min-h-[56px] items-center">
                        {tags.map((tag) => (
                            <View key={tag} className="bg-green-50 flex-row items-center px-3 py-1.5 rounded-full mr-2 mb-2">
                                <Text className="text-[#3CD371] text-[13px] font-bold">#{tag}</Text>
                                <TouchableOpacity onPress={() => removeTag(tag)} className="ml-1">
                                    <X size={12} color="#3CD371" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        <TextInput
                            value={tagInput}
                            onChangeText={setTagInput}
                            onSubmitEditing={addTag}
                            placeholder={tags.length === 0 ? "태그 입력 후 엔터" : ""}
                            className="flex-1 text-[14px] min-w-[100px]"
                        />
                    </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    className="bg-[#3CD371] py-5 rounded-2xl shadow-lg mb-20 active:opacity-90"
                >
                    <Text className="text-white text-center font-black text-[18px]">모임 등록하기</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}