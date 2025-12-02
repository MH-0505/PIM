import React, { useState } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet
} from "react-native";

interface ConfirmLogoutProps {
    visible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const AddContactForm = ({ visible, onConfirm, onCancel }: ConfirmLogoutProps) => {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>Czy na pewno chcesz się wylogować?</Text>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                            <Text style={styles.cancelText}>Anuluj</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
                            <Text style={styles.addText}>Potwierdź</Text>
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
    confirmButton: {
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
