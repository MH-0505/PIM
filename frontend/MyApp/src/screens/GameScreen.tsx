import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = "http://192.168.0.32:8000/api";

type Game = {
    game_id: string;
    player_1: string;
    player_2: string;
    player_1_symbol: "X" | "O";
    player_2_symbol: "X" | "O";
    current_turn: string;
    is_finished: boolean;
    winner: string | null;
    board: Record<string, string>;
};

const GameScreen = ({ route }: any) => {
    const { player1Id, player2Id } = route.params;

    const [game, setGame] = useState<Game | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string>("");


    useEffect(() => {
        (async () => {
            const uid = await AsyncStorage.getItem("user_id");
            if (uid) setCurrentUserId(uid);
        })();
    }, []);


    const fetchGame = useCallback(async (): Promise<void> => {
        try {
            const token = await AsyncStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/game/?player_1_id=${player1Id}&player_2_id=${player2Id}`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": "Bearer " + token
                    }
                }
            );

            if (response.status === 404) {
                console.log("Game does not exist → creating...");

                const createRes = await fetch(`${API_URL}/game/create`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + token
                    },
                    body: JSON.stringify({
                        player_1_id: player1Id,
                        player_2_id: player2Id
                    })
                });

                if (createRes.ok) {
                    console.log("Game created!");
                    fetchGame();
                    return;
                }
            }

            if (!response.ok) return;

            const data = await response.json();
            setGame(data);

        } catch (err) {
            console.log("Error loading game:", err);
        }
    }, [player1Id, player2Id]);


    useEffect(() => {
        fetchGame();
        const interval = setInterval(fetchGame, 1200);
        return () => clearInterval(interval);
    }, [fetchGame]);


    const makeMove = async (field: number) => {
        if (!game) return;
        if (game.is_finished) return;

        if (game.current_turn !== currentUserId) {
            Alert.alert("Not your turn!");
            return;
        }

        try {
            const token = await AsyncStorage.getItem("token");

            const response = await fetch(`${API_URL}/game/move`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    game_id: game.game_id,
                    player_id: currentUserId,
                    field: field
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.log("Move error:", data);
                return;
            }

            fetchGame();

            if (data.status === "WIN") {
                Alert.alert("Game Over", "Winner: " + data.winner);
            } else if (data.status === "DRAW") {
                Alert.alert("Draw!", "Nobody wins.");
            }

        } catch {
            console.log("Connection error making move.");
        }
    };

    const restartGame = async () => {
        if (!game) return;

        try {
            const token = await AsyncStorage.getItem("token");

            const response = await fetch(`${API_URL}/game/restart`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    game_id: game.game_id
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.log("Restart error:", data);
                Alert.alert("Error restarting game");
                return;
            }

            fetchGame();

        } catch (err) {
            console.log("Connection error restarting game:", err);
        }
    };


    if (!game) {
        return (
            <View style={styles.centered}>
                <Text style={styles.loadingText}>Loading game...</Text>
            </View>
        );
    }

    const renderCell = (index: number) => {
        const fieldName = `field_${index}` as keyof typeof game.board;
        const value = game.board[fieldName];

        return (
            <TouchableOpacity
                key={index}
                style={styles.cell}
                onPress={() => makeMove(index)}
                disabled={value !== "EMPTY" || game.is_finished}
            >
                <Text style={styles.cellText}>
                    {value === "EMPTY" ? "" : value}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>

            <Text style={styles.turnText}>
                {game.is_finished
                    ? game.winner
                        ? `Winner: ${game.winner}`
                        : "Draw!"
                    : currentUserId === game.current_turn
                        ? "Your turn"
                        : "Opponent's turn"
                }
            </Text>

            <View style={styles.board}>
                <View style={styles.row}>
                    {renderCell(1)}
                    {renderCell(2)}
                    {renderCell(3)}
                </View>
                <View style={styles.row}>
                    {renderCell(4)}
                    {renderCell(5)}
                    {renderCell(6)}
                </View>
                <View style={styles.row}>
                    {renderCell(7)}
                    {renderCell(8)}
                    {renderCell(9)}
                </View>
            </View>

            {game.is_finished && (
                <TouchableOpacity style={styles.restartButton} onPress={restartGame}>
                    <Text style={styles.restartText}>Restart</Text>
                </TouchableOpacity>
            )}


        </View>
    );
};

export default GameScreen;


//style

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fc",
        alignItems: "center",
        paddingTop: 40
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    loadingText: {
        fontSize: 18,
        color: "#555"
    },
    turnText: {
        fontSize: 22,
        fontWeight: "600",
        marginBottom: 20,
        color: "#333"
    },
    board: {
        width: 300,
        height: 300,
        backgroundColor: "#fff",
        borderWidth: 3,
        borderColor: "#333",
        justifyContent: "center"
    },
    row: {
        flexDirection: "row"
    },
    cell: {
        width: 100,
        height: 100,
        borderWidth: 1,
        borderColor: "#999",
        justifyContent: "center",
        alignItems: "center"
    },
    cellText: {
        fontSize: 40,
        fontWeight: "bold",
        color: "#333"
    },
    restartButton: {
        marginTop: 25,
        paddingVertical: 12,
        paddingHorizontal: 30,
        backgroundColor: "#007AFF",
        borderRadius: 8
    },
    restartText: {
        color: "white",
        fontSize: 18,
        fontWeight: "600"
    }

});
