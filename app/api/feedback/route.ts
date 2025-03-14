import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, mobile, feedback } = await req.json();

    const response = await resend.emails.send({
      from: "fitnum.fit@gmail.com", // Use your verified email
      to: "fitnum.fit@gmail.com",
      subject: "New Feedback Received",
      text: `Name: ${name}\nMobile: ${mobile}\nFeedback: ${feedback}`,
    });

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { success: false, error: "Error sending email" },
      { status: 500 }
    );
  }
}
