import { Link } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';

export default function ModalScreen() {
    return (
        <View style={styles.container}>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>이것은 모달창입니다</Text>
            <Link href="/" style={styles.link}>
                <Text style={{ color: 'blue' }}>홈으로 돌아가기</Text>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: 'white'
    },
    link: {
        marginTop: 15,
        paddingVertical: 15,
    },
});