import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, SafeAreaView } from "react-native";
import { ChevronLeft, X, Heart, MessageSquare, Clock, Footprints } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

// 🏷️ 1. 임시 데이터 (Mock Data) 정의
const MOCK_DATA = {
    mountain: {
        id: "1",
        name: "북한산",
        height: "836m",
        location: "경기 고양시 · 서울 강북구",
        image: "https://images.unsplash.com/photo-1624835269324-7edcc7df0f00?w=500&q=80",
    },
    courses: [
        {
            id: "1",
            name: "북한산 백운대 코스",
            distance: "4.2km",
            time: "2시간 30분",
            level: "중급",
            description: "북한산의 최고봉 백운대를 오르는 코스로, 인수봉과 만경대의 절경을 감상할 수 있습니다.",
            image: "https://images.unsplash.com/photo-1624835269324-7edcc7df0f00?w=300&q=80"
        },
        {
            id: "2",
            name: "북한산 우이령길 코스",
            distance: "6.8km",
            time: "3시간",
            level: "초급",
            description: "자연 생태계가 잘 보존된 완만한 산책길로, 가족 단위 등산객에게 추천합니다.",
            image: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=300&q=80"
        },
    ],
    posts: [
        {
            id: "1",
            boardType: "자유게시판",
            title: "북한산 정말 이뻐요!",
            content: "날씨가 어제보다는 덜 춥습니다\n바람이 안 불어서 그런듯...",
            author: "등린이탈출기",
            date: "방금 전",
            likes: 0,
            comments: 1,
            image: "https://images.unsplash.com/photo-1624835269324-7edcc7df0f00?w=150&q=80"
        },
        {
            id: "2",
            boardType: "자유게시판",
            title: "asdasd",
            content: "asd",
            author: "산이좋아",
            date: "방금 전",
            likes: 0,
            comments: 1,
            image: null
        },
    ],
    reviews: [
        {
            id: "1",
            user: "김산악",
            rating: "⭐️⭐️⭐️⭐️⭐️",
            text: "백운대 정상에서 보는 경치가 예술입니다. 다만 주말에는 사람이 정말 많아요. 정상 부근 바위가 미끄러우니 등산화 필수입니다!",
            date: "방금 전",
            image: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=150&q=80"
        },
        {
            id: "2",
            user: "이등산",
            rating: "⭐️⭐️⭐️⭐️☆",
            text: "초보자가 가기엔 깔딱고개가 조금 힘들 수 있지만, 정비가 잘 되어 있습니다.",
            date: "1일 전",
            image: null
        },
    ],
    mates: [
        { id: "1", title: "🏃‍♂️ 토요일 오전 북한산 같이 가실 분! (2030)", schedule: "06/13(토) 08:00", members: "3/4명" },
    ],
};

