import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, SafeAreaView } from "react-native";
import { ChevronLeft, X, Heart, MessageSquare, Clock, Footprints, Star, Users } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

// 🏷️ 1. 임시 데이터 (Mock Data) 정의 - 산(mountains)을 배열 구조로 변경하여 안정성 확보
const MOCK_DATA = {
    mountains: [
        {
            id: "1",
            name: "북한산",
            height: "836m",
            location: "경기 고양시 · 서울 강북구",
            image: "https://images.unsplash.com/photo-1624835269324-7edcc7df0f00?w=500&q=80",
        }
    ],
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
            category: "산",
            title: "백운대 코스 다녀왔습니다!",
            text: "백운대 정상에서 보는 경치가 예술입니다. 다만 주말에는 사람이 정말 많아요. 정상 부근 바위가 미끄러우니 등산화 필수입니다!",
            rating: 5,
            date: "방금 전",
            image: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=150&q=80",
            user: "산넘어산"
        },
        {
            id: "2",
            category: "산",
            title: "초보자 가기에 무난한 정비 상태",
            text: "초보자가 가기엔 깔딱고개가 조금 힘들 수 있지만, 정비가 잘 되어 있습니다.",
            rating: 4,
            date: "1일 전",
            image: null,
            user: "Cloud"
        },
    ],
    mates: [
        {
            id: "1",
            title: "북한산 야간 산행 하실 분!",
            content: "날씨가 선선해서 야간 산행하기 딱 좋습니다. 랜턴 필수 지참해주세요!",
            schedule: "2026-06-13",
            time: "19:30",
            location: "북한산 우이역",
            currentMembers: 2,
            maxMembers: 7,
            level: "상급",
            author: "민",
            authorImage: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100&q=80",
            date: "방금 전",
            likes: 12,
            comments: 4,
            tags: ["야간산행", "상급"],
            image: "https://images.unsplash.com/photo-1624835269324-7edcc7df0f00?w=500&q=80"
        },
    ],
};

