import { Icons } from "@/components/icons";
import { siteConfig } from "@/lib/config";
import { normalizeBaseUrl } from "@/lib/url";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const postTitle = searchParams.get("title") || siteConfig.description;
  const imageParam = searchParams.get("image");
  const baseUrl = normalizeBaseUrl(siteConfig.url);
  const safeImageUrl =
    imageParam && (imageParam.startsWith("https://") || imageParam.startsWith("http://"))
      ? imageParam
      : null;
  const font = fetch(
    new URL("../../../assets/fonts/Inter-SemiBold.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());
  const fontData = await font;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "64px",
          backgroundColor: "#0f172a",
          backgroundImage: "linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #0f172a 100%)",
          fontSize: 32,
          fontWeight: 600,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            maxWidth: "58%",
            color: "#f8fafc",
            gap: "20px",
          }}
        >
          <Icons.logo style={{ width: "56px", height: "56px" }} />
          <div
            style={{
              fontSize: "64px",
              fontWeight: "700",
              lineHeight: "1.05",
              letterSpacing: "-0.04em",
            }}
          >
            {postTitle}
          </div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: "500",
              color: "#cbd5f5",
            }}
          >
            {siteConfig.name}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "34%",
            height: "100%",
          }}
        >
          {safeImageUrl ? (
            <img
              src={safeImageUrl}
              alt="Genmoji preview"
              width={420}
              height={420}
              style={{
                borderRadius: 48,
                background: "#0b1220",
                border: "6px solid rgba(148, 163, 184, 0.35)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
              }}
            />
          ) : (
            <img
              src={`${baseUrl}/logo.png`}
              alt={`${siteConfig.name} logo`}
              width={360}
              height={360}
              style={{
                borderRadius: 48,
                background: "#0b1220",
                border: "6px solid rgba(148, 163, 184, 0.35)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
              }}
            />
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Inter",
          data: fontData,
          style: "normal",
        },
      ],
    }
  );
}
