import React, { useState, useEffect, useCallback } from 'react';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import AntDesign from '@react-native-vector-icons/ant-design';


import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from "@env";

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
            Alert.alert("Nie twoja tura!");
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
                Alert.alert("Gra zakończona", "Zwycięzca: " + data.winner);
            } else if (data.status === "DRAW") {
                Alert.alert("Remis!", "Nie ma zwycięzcy.");
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
                    {value === "EMPTY" ? "" : value === "X" ?
                        <AntDesign name="close" size={64} color="red" />
                        : value === "O" ?
                        <FontAwesome5 name="circle" size={64} color="blue" />
                        :
                        ""}
                </Text>
            </TouchableOpacity>
        );
    };

    const turnInfoStyle = () => {
        if (!game) return {};

        const { current_turn, player_1: p1Id, player_2: p2Id, player_1_symbol: p1Sym, player_2_symbol: p2Sym } = game;

        let symbol;

        if (current_turn === p1Id) {
            symbol = p1Sym;
        } else if (current_turn === p2Id) {
            symbol = p2Sym;
        } else {
            if (currentUserId === p1Id) {
                symbol = p1Sym;
            } else if (currentUserId === p2Id) {
                symbol = p2Sym;
            } else {
                symbol = "X";
            }
        }

        return {
            backgroundColor: symbol === "X" ? "#FF5D5D" : "#5D5DFF"
        };
    };

    return (
        <View style={[styles.container]}>
            <View style={{width: "100%", paddingLeft: 48, display: "flex"}}>
                <View style={[styles.turnTextContainer, turnInfoStyle()]}>
                    <Text style={styles.turnText}>
                        {game.is_finished
                            ? game.winner
                                ? `Zwycięzca: ${game.winner}`
                                : "Remis!"
                            : currentUserId === game.current_turn
                                ? "Twoja tura"
                                : "Tura przeciwnika"
                        }
                    </Text>
                </View>
            </View>



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
    turnTextContainer: {
        backgroundColor: "#FF5D5D",
        padding: 10,
        borderRadius: 8,
        marginBottom: 20,
        alignSelf: "flex-start"
    },
    turnText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    board: {
        justifyContent: "center"
    },
    row: {
        flexDirection: "row"
    },
    cell: {
        width: 100,
        height: 100,
        borderWidth: 1,
        margin: 4,
        borderColor: "#999",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff"
    },
    cellText: {
        fontSize: 40,
        fontWeight: "bold"
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
