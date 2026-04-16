import React, { useState, useEffect } from "react";
import {
    View, Text, ScrollView, Image, TouchableOpacity,
    SafeAreaView, ActivityIndicator, Dimensions, StyleSheet
} from "react-native";
import { useRouter } from "expo-router";
import { Siren, Search, MessageCircleMore } from "lucide-react-native";
import DisasterBanner from "../../../components/DisasterBanner";

const logo = require("../../assets/logo.png");

export default function Home() {
    const router = useRouter();
    const [mountains, setMountains] = useState([]);
    const [disasterAlerts, setDisasterAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fakeMountains = [
            { id: 1, name: "설악산", description: "강원도 속초시에 있는 높이 1,708m의 산입니다." },
            { id: 2, name: "북한산", description: "서울과 경기도에 걸쳐 있는 국립공원입니다." },
            { id: 3, name: "한라산", description: "제주도에 위치한 대한민국 최고봉 산입니다." },
        ];
        const fakeAlerts = [
            { id: "test-fire", type: "FIRE", message: "[실시간] 전국 산불 조심 기간 안내", time: "현재" },
            { id: "test-land", type: "LANDSLIDE", message: "[안내] 등산 전 기상 정보를 확인하세요", time: "현재" }
        ];
        setMountains(fakeMountains);
        setDisasterAlerts(fakeAlerts);
        setLoading(false);
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* 헤더 */}
                <View style={styles.header}>
                    <View style={styles.logoArea}>
                        <Image source={logo} style={styles.logoImage} resizeMode="contain" />
                        <Text style={styles.headerTitle}>MountApp</Text>
                    </View>
                    <View style={styles.iconArea}>
                        <TouchableOpacity onPress={() => router.push("/search")}>
                            <Search size={24} color="black" />
                        </TouchableOpacity>
                        <TouchableOpacity style={{ marginLeft: 15 }} onPress={() => router.push("/chat")}>
                            <MessageCircleMore size={24} color="black" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 산악 가이드 - 클릭 이벤트 추가됨 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>산악 가이드 정보</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#15803d" />
                        ) : (
                            mountains.map((mt) => (
                                <TouchableOpacity
                                    key={mt.id}
                                    style={styles.card}
                                    onPress={() => router.push(`/mountain/${mt.id}`)}
                                >
                                    <View style={styles.cardImagePlaceholder}>
                                        <Image source={logo} style={styles.cardLogoSmall} resizeMode="contain" />
                                    </View>
                                    <View style={styles.cardContent}>
                                        <Text style={styles.cardTitle}>{mt.name}</Text>
                                        <Text style={styles.cardDesc} numberOfLines={2}>{mt.description}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                </View>

                {/* 재난 알림 */}
                <View style={styles.section}>
                    <View style={styles.alertHeader}>
                        <Siren size={20} color="#b91c1c" />
                        <Text style={styles.alertTitle}>실시간 재난 알림</Text>
                    </View>
                    <View style={styles.alertBox}>
                        <DisasterBanner alerts={disasterAlerts} />
                    </View>
                </View>

                {/* 유의사항 */}
                <View style={styles.noticeBox}>
                    <Text style={styles.noticeTitle}>☑️ 유의사항</Text>
                    <Text style={styles.noticeText}>• 등산 전 반드시 기상청 정보를 확인하세요.</Text>
                    <Text style={styles.noticeText}>• 비상 상황 발생 시 즉시 119에 신고하세요.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    scrollView: { flex: 1, paddingHorizontal: 16 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15 },
    logoArea: { flexDirection: 'row', alignItems: 'center' },
    logoImage: { width: 35, height: 35, borderRadius: 20 },
    headerTitle: { fontSize: 20, fontWeight: '900', color: '#15803d', marginLeft: 8 },
    iconArea: { flexDirection: 'row' },
    section: { marginBottom: 25 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 5 },
    card: { width: 220, marginRight: 15, backgroundColor: 'white', borderRadius: 15, borderWidth: 1, borderColor: '#eee', overflow: 'hidden' },
    cardImagePlaceholder: { height: 100, backgroundColor: '#f9f9f9', alignItems: 'center', justifyContent: 'center' },
    cardLogoSmall: { width: 40, height: 40, opacity: 0.2 },
    cardContent: { padding: 12 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    cardDesc: { fontSize: 13, color: '#666' },
    alertHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    alertTitle: { fontSize: 18, fontWeight: 'bold', color: '#b91c1c', marginLeft: 6 },
    alertBox: { backgroundColor: '#fef2f2', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#fee2e2' },
    noticeBox: { backgroundColor: '#f3f4f6', padding: 20, borderRadius: 15, borderLeftWidth: 4, borderLeftColor: '#9ca3af', marginBottom: 30 },
    noticeTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
    noticeText: { fontSize: 13, color: '#4b5563', marginBottom: 4 }
});