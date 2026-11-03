import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/db/prisma.js";

// help to  delay messages creation
const minutesAgo = (n) => new Date(Date.now() - n * 60 * 1000);

async function main() {
    // hard reset
    await prisma.friendship.deleteMany()
    await prisma.chatMember.deleteMany()
    await prisma.message.deleteMany()
    await prisma.chat.deleteMany()
    await prisma.user.deleteMany()

    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    const userPassword = await bcrypt.hash("password123", 10);
    // create Admin
    const admin = await prisma.user.create({
        data:{
            firstname: "Aurel",
            lastname: "Charles",
            email: process.env.ADMIN_EMAIL,
            password: adminPassword,
            role : "ADMIN"
        }
    })
    const alice = await prisma.user.create({
        data:{
            firstname: "Alice",
            lastname: "Dawking",
            email: "alice@msg.com",
            password: userPassword
        }
    })
    const bob = await prisma.user.create({
        data:{
            firstname: "Bob",
            lastname: "Marley",
            email: "bob@msg.com",
            password: userPassword
        }
    })
    const chloe = await prisma.user.create({
        data:{
            firstname: "Chloe",
            lastname: "Dupont",
            email: "chloe@msg.com",
            password: userPassword
        }
    })

    await prisma.friendship.create({
        data: {
            requesterId: admin.id,
            receiverId: alice.id,
            status: "ACCEPTED"
        }
    })
    await prisma.friendship.create({
        data: {
            requesterId: bob.id,
            receiverId: admin.id,
        }
    })

    await prisma.chat.create({
        data:{
            isGroup: false,
            members: { create: [
                {userId: admin.id},
                {userId: alice.id}
            ]},
            messages: { create: [
                {content: "Hello Alice! how are you?", authorId: admin.id, createdAt: minutesAgo(10)},
                {content: "I'm doing good! Up to something today?", authorId: alice.id,  createdAt: minutesAgo(5)},
                {content: "Gonna grab a coffee , do you wana join?", authorId: admin.id} 
            ]}
        }
    })

    await prisma.chat.create({
        data:{
            isGroup: true,
            title: "Tame impala show!!",
            members: { create: [
                {userId: admin.id, chatRole: "ADMIN"},
                {userId: bob.id},
                {userId: chloe.id}
            ]},
            messages: { create: [
                {content: "Hi guys, Who wants to go see Tame Impala next month?", authorId: admin.id, createdAt: minutesAgo(10)},
                {content: "Hey I'm verry interested, what's the date already?", authorId: bob.id,  createdAt: minutesAgo(5)},
                {content: "I think its in the last saturday, should I ask Alice", authorId: chloe.id} 
            ]}
        }
    })

    console.log("🌱 Seed completed:");
    console.log("  admin       :", admin.email);
    console.log("  users       :", alice.email, bob.email, chloe.email);
    console.log("  friendships : 1 accepted (admin ↔ alice), 1 pending (bob → admin)");
    console.log("  chats       : 1 direct (admin ↔ alice, 3 messages), 1 group (admin, bob, chloe, 3 messages)");
}



main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());