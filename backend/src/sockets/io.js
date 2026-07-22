let ioInstance = null;

exports.setIo = (io) => {
    ioInstance = io;
};

exports.getIo = () => ioInstance;

exports.emitToUser = (userId, event, payload) => {
    if (ioInstance) {
        ioInstance.to(`user:${userId}`).emit(event, payload);
    }
};
