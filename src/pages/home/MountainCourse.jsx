// src/pages/home/MountainWeather.jsx

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import axios from "axios";
// 네이티브용 아이콘 라이브러리 사용
import { Sunrise, Sunset, Cloud, Sun, Droplets, Thermometer, Wind } from "lucide-react-native";

const API_KEY = "7435802c8b57480c8b263a61cbecb98c";

export default function MountainWeather({ mountain }) {
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!mountain) return;

        // 산의 위도, 경도 데이터가 있다고 가정 (없으면 기본값 사용)
        const lat = mountain.latitude || 37.5665;
        const lon = mountain.longitude || 126.9780;

        axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`)
            .then((res) => {
                setWeatherData(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("날씨 로딩 실패:", err);
                setLoading(false);
            });
    }, [mountain]);

    if (loading) return <ActivityIndicator size="small" color="#3b82f6" style={{ marginVertical: 20 }} />;

    if (!weatherData) return <Text style={styles.errorText}>날씨 정보를 불러올 수 없습니다.</Text>;

    const formatTime = (timestamp) => {
        const date = new Date(timestamp * 1000);
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    return (
        <View style={styles.container}>
            <View style={styles.mainRow}>
                <View style={styles.tempBox}>
                    <Thermometer size={24} color="#ef4444" />
                    <Text style={styles.tempText}>{Math.round(weatherData.main.temp)}°C</Text>
                    <Text style={styles.descText}>{weatherData.weather[0].description}</Text>
                </View>
                <View style={styles.verticalLine} />
                <View style={styles.extraBox}>
                    <View style={styles.infoRow}>
                        <Droplets size={16} color="#3b82f6" />
                        <Text style={styles.infoLabel}> 습도 </Text>
                        <Text style={styles.infoValue}>{weatherData.main.humidity}%</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Wind size={16} color="#10b981" />
                        <Text style={styles.infoLabel}> 풍속 </Text>
                        <Text style={styles.infoValue}>{weatherData.wind.speed}m/s</Text>
                    </View>
                </View>
            </View>

            <View style={styles.sunRow}>
                <View style={styles.sunItem}>
                    <Sunrise size={20} color="#f97316" />
                    <Text style={styles.sunText}>일출 {formatTime(weatherData.sys.sunrise)}</Text>
                </View>
                <View style={styles.sunItem}>
                    <Sunset size={20} color="#6366f1" />
                    <Text style={styles.sunText}>일몰 {formatTime(weatherData.sys.sunset)}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        marginTop: 10,
    },
    mainRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        marginBottom: 20,
    },
    tempBox: {
        alignItems: "center",
    },
    tempText: {
        fontSize: 32,
        fontWeight: "900",
        color: "#1f2937",
    },
    descText: {
        fontSize: 14,
        color: "#6b7280",
        marginTop: 4,
    },
    verticalLine: {
        width: 1,
        height: 40,
        backgroundColor: "#e5e7eb",
    },
    extraBox: {
        gap: 8,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    infoLabel: {
        fontSize: 13,
        color: "#9ca3af",
    },
    infoValue: {
        fontSize: 13,
        fontWeight: "700",
        color: "#374151",
    },
    sunRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderTopWidth: 1,
        borderTopColor: "#f3f4f6",
        paddingTop: 15,
    },
    sunItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    sunText: {
        fontSize: 13,
        color: "#4b5563",
        fontWeight: "600",
    },
    errorText: {
        textAlign: "center",
        color: "#9ca3af",
        padding: 20,
    }
});