import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const RegisterScreen = ({ navigation }: any) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = () => {
        if (username && password && confirmPassword) {
            if (password !== confirmPassword) {
                Alert.alert('Błąd', 'Hasło i potwierdzenie hasła muszą być takie same');
                return;
            }
            setLoading(true);

            setTimeout(() => {
                setLoading(false);
                navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
                });
            }, 1000);
        } else {
            Alert.alert('Błąd', 'Wpisz nazwę użytkownika, hasło oraz potwierdź hasło');
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Zarejestruj się</Text>

            </View>

            {/* Form */}
            <View style={styles.formContainer}>
                <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Nazwa użytkownika</Text>
                    <TextInput
                        placeholder="Username"
                        style={styles.input}
                        value={username}
                        onChangeText={setUsername}
                        placeholderTextColor="#999"
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
                        placeholder="Password"
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
                        {loading ? 'Rejestrowanie...' : 'Zarejestruj'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Footer */}
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
        justifyContent: 'space-between',
        paddingVertical: 40,
    },
    header: {
        marginTop: 30,
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 8,
        textAlign: 'center',

    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        fontWeight: '400',
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
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
        shadowOpacity: 0.1,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: '#666',
        fontSize: 14,
    },
    footerLink: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default RegisterScreen;