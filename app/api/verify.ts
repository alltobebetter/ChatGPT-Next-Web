import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    
    const recaptchaRes = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
      {
        method: "POST",
      }
    );

    const data = await recaptchaRes.json();
    
    return NextResponse.json({
      success: data.success,
      score: data.score,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "验证失败",
    });
  }
}