export default function SearchResultPage() {
    const { q } = useLocalSearchParams();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState(typeof q === "string" ? q : "북한산");
    const [activeTab, setActiveTab] = useState("전체");

    const tabs = ["전체", "산", "코스", "게시글", "리뷰", "메이트"];

    // 💡 재사용 가능한 공통 회색 구분선 컴포넌트 (전체 탭일 때만 렌더링)
    const SectionDivider = () => (
        activeTab === "전체" ? <View className="h-2 bg-gray-100 -mx-4 my-6" /> : null
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* 🔍 상단 검색 바 & 탭 바 */}
            <View className="px-4 pt-2 pb-4 bg-white border-b border-gray-100 mt-6">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <ChevronLeft size={28} color="#1f2937" />
                    </TouchableOpacity>
                    <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-4 h-11">
                        <TextInput
                            className="flex-1 text-sm text-gray-800 pr-2"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="검색어 입력"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery("")}>
                                <X size={18} color="#9ca3af" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* 가로 스크롤 탭 */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-5">
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            className={`mr-6 pb-2 ${activeTab === tab ? "border-b-2 border-emerald-600" : ""}`}
                        >
                            <Text className={`text-[15px] font-bold ${activeTab === tab ? "text-emerald-600" : "text-gray-400"}`}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* 📜 메인 스크롤 콘텐츠 */}
            <ScrollView className="flex-1 p-4 bg-white" showsVerticalScrollIndicator={false}>

                {/* 1. 산 섹션 */}
                {(activeTab === "전체" || activeTab === "산") && (
                    <View>
                        <Text className="font-bold text-lg mb-3 text-gray-900">산 <Text className="text-emerald-600">1</Text></Text>
                        <TouchableOpacity className="flex-row items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
                            <View className="w-20 h-20 bg-gray-200 rounded-xl overflow-hidden">
                                <Image source={{ uri: MOCK_DATA.mountain.image }} className="w-full h-full" resizeMode="cover" />
                            </View>
                            <View className="flex-1 ml-4">
                                <Text className="font-bold text-[18px] text-gray-900">{MOCK_DATA.mountain.name}</Text>
                                <Text className="text-sm text-gray-500 mt-1">{MOCK_DATA.mountain.height} · {MOCK_DATA.mountain.location}</Text>
                            </View>
                        </TouchableOpacity>
                        <SectionDivider />
                    </View>
                )}

                {/* 2. 코스 섹션 */}
                {(activeTab === "전체" || activeTab === "코스") && (
                    <View>
                        <Text className="font-bold text-lg mb-3 text-gray-900">코스 <Text className="text-emerald-600">{MOCK_DATA.courses.length}</Text></Text>
                        {MOCK_DATA.courses.map((course) => (
                            <TouchableOpacity key={course.id} className="flex-row mb-4 bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                                <View className="w-28 h-28 bg-gray-100 rounded-l-3xl overflow-hidden">
                                    <Image source={{ uri: course.image }} className="w-full h-full" resizeMode="cover" />
                                </View>
                                <View className="flex-1 p-4 justify-between">
                                    <View>
                                        <Text className="font-bold text-[16px] text-slate-900">{course.name}</Text>
                                        <Text className="text-xs text-gray-400 mt-1 leading-4" numberOfLines={2}>{course.description}</Text>
                                    </View>
                                    <View className="flex-row items-center mt-2 gap-x-4">
                                        <View className="flex-row items-center">
                                            <Clock size={14} color="#059669" />
                                            <Text className="text-xs font-bold text-slate-700 ml-1">{course.time}</Text>
                                        </View>
                                        <View className="flex-row items-center">
                                            <Footprints size={14} color="#059669" />
                                            <Text className="text-xs font-bold text-slate-700 ml-1">{course.distance}</Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                        <SectionDivider />
                    </View>
                )}

                {/* 3. 게시글 섹션 */}
                {(activeTab === "전체" || activeTab === "게시글") && (
                    <View>
                        <Text className="font-bold text-lg mb-3 text-gray-900">게시글 <Text className="text-emerald-600">{MOCK_DATA.posts.length}</Text></Text>
                        {MOCK_DATA.posts.map((post) => (
                            <TouchableOpacity key={post.id} className="py-4 border-b border-gray-100">
                                <View className="flex-row justify-between items-start">
                                    <View className="flex-1 pr-2">
                                        <Text className="text-xs text-gray-400 font-medium mb-1">{post.boardType}</Text>
                                        <Text className="font-bold text-[16px] text-slate-900" numberOfLines={1}>{post.title}</Text>
                                        <Text className="text-sm text-gray-500 mt-1.5 leading-5" numberOfLines={2}>{post.content}</Text>
                                    </View>
                                    {post.image && (
                                        <View className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden ml-2 mt-2">
                                            <Image source={{ uri: post.image }} className="w-full h-full" resizeMode="cover" />
                                        </View>
                                    )}
                                </View>
                                <View className="flex-row items-center justify-between mt-4">
                                    <View className="flex-row items-center gap-x-3">
                                        <View className="flex-row items-center">
                                            <Heart size={15} color="#9ca3af" />
                                            <Text className="text-xs text-gray-400 ml-1">{post.likes}</Text>
                                        </View>
                                        <View className="flex-row items-center">
                                            <MessageSquare size={15} color="#9ca3af" />
                                            <Text className="text-xs text-gray-400 ml-1">{post.comments}</Text>
                                        </View>
                                    </View>
                                    <Text className="text-xs text-gray-400">{post.date}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                        <SectionDivider />
                    </View>
                )}

                {/* 4. 리뷰 섹션 */}
                {(activeTab === "전체" || activeTab === "리뷰") && (
                    <View>
                        <Text className="font-bold text-lg mb-3 text-gray-900">리뷰 <Text className="text-emerald-600">{MOCK_DATA.reviews.length}</Text></Text>
                        {MOCK_DATA.reviews.map((review) => (
                            <TouchableOpacity key={review.id} className="py-4 border-b border-gray-100">
                                <View className="flex-row justify-between items-start">
                                    <View className="flex-1 pr-2">
                                        <Text className="text-xs text-gray-400 font-medium mb-1">{review.user}</Text>
                                        <Text className="font-bold text-[15px] text-amber-500 mb-1">{review.rating}</Text>
                                        <Text className="text-sm text-gray-500 mt-1 leading-5" numberOfLines={2}>{review.text}</Text>
                                    </View>

                                    {review.image && (
                                        <View className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden ml-2 mt-2">
                                            <Image source={{ uri: review.image }} className="w-full h-full" resizeMode="cover" />
                                        </View>
                                    )}
                                </View>

                                <View className="flex-row items-center justify-end mt-4">
                                    <Text className="text-xs text-gray-400">{review.date}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                        <SectionDivider />
                    </View>
                )}

                {/* 5. 메이트 섹션 */}
                {(activeTab === "전체" || activeTab === "메이트") && (
                    <View className="mb-12">
                        <Text className="font-bold text-lg mb-3 text-gray-900">메이트 모집 <Text className="text-emerald-600">{MOCK_DATA.mates.length}</Text></Text>
                        {MOCK_DATA.mates.map((mate) => (
                            <TouchableOpacity key={mate.id} className="p-4 mb-3 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
                                <Text className="font-bold text-[15px] text-gray-800">{mate.title}</Text>
                                <View className="flex-row items-center justify-between mt-3">
                                    <Text className="text-xs text-gray-500">📅 {mate.schedule}</Text>
                                    <View className="bg-emerald-50 px-2 py-1 rounded-md">
                                        <Text className="text-xs text-emerald-700 font-bold">{mate.members}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}