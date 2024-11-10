import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;
    
    const recaptchaRes = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
      { method: 'POST' }
    );

    const result = await recaptchaRes.json();
    
    return new Response(JSON.stringify({
      success: result.success,
      score: result.score
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: "ReCaptcha verification failed"
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
