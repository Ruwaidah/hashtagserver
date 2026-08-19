import Messages from "../models/messages-model.js";

const socketIds = new Map();

const addSocket = (userId, socketId) => {
    const uid = String(userId);
    if (!socketIds.has(uid)) socketIds.set(uid, new Set());
    socketIds.get(uid).add(socketId);
};

const removeSocket = (userId, socketId) => {
    const uid = String(userId);
    const set = socketIds.get(uid);
    if (!set) return;
    set.delete(socketId);
    if (set.size === 0) socketIds.delete(uid);
};

const emitToUser = (io, userId, event, payload) => {
    const set = socketIds.get(String(userId));
    if (!set) return;
    for (const sid of set) io.to(sid).emit(event, payload);
};

export const registerSocketHandlers = (io) => {
    io.on("connection", (socket) => {
        const userId = socket.handshake.auth?.userId;
        if (!userId) return;

        socket.data.userId = String(userId);
        addSocket(userId, socket.id);


        // Friend request sent
        socket.on("FRIEND_REQUEST_SENT", (data) => {
            emitToUser(
                io,
                data.userRecieveRequest,
                "FRIEND_REQUEST_RECEIVED",
                {
                    data: {
                        userSendRequest: data.userSendRequest.id,
                        userRecieveRequest: data.userRecieveRequest,
                    },
                    friendReq: data.friendReq,
                    message: `${data.userSendRequest.firstName} ${data.userSendRequest.lastName} sent you a friend request`,
                }
            );
        });

        // Friend request cancel
        socket.on("FRIEND_REQUEST_CANCELLED", (data) => {
            const {
                userCancellingId,
                otherUserId,
            } = data;

            const payload = {
                userCancellingId,
                otherUserId,
            };

            emitToUser(
                io,
                otherUserId,
                "FRIEND_REQUEST_CANCELLED_LIVE",
                payload
            );

            emitToUser(
                io,
                userCancellingId,
                "FRIEND_REQUEST_CANCELLED_LIVE",
                payload
            );
        });

        // Friend request accepted
        socket.on("FRIEND_REQUEST_ACCEPTED", (data) => {
            const {
                userAcceptingId,
                userRequestingId,
                acceptingUser,
                requestingUser,
            } = data;

            emitToUser(
                io,
                userRequestingId,
                "FRIEND_REQUEST_ACCEPTED_LIVE",
                {
                    userAcceptingId,
                    userRequestingId,
                    friend: acceptingUser,
                }
            );

            emitToUser(
                io,
                userAcceptingId,
                "FRIEND_REQUEST_ACCEPTED_LIVE",
                {
                    userAcceptingId,
                    userRequestingId,
                    friend: requestingUser,
                }
            );
        });

        // Friend request rejected
        socket.on("FRIEND_REQUEST_REJECTED", (data) => {
            console.log("BACKEND RECEIVED REJECT:", data);

            const {
                userRejectingId,
                userRequestingId,
            } = data;

            const payload = {
                userRejectingId,
                userRequestingId,
            };

            emitToUser(
                io,
                userRequestingId,
                "FRIEND_REQUEST_REJECTED_LIVE",
                payload
            );

            emitToUser(
                io,
                userRejectingId,
                "FRIEND_REQUEST_REJECTED_LIVE",
                payload
            );
        });

        // Friend deleted
        socket.on("FRIEND_DELETED", (data) => {
            const {
                userId,
                friendId,
            } = data;

            const payload = {
                userId,
                friendId,
            };

            emitToUser(
                io,
                friendId,
                "FRIEND_DELETED_LIVE",
                payload
            );

            emitToUser(
                io,
                userId,
                "FRIEND_DELETED_LIVE",
                payload
            );
        });

        //  Send message
        socket.on("SEND_MESSAGE", async (data) => {
            const {
                senderId,
                receiverId,
                text,
                clientId,
            } = data;

            try {
                const authenticatedUserId = Number(socket.data.userId);

                if (
                    !authenticatedUserId ||
                    authenticatedUserId !== Number(senderId)
                ) {
                    return socket.emit("MESSAGE_ERROR", {
                        clientId,
                        message: "Unauthorized sender.",
                    });
                }

                if (
                    !receiverId ||
                    !text?.trim()
                ) {
                    return socket.emit("MESSAGE_ERROR", {
                        clientId,
                        message: "Invalid message.",
                    });
                }

                const usersAreFriends = await Messages.areFriends(
                    Number(senderId),
                    Number(receiverId)
                );

                if (!usersAreFriends) {
                    return socket.emit("MESSAGE_ERROR", {
                        clientId,
                        message:
                            "You must be friends before sending messages.",
                    });
                }

                const savedMessage =
                    await Messages.createMessage({
                        senderId: Number(senderId),
                        receiverId: Number(receiverId),
                        text: text.trim(),
                    });

                const messagePayload = {
                    ...savedMessage,
                    clientId,
                };

                emitToUser(
                    io,
                    senderId,
                    "NEW_MESSAGE",
                    messagePayload
                );

                emitToUser(
                    io,
                    receiverId,
                    "NEW_MESSAGE",
                    messagePayload
                );
            } catch (error) {
                console.error("SEND_MESSAGE error:", error);

                socket.emit("MESSAGE_ERROR", {
                    clientId,
                    message: "Unable to send message.",
                });
            }
        });

        socket.on("disconnect", () => {
            removeSocket(socket.data.userId, socket.id);
        });
    });
};
