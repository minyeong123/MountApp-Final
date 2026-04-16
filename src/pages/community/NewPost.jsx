import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, Modal, SafeAreaView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Star, StarHalf, X, Camera } from "lucide-react-native";
import * as ImagePicker from 'expo-image-picker'; // npx expo install expo-image-picker
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BACKEND_URL = "http://mountapp.mooo.com:8082";
const categories = ["산", "등산용품", "맛집", "숙소"];

// 별점 컴포넌트 (모바일 최적화: 0.5단위 탭 지원)
function StarRating({ rating, setRating }) {
    const handleStarPress = (star, isHalf) => {
        setRating(star - (isHalf ? 0.5 : 0));
    };

    return (
        <View className="flex-row space-x-2 mt-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
                <View key={star} className="flex-row">
                    <TouchableOpacity onPress={() => handleStarPress(star, true)}>
                        <StarHalf size={28} color="#fbbf24" fill={rating >= star - 0.5 ? "#fbbf24" : "transparent"} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleStarPress(star, false)} style={{ marginLeft: -15 }}>
                        <Star size={28} color="#fbbf24" fill={rating >= star ? "#fbbf24" : "transparent"} />
                    </TouchableOpacity>
                </View>
            ))}
        </View>
    );
}

export default function NewPost() {
    const navigation = useNavigation();
    const route = useRoute();
    const { isEdit = false, postData = {}, type: initialType = "post" } = route.params || {};

    const [title, setTitle] = useState(isEdit ? postData.title : "");
    const [content, setContent] = useState(isEdit ? (postData.comment || postData.postContents) : "");
    const [images, setImages] = useState([]); // {uri, name, type} 형태의 객체 배열
    const [rating, setRating] = useState(isEdit && postData.rating ? postData.rating : 0);
    const [category, setCategory] = useState(isEdit && postData.category ? postData.category : categories[0]);
    const [searchKeyword, setSearchKeyword] = useState(isEdit && postData.searchKeyword ? postData.searchKeyword : "");
    const [showModal, setShowModal] = useState(false);

    // 이미지 선택 핸들러
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            const newImages = result.assets.map(asset => ({
                uri: asset.uri,
                name: asset.fileName || `image_${Date.now()}.jpg`,
                type: 'image/jpeg'
            }));
            setImages([...images, ...newImages]);
        }
    };

    const handleRemoveImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        const token = await AsyncStorage.getItem("jwtToken");
        if (!token) {
            Alert.alert("알림", "로그인이 필요합니다.");
            return;
        }

        if (initialType === "review" && rating === 0) {
            Alert.alert("알림", "별점을 입력해주세요!");
            return;
        }

        const formData = new FormData();
        const postDto = {
            title,
            content,
            rating: initialType === "review" ? rating : 0,
            category: initialType === "review" ? category : "자유게시판",
            searchKeyword: category === "산" ? searchKeyword : null
        };

        // 네이티브 FormData 구성
        formData.append("data", {
            string: JSON.stringify(postDto),
            type: 'application/json',
        });

        images.forEach((img) => {
            formData.append("files", {
                uri: img.uri,
                name: img.name,
                type: img.type,
            });
        });

        try {
            await axios.post(`${BACKEND_URL}/api/posts`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`
                }
            });
            setShowModal(true);
        } catch (error) {
            Alert.alert("에러", "게시글 등록에 실패했습니다.");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="p-4">
                {/* 헤더 */}
                <View className="flex-row items-center bg-white p-3 rounded-xl border border-gray-100 mb-4">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="pr-4">
                        <Text className="text-gray-600 font-bold">뒤로</Text>
                    </TouchableOpacity>
                    <Text className="flex-1 text-center font-bold text-lg">
                        {isEdit ? "글 수정" : initialType === "review" ? "리뷰 작성" : "게시글 작성"}
                    </Text>
                    <View className="w-10" />
                </View>

                {/* 리뷰 전용 필터 */}
                {initialType === "review" && (
                    <View className="mb-4">
                        <View className="flex-row space-x-2 mb-2">
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    onPress={() => setCategory(cat)}
                                    className={`px-4 py-2 rounded-full border ${category === cat ? "bg-blue-500 border-blue-500" : "bg-white border-gray-200"}`}
                                >
                                    <Text className={`text-xs font-bold ${category === cat ? "text-white" : "text-gray-700"}`}>{cat}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {category === "산" && (
                            <TextInput
                                className="bg-white border border-gray-200 rounded-lg p-3 text-sm"
                                placeholder="산 이름을 입력하세요"
                                value={searchKeyword}
                                onChangeText={setSearchKeyword}
                            />
                        )}
                    </View>
                )}

                {/* 입력 폼 */}
                <TextInput
                    className="bg-white border border-gray-100 rounded-xl p-4 mb-4 font-bold text-[16px]"
                    placeholder="제목을 입력하세요"
                    value={title}
                    onChangeText={setTitle}
                />

                <TextInput
                    className="bg-white border border-gray-100 rounded-xl p-4 mb-4 h-64 text-start"
                    placeholder="내용을 입력하세요"
                    multiline
                    textAlignVertical="top"
                    value={content}
                    onChangeText={setContent}
                />

                {initialType === "review" && <StarRating rating={rating} setRating={setRating} />}

                {/* 하단 액션 버튼 */}
                <View className="flex-row justify-between items-center mb-6">
                    <TouchableOpacity
                        onPress={pickImage}
                        className="flex-row items-center bg-blue-50 px-4 py-3 rounded-xl space-x-2"
                    >
                        <Camera size={18} color="#3b82f6" />
                        <Text className="text-blue-600 font-bold">이미지 추가</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleSubmit}
                        className="bg-blue-500 px-8 py-3 rounded-xl"
                    >
                        <Text className="text-white font-bold text-lg">완료</Text>
                    </TouchableOpacity>
                </View>

                {/* 이미지 미리보기 */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row space-x-2 pb-10">
                    {images.map((img, i) => (
                        <View key={i} className="relative w-24 h-24 border border-gray-200 rounded-xl overflow-hidden">
                            <Image source={{ uri: img.uri }} className="w-full h-full" />
                            <TouchableOpacity
                                onPress={() => handleRemoveImage(i)}
                                className="absolute top-1 right-1 bg-black/50 rounded-full p-1"
                            >
                                <X size={14} color="white" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            </ScrollView>

            {/* 성공 모달 */}
            <Modal visible={showModal} transparent animationType="fade">
                <View className="flex-1 bg-black/40 justify-center items-center px-10">
                    <View className="bg-white p-8 rounded-3xl w-full items-center">
                        <Text className="text-2xl font-bold mb-2">{isEdit ? "수정 완료!" : "작성 완료!"}</Text>
                        <Text className="text-gray-500 mb-8 text-center">성공적으로 등록되었습니다.🌲</Text>
                        <TouchableOpacity
                            className="bg-blue-600 w-full py-4 rounded-2xl"
                            onPress={() => { setShowModal(false); navigation.navigate("Community"); }}
                        >
                            <Text className="text-white text-center font-bold text-lg">확인</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}