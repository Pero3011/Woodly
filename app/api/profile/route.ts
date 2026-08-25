import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET()
{
    const session = await getSession();
    
    if (!session)
    {
        return NextResponse.json({message: "Session Not Found", status: 500})           
    }

    return NextResponse.json({
      user_id: session.user_id,
      user_name:session.user_name, 
      role: session.role
    });
}