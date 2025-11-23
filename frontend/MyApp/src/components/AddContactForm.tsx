import React, { useState } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet
} from "react-native";

interface AddContactFormProps {
    visible: boolean;
    onAdd: (email: string) => void;
    onCancel: () => void;
}

const AddContactForm = ({ visible, onAdd, onCancel }: AddContactFormProps) => {
    const [email, setEmail] = useState("");

    const handleAdd = () => {
        if (!email.trim()) return;
        onAdd(email.trim());
        setEmail("");
    };


    const handleCancel = () => {
        setEmail("");
        onCancel();
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>Add Contact</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Contact e-mail"
                        placeholderTextColor="#888"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                    />

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                            <Text style={styles.addText}>Add</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "85%",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        elevation: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 16,
        textAlign: "center",
        color: "#1a1a1a"
    },
    input: {
        backgroundColor: "#f2f2f2",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 20,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    cancelButton: {
        backgroundColor: "#ccc",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    cancelText: {
        color: "#333",
        fontSize: 16,
        fontWeight: "600"
    },
    addButton: {
        backgroundColor: "#007AFF",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    addText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700"
    }
});

export default AddContactForm;
