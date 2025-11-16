import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const API_URL = "http://192.168.0.32:8000/api";

const RegisterScreen = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!email || !password || !confirmPassword) {
            return Alert.alert("Błąd", "Wszystkie pola są wymagane.");
        }

        if (password !== confirmPassword) {
            return Alert.alert("Błąd", "Hasła muszą być takie same.");
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/users/create/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setLoading(false);
                return Alert.alert("Błąd", JSON.stringify(data));
            }

            Alert.alert("Sukces", "Rejestracja zakończona!");
            navigation.navigate("Login");

        } catch (error) {
            Alert.alert("Błąd", "Nie udało się połączyć z serwerem.");
        }

        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Zarejestruj się</Text>
            </View>

            <View style={styles.formContainer}>
                <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        placeholder="Email"
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholderTextColor="#999"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Hasło</Text>
                    <TextInput
                        placeholder="Password"
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholderTextColor="#999"
                    />
                </View>

                <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Potwierdź hasło</Text>
                    <TextInput
                        placeholder="Confirm Password"
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        placeholderTextColor="#999"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? "Rejestrowanie..." : "Zarejestruj"}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.footerLink}>Powróć do logowania</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    header: {
        marginTop: 20,
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1a1a1a',
        textAlign: 'center',
    },
    formContainer: {
        marginBottom: 40,
    },
    inputWrapper: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#1a1a1a',
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 12,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonDisabled: {
        backgroundColor: '#b3d9ff',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    footer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerLink: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default RegisterScreen;
