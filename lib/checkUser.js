import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  // console.log("Clerk User Data:", user);

  if (!user) {
    return null;
  }
  try {
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserID: user.id,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    const name = `${user.firstName} ${user.lastName}`;
    const NewUser = await db.user.create({
      data: {
        clerkUserID: user.id,
        name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
      }
    });

    return NewUser;
  } catch (error) {
    console.log(error.message)
  }
}