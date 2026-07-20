export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const AGENT_LEVELS = [2, 3];

export async function POST(req: Request) {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const level = Number(session.user.level ?? 1);
    if (!AGENT_LEVELS.includes(level)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const agentId = Number(session.user.id);

    const body = await req.json();
    const { scheduleId, action } = body as {
      scheduleId: number;
      action: "approve" | "reject";
    };

    if (!scheduleId || !action) {
      return NextResponse.json({ error: "Missing scheduleId or action" }, { status: 400 });
    }

    // 해당 Schedule 조회 (unitId 포함)
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    // 이미 처리된 투어 요청인지 확인 (status 0만 처리 가능)
    if (schedule.status !== 0) {
      return NextResponse.json({ error: "Already processed" }, { status: 409 });
    }

    // 이 투어가 에이전트 담당 매물에 속하는지 확인
    const unit = await prisma.unit.findFirst({
      where: { id: schedule.unitId, agentId },
      select: { id: true, title: true },
    });

    if (!unit) {
      return NextResponse.json({ error: "Forbidden: not your listing" }, { status: 403 });
    }

    if (action === "reject") {
      await prisma.schedule.update({
        where: { id: scheduleId },
        data: { status: 3, lastUpdate: new Date() },
      });

      if (!schedule.userId && schedule.email) {
        console.log("[tour-action] Sending email to:", schedule.email);
        try {
          await sendEmail({
            to: schedule.email,
            subject: "Your tour request has been declined - RBS HOMES",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #333;">RBS HOMES</h1>
                </div>
                <p style="color: #666; margin-bottom: 20px;">
                  Hello, this is RBS HOMES.<br>
                  We regret to inform you that your tour request has been declined.
                </p>
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                  <h3 style="color: #333; margin-bottom: 10px;">Tour Request Details</h3>
                  <p style="color: #555; margin: 0;"><strong>Listing:</strong> ${unit.title}</p>
                </div>
                <p style="color: #666; margin: 20px 0;">
                  If you have any questions, please feel free to contact us or submit a new tour request.
                </p>
                <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; font-size: 12px; color: #999;">
                  <p>This email was sent automatically. Please do not reply to this email.</p>
                  <p>&copy; 2024 RBS HOMES. All rights reserved.</p>
                </div>
              </div>
            `,
          });
          console.log("[tour-action] Email sent successfully to:", schedule.email);
        } catch (emailErr: any) {
          console.error("[tour-action] Email failed:", emailErr?.message, emailErr);
        }
      }

      return NextResponse.json({ success: true, action: "rejected" });
    }

    if (action === "approve") {
      const confirmedDate = schedule.requestDate ?? schedule.date ?? new Date();
      const applicantName = schedule.username ?? schedule.email ?? "Unknown";
      const scheduleTitle = `Tour: ${unit.title} · ${applicantName}`;

      await prisma.$transaction([
        // Schedule 확정 (status=2, date=requestDate)
        prisma.schedule.update({
          where: { id: scheduleId },
          data: {
            status: 2,
            date: confirmedDate,
            lastUpdate: new Date(),
          },
        }),
        // AgentSchedule 자동 생성
        prisma.agentSchedule.create({
          data: {
            agentId,
            unitId: unit.id,
            title: scheduleTitle,
            date: confirmedDate,
            sourceScheduleId: scheduleId,
          },
        }),
      ]);

      if (!schedule.userId && schedule.email) {
        const formattedDate = confirmedDate.toLocaleString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
        const agentName = (session.user as any).name ?? "Your agent";
        const agentPhone = (session.user as any).phone ?? "";
        console.log("[tour-action] Sending email to:", schedule.email);
        try {
          await sendEmail({
            to: schedule.email,
            subject: "Your tour request is confirmed - RBS HOMES",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #333;">RBS HOMES</h1>
                </div>
                <p style="color: #666; margin-bottom: 20px;">
                  Hello, this is RBS HOMES.<br>
                  Great news! Your tour request has been confirmed.
                </p>
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                  <h3 style="color: #333; margin-bottom: 10px;">Tour Details</h3>
                  <p style="color: #555; margin: 4px 0;"><strong>Listing:</strong> ${unit.title}</p>
                  <p style="color: #555; margin: 4px 0;"><strong>Date:</strong> ${formattedDate}</p>
                  <p style="color: #555; margin: 4px 0;"><strong>Agent:</strong> ${agentName}</p>
                  ${agentPhone ? `<p style="color: #555; margin: 4px 0;"><strong>Contact:</strong> ${agentPhone}</p>` : ""}
                </div>
                <p style="color: #666; margin: 20px 0;">
                  Please arrive on time. If you need to reschedule or have any questions, contact your agent directly.
                </p>
                <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; font-size: 12px; color: #999;">
                  <p>This email was sent automatically. Please do not reply to this email.</p>
                  <p>&copy; 2024 RBS HOMES. All rights reserved.</p>
                </div>
              </div>
            `,
          });
          console.log("[tour-action] Email sent successfully to:", schedule.email);
        } catch (emailErr: any) {
          console.error("[tour-action] Email failed:", emailErr?.message, emailErr);
        }
      }

      return NextResponse.json({ success: true, action: "approved" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[POST /api/pms/tour-action]", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