export default function SearchResultPage() {
    const { q } = useLocalSearchParams();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState(typeof q === "string" ? q : "북한산");
    const [activeTab, setActiveTab] = useState("전체");

    const tabs = ["전체", "산", "코스", "게시글", "리뷰", "메이트"];

    const SectionDivider = () => (
        activeTab === "전체" ? <View className="h-2 bg-gray-100 -mx-4 my-6" /> : null
    );

    // ================= [ 직관적이고 안정적인 필터링 로직 ] =================
    const getSearchWords = () => {
        const query = searchQuery.trim();
        if (!query) return [];

        // 안전하게 공백 기준으로 쪼개기
        const words = query.split(/\s+/).filter(w => w.length > 0);

        // 검색어 뒤에 습관적으로 붙이는 카테고리 불용어 목록
        const STOP_WORDS = ["코스", "메이트", "리뷰", "게시글", "게시판", "글", "산메이트"];

        // "산" 단독 입력 시 필터링 방지를 위해 STOP_WORDS에서 "산"은 제외하고 처리
        const filtered = words.map(w => {
            // 단어 끝에 불용어가 붙어있으면 제거 (예: "백운대코스" -> "백운대")
            let cleaned = w;
            STOP_WORDS.forEach(stop => {
                if (cleaned.length > stop.length && cleaned.endsWith(stop)) {
                    cleaned = cleaned.substring(0, cleaned.length - stop.length);
                }
            });
            return cleaned;
        }).filter(w => w.length > 0);

        return filtered.length > 0 ? filtered : words;
    };

    const searchWords = getSearchWords();

    // [유연한 매칭] 검색 단어 중 하나라도 타겟 텍스트에 포함되어 있으면 매칭 성공
    const matchWords = (targetText) => {
        if (!targetText) return false;
        if (searchWords.length === 0) return true; // 검색어 비어있을 때는 전체 보여줌
        return searchWords.some(word => targetText.toLowerCase().includes(word.toLowerCase()));
    };

    // 1. 산 필터링
    const filteredMountains = MOCK_DATA.mountains.filter(m =>
        matchWords(m.name) || matchWords(m.location)
    );

    // 2. 코스 필터링
    const filteredCourses = MOCK_DATA.courses.filter(course =>
        matchWords(course.name) || matchWords(course.description)
    );

    // 3. 게시글 필터링
    const filteredPosts = MOCK_DATA.posts.filter(post =>
        matchWords(post.title) || matchWords(post.content)
    );

    // 4. 리뷰 필터링
    const filteredReviews = MOCK_DATA.reviews.filter(review =>
        matchWords(review.title) || matchWords(review.text)
    );

    // 5. 메이트 모집 필터링
    const filteredMates = MOCK_DATA.mates.filter(mate =>
        matchWords(mate.title) ||
        matchWords(mate.content) ||
        searchWords.some(word => mate.tags.some(tag => tag.includes(word)))
    );
    // =======================================================================

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
                {(activeTab === "전체" || activeTab === "산") && filteredMountains.length > 0 && (
                    <View>
                        <Text className="font-bold text-lg mb-3 text-gray-900">산 <Text className="text-emerald-600">{filteredMountains.length}</Text></Text>
                        {filteredMountains.map((mountain) => (
                            <TouchableOpacity key={mountain.id} className="flex-row items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
                                <View className="w-20 h-20 bg-gray-200 rounded-xl overflow-hidden">
                                    <Image source={{ uri: mountain.image }} className="w-full h-full" resizeMode="cover" />
                                </View>
                                <View className="flex-1 ml-4">
                                    <Text className="font-bold text-[18px] text-gray-900">{mountain.name}</Text>
                                    <Text className="text-sm text-gray-500 mt-1">{mountain.height} · {mountain.location}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                        <SectionDivider />
                    </View>
                )}

                {/* 2. 코스 섹션 */}
                {(activeTab === "전체" || activeTab === "코스") && filteredCourses.length > 0 && (
                    <View>
                        <Text className="font-bold text-lg mb-3 text-gray-900">코스 <Text className="text-emerald-600">{filteredCourses.length}</Text></Text>
                        {filteredCourses.map((course) => (
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
                {(activeTab === "전체" || activeTab === "게시글") && filteredPosts.length > 0 && (
                    <View>
                        <Text className="font-bold text-lg mb-3 text-gray-900">게시글 <Text className="text-emerald-600">{filteredPosts.length}</Text></Text>
                        {filteredPosts.map((post) => (
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
                {(activeTab === "전체" || activeTab === "리뷰") && filteredReviews.length > 0 && (
                    <View>
                        <Text className="font-bold text-lg mb-3 text-gray-900">리뷰 <Text className="text-emerald-600">{filteredReviews.length}</Text></Text>
                        {filteredReviews.map((review) => (
                            <TouchableOpacity key={review.id} className="py-5 border-b border-gray-100 bg-white">
                                <View className="flex-row items-start mb-4">
                                    <View className="flex-1 mr-4">
                                        <View className="flex-row items-center mb-1.5">
                                            <Text className="text-gray-400 text-[11px] mr-2">
                                                {review.category || "리뷰"}
                                            </Text>
                                            <View className="flex-row items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={11}
                                                        color={i < Math.floor(review.rating) ? "#fbbf24" : "#d1d5db"}
                                                        fill={i < Math.floor(review.rating) ? "#fbbf24" : "transparent"}
                                                        style={{ marginRight: 1 }}
                                                    />
                                                ))}
                                                <Text className="ml-1 text-[11px] font-bold text-amber-500">
                                                    {Number(review.rating).toFixed(1)}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text className="font-bold text-gray-900 mb-1" numberOfLines={1}>
                                            {review.title}
                                        </Text>
                                        <Text className="text-gray-500 text-[13px] leading-5" numberOfLines={2}>
                                            {review.text}
                                        </Text>
                                    </View>
                                    {review.image && (
                                        <View className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 self-center">
                                            <Image source={{ uri: review.image }} className="w-full h-full" resizeMode="cover" />
                                        </View>
                                    )}
                                </View>
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-gray-400 text-[11px]">작성자: {review.user}</Text>
                                    <Text className="text-gray-400 text-[11px]">{review.date}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                        <SectionDivider />
                    </View>
                )}

                {/* 5. 🏃‍♂️ 메이트 섹션 */}
                {(activeTab === "전체" || activeTab === "메이트") && filteredMates.length > 0 && (
                    <View className="mb-12">
                        <Text className="font-bold text-lg mb-4 text-gray-900">
                            메이트 모집 <Text className="text-emerald-600">{filteredMates.length}</Text>
                        </Text>

                        {filteredMates.map((mate) => (
                            <View key={mate.id} className="mb-6 bg-white border border-gray-100 rounded-3xl p-4 shadow-sm">
                                <View className="flex-row items-center justify-between mb-3">
                                    <View className="flex-row items-center">
                                        <View className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden">
                                            <Image source={{ uri: mate.authorImage }} className="w-full h-full" />
                                        </View>
                                        <View className="ml-2.5">
                                            <Text className="font-bold text-sm text-gray-800">{mate.author}</Text>
                                            <Text className="text-[11px] text-gray-400">{mate.date}</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity className="p-1">
                                        <Text className="text-gray-400 font-bold text-base">···</Text>
                                    </TouchableOpacity>
                                </View>

                                {mate.image && (
                                    <View className="w-full h-48 rounded-2xl overflow-hidden relative mb-3 bg-gray-100">
                                        <Image source={{ uri: mate.image }} className="w-full h-full" resizeMode="cover" />
                                        <View className="absolute top-3 left-3 bg-white/90 px-2.5 py-1 rounded-lg">
                                            <Text className="text-[11px] font-bold text-gray-800">{mate.schedule}</Text>
                                        </View>
                                        <View className="absolute top-3 right-3 bg-red-500 px-2.5 py-1 rounded-lg">
                                            <Text className="text-[11px] font-bold text-white">{mate.level}</Text>
                                        </View>
                                        <View className="absolute bottom-3 right-3 bg-black/60 px-3 py-1 rounded-full flex-row items-center">
                                            <Users size={12} color="#ffffff" />
                                            <Text className="text-[11px] font-bold text-white ml-1">
                                                {mate.currentMembers}/{mate.maxMembers}명 참여중
                                            </Text>
                                        </View>
                                    </View>
                                )}

                                <View className="flex-row items-center justify-between mb-2">
                                    <View className="flex-row items-center gap-x-3">
                                        <TouchableOpacity className="flex-row items-center">
                                            <Heart size={20} color="#4b5563" />
                                            <Text className="text-xs text-gray-500 ml-1 font-medium">{mate.likes}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity className="flex-row items-center">
                                            <MessageSquare size={20} color="#4b5563" />
                                            <Text className="text-xs text-gray-500 ml-1 font-medium">{mate.comments}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity className="bg-orange-400 px-4 py-1.5 rounded-full">
                                        <Text className="text-xs font-bold text-white">자세히 보기</Text>
                                    </TouchableOpacity>
                                </View>

                                <View className="mt-1">
                                    <Text className="font-bold text-[16px] text-gray-900 mb-0.5" numberOfLines={1}>
                                        {mate.title}
                                    </Text>
                                    <View className="flex-row items-center gap-x-3 my-1.5">
                                        <Text className="text-xs text-orange-500 font-semibold">📍 {mate.location || "미상"}</Text>
                                        <Text className="text-xs text-orange-500 font-semibold">🕒 {mate.time || "미상"}</Text>
                                    </View>
                                    <Text className="text-sm text-gray-500 leading-5 mb-3" numberOfLines={1}>
                                        {mate.content}
                                    </Text>
                                </View>

                                <View className="flex-row flex-wrap gap-1.5">
                                    {mate.tags.map((tag, idx) => (
                                        <View key={idx} className="bg-blue-50 px-2.5 py-1 rounded-md">
                                            <Text className="text-xs text-blue-500 font-medium">#{tag}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* ⚠️ 예외 처리 화면 */}
                {filteredMountains.length === 0 && filteredCourses.length === 0 && filteredPosts.length === 0 && filteredReviews.length === 0 && filteredMates.length === 0 && (
                    <View className="py-20 items-center justify-center">
                        <Text className="text-gray-400 text-sm">'{searchQuery}'에 대한 검색 결과가 없습니다.</Text>
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}