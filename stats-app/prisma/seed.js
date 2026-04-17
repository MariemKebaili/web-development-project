const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {

  // ----- Create Users -----
  const u1 = await prisma.user.create({
    data: {
      username:  "ahmed",
      email:     "a@mail.com",
      password:  "ahmed123",
      name:      "Ahmed",
      bio:       "Avid reader 📚",
      photo:     "",
      followers: "[]",
      following: JSON.stringify(["sara"]),
    }
  });

  const u2 = await prisma.user.create({
    data: {
      username:  "sara",
      email:     "s@mail.com",
      password:  "sara1234",
      name:      "Sara",
      bio:       "Books are my escape 🌙",
      photo:     "",
      followers: JSON.stringify(["ahmed"]),
      following: "[]",
    }
  });

  const u3 = await prisma.user.create({
    data: {
      username:  "mohamed",
      email:     "m@mail.com",
      password:  "moh12345",
      name:      "Mohamed",
      bio:       "Reading one page at a time",
      photo:     "",
      followers: "[]",
      following: "[]",
    }
  });

  // ----- Create Posts -----
  await prisma.post.createMany({
    data: [
      {
        text:        "Not all those who wander are lost.",
        author:      "ahmed",
        authorInput: "J.R.R. Tolkien",
        bookInput:   "The Fellowship of the Ring",
        likedBy:     JSON.stringify(["sara"]),
        comments:    "[]",
        timestamp:   BigInt(Date.now() - 1000 * 60 * 60 * 2),
      },
      {
        text:        "It does not do to dwell on dreams and forget to live.",
        author:      "ahmed",
        authorInput: "J.K. Rowling",
        bookInput:   "Harry Potter and the Sorcerer's Stone",
        likedBy:     "[]",
        comments:    JSON.stringify([
          { author: "sara", text: "Love this quote!", likedBy: [] }
        ]),
        timestamp:   BigInt(Date.now() - 1000 * 60 * 30),
      },
      {
        text:        "So it goes.",
        author:      "sara",
        authorInput: "Kurt Vonnegut",
        bookInput:   "Slaughterhouse-Five",
        likedBy:     "[]",
        comments:    "[]",
        timestamp:   BigInt(Date.now() - 1000 * 60 * 60 * 5),
      },
      {
        text:        "The world is a book, and those who do not travel read only one page.",
        author:      "mohamed",
        authorInput: "Saint Augustine",
        bookInput:   "",
        likedBy:     "[]",
        comments:    "[]",
        timestamp:   BigInt(Date.now() - 1000 * 60 * 60 * 24),
      },
    ]
  });

  console.log("✅ Seed complete!");
  console.log("   ahmed   / ahmed123");
  console.log("   sara    / sara1234");
  console.log("   mohamed / moh12345");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
