class MatchingEngine {
    constructor(io) {
        this.io = io;
        this.queue = [];
        this.activeChats = new Map(); // roomId -> { users, ... }
    }

    joinQueue(socket, interests, uid) {
        const user = { socket, interests: interests || [], uid, joinTime: Date.now() };
        
        // 1. Try to find an interest match immediately
        const matchIndex = this.findInterestMatchIndex(user);
        
        if (matchIndex !== -1) {
            const matchedUser = this.queue.splice(matchIndex, 1)[0];
            this.createChat(user, matchedUser);
        } else {
            // 2. Add to queue and wait
            this.queue.push(user);
            this.checkQueuePeriodically(user);
        }
    }

    findInterestMatchIndex(newUser) {
        if (!newUser.interests || newUser.interests.length === 0) return -1;
        
        return this.queue.findIndex(userInQueue => {
            if (!userInQueue.interests) return false;
            return userInQueue.interests.some(interest => 
                newUser.interests.some(nInterest => nInterest.toLowerCase() === interest.toLowerCase())
            );
        });
    }

    checkQueuePeriodically(user) {
        const checkInterval = setInterval(() => {
            // User left the queue (disconnected or skipped)
            if (!this.queue.includes(user)) {
                clearInterval(checkInterval);
                return;
            }

            const timeWaiting = Date.now() - user.joinTime;
            
            // Re-check for interest match
            const matchIndex = this.findInterestMatchIndex(user);
            if (matchIndex !== -1 && this.queue[matchIndex] !== user) {
                const matchedUser = this.queue.splice(matchIndex, 1)[0];
                // Remove the current user from queue too
                const userIndex = this.queue.indexOf(user);
                if (userIndex !== -1) this.queue.splice(userIndex, 1);
                
                clearInterval(checkInterval);
                this.createChat(user, matchedUser);
                return;
            }

            // Fallback after 5 seconds: match with ANY available user
            if (timeWaiting >= 5000) {
                const otherUserIndex = this.queue.findIndex(u => u !== user);
                if (otherUserIndex !== -1) {
                    const matchedUser = this.queue.splice(otherUserIndex, 1)[0];
                    const userIndex = this.queue.indexOf(user);
                    if (userIndex !== -1) this.queue.splice(userIndex, 1);
                    
                    clearInterval(checkInterval);
                    this.createChat(user, matchedUser);
                    return;
                }
            }
        }, 1000); // Check every second
    }

    createChat(user1, user2) {
        const roomId = `room_${user1.socket.id}_${user2.socket.id}`;
        
        user1.socket.join(roomId);
        user2.socket.join(roomId);
        
        this.activeChats.set(roomId, {
            users: [user1.socket.id, user2.socket.id],
            createdAt: Date.now()
        });

        // Store roomId in sockets for easy access status
        user1.socket.roomId = roomId;
        user2.socket.roomId = roomId;

        this.io.to(user1.socket.id).emit('match_found', { roomId, peerUid: user2.uid });
        this.io.to(user2.socket.id).emit('match_found', { roomId, peerUid: user1.uid });
    }

    leaveQueue(socket) {
        const index = this.queue.findIndex(u => u.socket === socket);
        if (index !== -1) {
            this.queue.splice(index, 1);
        }
    }
    
    leaveChat(socket) {
        const roomId = socket.roomId;
        if (roomId) {
            socket.leave(roomId);
            // Notify peer
            this.io.to(roomId).emit('peer_disconnected');
            this.activeChats.delete(roomId);
            socket.roomId = null;
        }
    }
}

module.exports = MatchingEngine;
