import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD;
  const supplied = request.headers.get("x-utility-password") || "";

  if (!expected || supplied !== expected) {
    return NextResponse.json(
      { error: "Incorrect utility password or server setup." },
      { status: 401 }
    );
  }

  const token = process.env.FACEBOOK_ACCESS_TOKEN;
  const version = process.env.GRAPH_API_VERSION || "v21.0";

  if (!token) {
    return NextResponse.json(
      { error: "Facebook API settings (FACEBOOK_ACCESS_TOKEN) are missing." },
      { status: 500 }
    );
  }

  let body: { userId?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request format." },
      { status: 400 }
    );
  }

  const userId = body.userId?.trim() || "";

  if (!/^\d+$/.test(userId)) {
    return NextResponse.json(
      { error: "Please enter a valid numeric user ID." },
      { status: 400 }
    );
  }

  try {
    const url = new URL(`https://graph.facebook.com/${version}/${userId}`);
    url.searchParams.set("fields", "id,name,username,link");

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      return NextResponse.json(
        {
          error:
            data.error?.message ||
            "Facebook did not allow this lookup (insufficient permissions or restricted account).",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { profile: data },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "Could not contact Facebook Graph API." },
      { status: 502 }
    );
  }
}
