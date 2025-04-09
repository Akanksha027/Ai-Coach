"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function saveResume(content) {
  console.log("saveResume function called");

  const { userId } = await auth();
  console.log("User ID from auth:", userId);

  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserID: userId },
  });
  console.log("User fetched from DB:", user);

  if (!user) throw new Error("User not found");

  if (!content || typeof content !== "object") {
    throw new Error("Content must be a valid object");
  }

  try {
    const resume = await db.resume.upsert({
      where: {
        userId: user.id,
      },
      update: {
        content,
      },
      create: {
        userId: user.id,
        content,
      },
    });

    console.log("Resume saved successfully:", resume);
    revalidatePath("/resume");

    return resume;
  } catch (error) {
    console.error("Error saving resume:", error);
    throw new Error("Failed to save resume");
  }
}

export async function getResume() {
  console.log("getResume function called");

  const { userId } = await auth();
  console.log("User ID from auth:", userId);

  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserID: userId },
  });
  console.log("User fetched from DB:", user);

  if (!user) throw new Error("User not found");

  const resume = await db.resume.findUnique({
    where: {
      userId: user.id,
    },
  });

  console.log("Fetched resume:", resume);
  return resume;
}

export async function improveWithAI({ current, type }) {
  console.log("improveWithAI function called with:", { current, type });

  const { userId } = await auth();
  console.log("User ID from auth:", userId);

  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserID: userId },
    include: {
      industryInsight: true,
    },
  });
  console.log("User fetched from DB with industry insight:", user);

  if (!user) throw new Error("User not found");

  const prompt = `
    As an expert resume writer, improve the following ${type} description for a ${user.industry} professional.
    Make it more impactful, quantifiable, and aligned with industry standards.
    Current content: "${current}"

    Requirements:
    1. Use action verbs
    2. Include metrics and results where possible
    3. Highlight relevant technical skills
    4. Keep it concise but detailed
    5. Focus on achievements over responsibilities
    6. Use industry-specific keywords
    
    Format the response as a single paragraph without any additional text or explanations.
  `;

  console.log("Generated prompt:", prompt);

  try {
    const result = await model.generateContent(prompt);
    console.log("AI Model Response:", result);

    const response = result.response;
    const improvedContent = response.text().trim();

    console.log("Improved Content:", improvedContent);
    return improvedContent;
  } catch (error) {
    console.error("Error improving content:", error);
    throw new Error("Failed to improve content");
  }
}
