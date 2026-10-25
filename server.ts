import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "15mb" }));

  // POST /api/brand-review
  app.post("/api/brand-review", async (req, res) => {
    try {
      const {
        title,
        format,
        channel,
        targetAudience,
        authorType,
        intendedPurpose,
        contentText,
        altText,
        imageUrl,
        retrievedGuidelines,
        currentDate,
      } = req.body;

      const ai = getAiClient();

      const parts: Array<
        | { text: string }
        | { inlineData: { mimeType: string; data: string } }
      > = [];

      // Attach image for Gemini Vision analysis if present
      if (imageUrl && typeof imageUrl === "string") {
        if (imageUrl.startsWith("data:image/")) {
          const match = imageUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
          if (match) {
            parts.push({
              inlineData: {
                mimeType: match[1],
                data: match[2],
              },
            });
          }
        } else if (imageUrl.startsWith("/src/assets/")) {
          const localPath = path.join(process.cwd(), imageUrl.replace(/^\//, ""));
          if (fs.existsSync(localPath)) {
            const fileBuffer = fs.readFileSync(localPath);
            const ext = path.extname(localPath).toLowerCase();
            const mimeType =
              ext === ".png"
                ? "image/png"
                : ext === ".webp"
                ? "image/webp"
                : "image/jpeg";
            parts.push({
              inlineData: {
                mimeType,
                data: fileBuffer.toString("base64"),
              },
            });
          }
        }
      }

      const guidelineContext = (retrievedGuidelines || [])
        .map(
          (g: {
            id: string;
            category: string;
            title: string;
            version: string;
            lastUpdated: string;
            expiryDate?: string;
            restricted?: boolean;
            content: string;
          }) =>
            `[SOURCE ID: ${g.id}]
Title: ${g.title}
Category: ${g.category}
Version: ${g.version} (Updated: ${g.lastUpdated}${
              g.expiryDate ? `, Expiry Date: ${g.expiryDate}` : ""
            })
Restricted/Confidential: ${g.restricted ? "YES (RESTRICTED)" : "NO"}
Rule Content: ${g.content}`
        )
        .join("\n\n---\n\n");

      const promptText = `You are BrandGuard, an explainable pre-publication brand-governance AI auditor for Nimbus Cloud.
Current Date for checking expired facts/claims: ${currentDate || "2026-10-24"}.

Analyze the following pre-publication content submission against the provided Approved Brand Knowledge Base sources.

SUBMISSION METADATA:
- Title: ${title || "Untitled"}
- Format: ${format || "text"}
- Channel: ${channel || "General"}
- Target Audience: ${targetAudience || "General"}
- Author Source: ${authorType || "Employee"}
- Creator's Intended Purpose (MUST PRESERVE THIS INTENT IN REWRITES): "${intendedPurpose || "Communicate product value clearly"}"
- Image Included: ${parts.length > 0 ? "Yes (analyze attached image using vision)" : "No"}
- Provided Image Alt Text: "${altText ? altText : "(MISSING - No alt text provided)"}"

CONTENT TEXT / CAPTION TO AUDIT:
"""
${contentText || ""}
"""

APPROVED KNOWLEDGE BASE SOURCES (RETRIEVED):
${guidelineContext}

AUDIT INSTRUCTIONS:
1. Detect and categorize every issue across these exact 8 categories:
   - "Tone & Voice"
   - "Terminology" (banned/non-preferred terms)
   - "Messaging Inconsistency"
   - "Unsupported Claim" (exaggerated claims like "best", "#1", "100% secure", "100% uptime", or unverified stats)
   - "Outdated Information" (compare against approved facts and expiry dates relative to ${currentDate || "2026-10-24"})
   - "Visual Consistency" (for attached images: off-palette colors like neon magenta/yellow, logo stretching/misuse, low contrast, text-heavy layout)
   - "Accessibility" (missing/insufficient alt text when an image is present, low color contrast in image, dense jargon, all-caps multi-word shouting, emoji-only meaning)
   - "Confidential Leakage" (mentions of restricted codenames, unreleased products, NDA partners, or internal financial metrics)
2. For text issues, "flaggedTextOrRegion" MUST be an EXACT, verbatim substring from the CONTENT TEXT so it can be highlighted and replaced automatically. For image/visual or missing alt-text issues where the issue is on the visual canvas, start "flaggedTextOrRegion" with "[Visual Region: ...]" or if it also appears in the caption text, match the exact caption substring.
3. NEVER invent facts. If a statistical or promotional claim is not backed by any Approved Fact in the Knowledge Base, mark isUnverifiedClaim = true and include "Unverified – needs evidence" in the explanation/quotedRule.
4. PRIVACY & RESTRICTED SOURCES: If a finding violates a Confidential/Restricted source, flag it as "Confidential Leakage" with severity "critical", explain that it references restricted pre-release/NDA material, and ensure "suggestedRewrite" removes the confidential detail completely without leaking other restricted secrets.
5. Every "suggestedRewrite" must directly replace "flaggedTextOrRegion" (or provide compliant copy/alt-text) while preserving the creator's Intended Purpose: "${intendedPurpose || "Communicate product value clearly"}".
6. Calculate an overall Brand Compliance Score (0-100), where 100 is fully compliant, critical issues deduct 18-25 points, major issues deduct 10-14 points, and minor issues deduct 4-7 points.
7. Set "needsHumanReview" to true if any finding has confidence < 75, severity === "critical", or isLegalSensitive === true.`;

      parts.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: { parts },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallScore: {
                type: Type.INTEGER,
                description: "Overall Brand Compliance Score from 0 to 100.",
              },
              summary: {
                type: Type.STRING,
                description: "Concise 2-sentence executive summary of the audit results and routing recommendation.",
              },
              needsHumanReview: {
                type: Type.BOOLEAN,
                description: "True when confidence is low (<75), any finding is critical, or claims are legal-sensitive.",
              },
              escalationReason: {
                type: Type.STRING,
                description: "Clear explanation of why human review or Brand Manager escalation is required.",
              },
              findings: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    category: {
                      type: Type.STRING,
                      description:
                        "Must be one of: Tone & Voice, Terminology, Messaging Inconsistency, Unsupported Claim, Outdated Information, Visual Consistency, Accessibility, Confidential Leakage",
                    },
                    severity: {
                      type: Type.STRING,
                      description: "Must be one of: critical, major, minor",
                    },
                    flaggedTextOrRegion: {
                      type: Type.STRING,
                      description:
                        "Exact verbatim substring from contentText (or '[Visual Region: ...]' for image-only issues).",
                    },
                    explanation: {
                      type: Type.STRING,
                      description: "Plain-English explanation of WHY this violates brand governance.",
                    },
                    sourceId: {
                      type: Type.STRING,
                      description: "ID of the Knowledge Base rule violated (e.g. BG-102, FC-203) or UNVERIFIED.",
                    },
                    sourceName: {
                      type: Type.STRING,
                      description: "Name of the cited guideline/fact source.",
                    },
                    sourceVersion: {
                      type: Type.STRING,
                      description: "Version string of the cited source, e.g. v2.4.",
                    },
                    quotedRule: {
                      type: Type.STRING,
                      description:
                        "Exact quoted rule passage from the source, or 'Unverified – needs evidence' if no source supports the claim.",
                    },
                    confidence: {
                      type: Type.INTEGER,
                      description: "Confidence level from 0 to 100.",
                    },
                    suggestedRewrite: {
                      type: Type.STRING,
                      description:
                        "Drop-in replacement text (or actionable visual/alt-text fix) that preserves the creator's intended purpose.",
                    },
                    isLegalSensitive: {
                      type: Type.BOOLEAN,
                      description: "True if this involves legal, SLA, security compliance, or confidential NDA liability.",
                    },
                    isUnverifiedClaim: {
                      type: Type.BOOLEAN,
                      description: "True if no approved source in the knowledge base supports this claim.",
                    },
                  },
                  required: [
                    "id",
                    "category",
                    "severity",
                    "flaggedTextOrRegion",
                    "explanation",
                    "sourceId",
                    "sourceName",
                    "sourceVersion",
                    "quotedRule",
                    "confidence",
                    "suggestedRewrite",
                    "isLegalSensitive",
                    "isUnverifiedClaim",
                  ],
                },
              },
            },
            required: [
              "overallScore",
              "summary",
              "needsHumanReview",
              "escalationReason",
              "findings",
            ],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) {
        return res.status(502).json({
          error: "Gemini returned an empty response. Please retry the review.",
        });
      }

      const parsed = JSON.parse(rawText.trim());
      return res.json(parsed);
    } catch (error: unknown) {
      console.error("Brand review error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to run AI Brand Review.";
      return res.status(500).json({ error: message });
    }
  });

  // POST /api/draft-clarification
  app.post("/api/draft-clarification", async (req, res) => {
    try {
      const { guideline, rejectionReasons, overrideComments } = req.body;
      const ai = getAiClient();

      const prompt = `You are assisting a Brand Manager in improving an ambiguous or frequently overridden brand guideline in BrandGuard.

CURRENT GUIDELINE:
- ID: ${guideline?.id}
- Title: ${guideline?.title}
- Current Version: ${guideline?.version}
- Current Rule Text: "${guideline?.content}"

CREATOR REJECTION REASONS:
${(rejectionReasons || []).map((r: string) => `- "${r}"`).join("\n") || "- None recorded"}

REVIEWER OVERRIDE COMMENTS:
${(overrideComments || []).map((c: string) => `- "${c}"`).join("\n") || "- None recorded"}

Draft a clear, unambiguous updated version of this guideline that resolves the friction between creators/reviewers and brand policy while maintaining Nimbus Cloud's brand integrity.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              diagnosis: {
                type: Type.STRING,
                description: "1-2 sentences explaining why creators/reviewers are pushing back on the current wording.",
              },
              suggestedClarification: {
                type: Type.STRING,
                description: "Complete revised guideline text ready to replace the current rule.",
              },
              proposedVersion: {
                type: Type.STRING,
                description: "Incremented version number (e.g., v2.5).",
              },
              exampleDo: {
                type: Type.STRING,
                description: "Concrete approved example following the clarified rule.",
              },
              exampleDont: {
                type: Type.STRING,
                description: "Concrete non-compliant example.",
              },
            },
            required: [
              "diagnosis",
              "suggestedClarification",
              "proposedVersion",
              "exampleDo",
              "exampleDont",
            ],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) {
        return res.status(502).json({ error: "Empty response from Gemini." });
      }
      return res.json(JSON.parse(rawText.trim()));
    } catch (error: unknown) {
      console.error("Draft clarification error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to draft guideline clarification.";
      return res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BrandGuard server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
