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



        socket.on("FRIEND_REQUEST_SENT", (data) => {
            emitToUser(io, data.userRecieveRequest, "FRIEND_REQUEST_RECIEVED", {
                data: {
                    userSendRequest: data.userSendRequest.id,
                    userRecieveRequest: data.userRecieveRequest,
                },
                friendReq: data.friendReq,
                message: `${data.userSendRequest.firstName} ${data.userSendRequest.lastName} sent you a friend request`,
            });
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
                if (!senderId || !receiverId || !text?.trim()) {
                    return socket.emit("MESSAGE_ERROR", {
                        clientId,
                        message: "Invalid message data.",
                    });
                }

                const savedMessage = await Messages.createMessage({
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
